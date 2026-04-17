const API = "https://aitaylor.onrender.com";

let user = {};
let classId = null;
let messages = [];

// 🔥 UNIQUE USER
function getUserId() {
  let id = localStorage.getItem("user_id");

  if (!id) {
    id = "user-" + Math.random().toString(36).substring(2);
    localStorage.setItem("user_id", id);
  }

  return id;
}

// 🔥 SESSION
function restoreSession() {
  const saved = localStorage.getItem("session");
  if (!saved) return false;

  const data = JSON.parse(saved);
  user = data.user;
  classId = data.classId;

  return true;
}

function saveSession() {
  localStorage.setItem("session", JSON.stringify({ user, classId }));
}

// ROLE
function chooseRole(role) {
  document.getElementById("entry").style.display = "none";
  const box = document.getElementById("auth");
  box.style.display = "block";

  if (role === "educator") {
    box.innerHTML = `
      <h3>Create Class</h3>
      <input id="tname" placeholder="Name">
      <input id="tpass" placeholder="Password">
      <button onclick="createClass()">Create</button>

      <h3>Login</h3>
      <input id="cid" placeholder="Class code">
      <input id="lpass" placeholder="Password">
      <button onclick="loginClass()">Login</button>
    `;
  }

  if (role === "student") {
    box.innerHTML = `
      <h3>Join</h3>
      <input id="sname" placeholder="Name">
      <input id="scode" placeholder="Class code">
      <button onclick="joinClass()">Join</button>
    `;
  }
}

// CREATE
async function createClass() {
  const teacher_name = document.getElementById("tname").value;
  const password = document.getElementById("tpass").value;

  const res = await fetch(API + "/api/class/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacher_name, password }),
  });

  const data = await res.json();

  user = { name: teacher_name, role: "educator" };
  classId = data.classId;

  alert("Class: " + classId);

  saveSession();
  startApp();
}

// LOGIN
async function loginClass() {
  const class_id = document.getElementById("cid").value;
  const password = document.getElementById("lpass").value;

  const res = await fetch(API + "/api/class/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ classId: class_id, password }),
  });

  const data = await res.json();

  user = { name: data.teacher_name, role: "educator" };
  classId = class_id;

  saveSession();
  startApp();
}

// JOIN (FIXED)
async function joinClass() {
  const name = document.getElementById("sname").value;
  const class_id = document.getElementById("scode").value;

  await fetch(API + "/api/student/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, class_id }),
  });

  user = { name, role: "student", id: getUserId() };
  classId = class_id;

  saveSession();
  startApp();
}

// START
function startApp() {
  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("info").innerText =
    `${user.name} | ${user.role} | ${classId}`;

  if (user.role === "educator") {
    loadDashboard();
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("chatSection").style.display = "none";
  } else {
    loadProgress();
  }
}

// DASHBOARD (FIXED)
async function loadDashboard() {
  const students = await fetch(API + "/api/students/" + classId).then(r => r.json());
  const progress = await fetch(API + "/api/progress/" + classId).then(r => r.json());

  document.getElementById("studentList").innerHTML = `
    <h3>Total: ${students.length}</h3>

    ${students.map(s => {
      const p = progress.find(x => x.student_name === s.name);

      let status = "not started";
      if (p) status = p.status;

      return `
        <div style="border:1px solid #ccc; padding:10px; margin:10px;">
          <b>${s.name}</b> → ${status}
          ${p ? `<button onclick="view('${s.name}')">View</button>` : ""}
        </div>
      `;
    }).join("")}
  `;
}

// VIEW
function view(name) {
  fetch(API + "/api/progress/" + classId)
    .then(r => r.json())
    .then(data => {
      const s = data.find(x => x.student_name === name);
      alert(JSON.stringify(s.messages, null, 2));
    });
}

// CHAT
async function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value;

  messages.push({ role: "user", content: text });
  input.value = "";

  renderChat();

  const res = await fetch(API + "/api/chat", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ messages })
  });

  const data = await res.json();
  const reply = data.choices[0].message.content;

  messages.push({ role: "assistant", content: reply });

  renderChat();

  await fetch(API + "/api/progress/save", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      student_name: user.name,
      class_id: classId,
      messages
    })
  });
}

// LOAD PROGRESS
async function loadProgress() {
  const data = await fetch(API + "/api/progress/" + classId).then(r => r.json());
  const mine = data.find(d => d.student_name === user.name);

  if (mine) {
    messages = mine.messages;
    renderChat();
  }
}

// RENDER
function renderChat() {
  document.getElementById("chatLog").innerHTML =
    messages.map(m => `<p><b>${m.role}:</b> ${m.content}</p>`).join("");
}

// SUBMIT (FIXED)
async function submitChat() {
  await fetch(API + "/api/submit", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      student_name: user.name,
      class_id: classId,
      messages
    })
  });

  alert("Submitted");
}

// INIT
window.onload = () => {
  if (restoreSession()) {
    startApp();
  }
};
