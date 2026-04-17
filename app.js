const API = "https://aitaylor.onrender.com";

let user, classId, messages = [];

// 🔐 USER
function initUser() {
  let saved = localStorage.getItem("user");

  if (!saved) {
    const name = prompt("Enter your name:");
    const role = prompt("Role: educator or student");

    user = {
      id: crypto.randomUUID(),
      name,
      role
    };

    localStorage.setItem("user", JSON.stringify(user));
  } else {
    user = JSON.parse(saved);
  }
}

// 🏫 CLASS (KALICI)
function setupClass() {
  let savedClass = localStorage.getItem("class_id");

  if (savedClass) {
    classId = savedClass;
    return;
  }

  if (user.role === "educator") {
    classId = "class-" + Math.floor(Math.random() * 10000);
    alert("Your class code: " + classId);
  } else {
    classId = prompt("Enter class code:");
  }

  localStorage.setItem("class_id", classId);
}

// 🚀 START
function start() {
  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("info").innerText =
    `${user.name} (${user.role}) | Class: ${classId}`;

  if (user.role === "educator") {
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("chatSection").style.display = "none";
  }
}

// 📩 SEND MESSAGE
async function send() {
  const text = document.getElementById("msg").value;

  if (!text) return;

  messages.push({ role: "user", content: text });

  const res = await fetch(API + "/api/chat", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ messages })
  });

  const data = await res.json();
  const reply = data.choices[0].message.content;

  messages.push({ role:"assistant", content: reply });

  render();
}

// 💬 CHAT UI (SENİN İSTEDİĞİN STYLE)
function render() {
  document.getElementById("chat").innerHTML =
    messages.map(m => `
      <div style="
        margin:10px;
        padding:10px;
        border-radius:10px;
        max-width:70%;
        ${m.role === "user" ? "background:#d1e7ff; margin-left:auto;" : "background:#eee;"}
      ">
        ${m.content}
      </div>
    `).join("");
}

// 📤 SUBMIT
async function submit() {
  await fetch(API + "/api/submit", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      user_id: user.id,
      user_name: user.name,
      role: user.role,
      class_id: classId,
      messages
    })
  });

  alert("Submitted!");
}

// 👨‍🏫 DASHBOARD
async function loadSubmissions() {
  const res = await fetch(API + "/api/submissions/" + classId);
  const data = await res.json();

  const students = [...new Set(data.map(d => d.user_name))];

  document.getElementById("submissions").innerHTML = `
    <h3>📊 Class Stats</h3>
    <p>Total submissions: ${data.length}</p>
    <p>Students submitted: ${students.length}</p>

    <h3>🧑‍🎓 Submissions</h3>
    ${data.map(d => `
      <div style="border:1px solid #ccc; margin:10px; padding:10px;">
        <b>${d.user_name}</b>
        <button onclick='toggle("${d.id}")'>View</button>

        <div id="chat-${d.id}" style="display:none">
          ${d.messages.map(m => `
            <p><b>${m.role}:</b> ${m.content}</p>
          `).join("")}
        </div>
      </div>
    `).join("")}
  `;
}

function toggle(id) {
  const el = document.getElementById("chat-" + id);
  el.style.display = el.style.display === "none" ? "block" : "none";
}

// 🌍 INIT
window.onload = () => {
  initUser();
  setupClass();
  start();
};
