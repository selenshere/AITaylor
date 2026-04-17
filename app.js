const API = "https://aitaylor.onrender.com";

let user = {};
let classId = null;
let messages = [];

// ROLE SELECT
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

// CREATE CLASS
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

  startApp();
}

// JOIN
async function joinClass() {
  const name = document.getElementById("sname").value;
  const class_id = document.getElementById("scode").value;

  await fetch(API + "/api/student/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, class_id }),
  });

  user = { name, role: "student" };
  classId = class_id;

  startApp();
}

// START
function startApp() {
  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("info").innerText =
    `${user.name} | ${user.role} | ${classId}`;

  if (user.role === "educator") {
    loadStudents();
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("chatSection").style.display = "none";
  }
}

// LOAD STUDENTS
async function loadStudents() {
  const res = await fetch(API + "/api/students/" + classId);
  const data = await res.json();

  document.getElementById("studentList").innerHTML =
    data.map(s => `<p>${s.name}</p>`).join("");
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
}

// RENDER
function renderChat() {
  document.getElementById("chatLog").innerHTML =
    messages.map(m => `<p><b>${m.role}:</b> ${m.content}</p>`).join("");
}

// SUBMIT
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
