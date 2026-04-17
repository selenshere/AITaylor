const API_URL = "https://aitaylor.onrender.com";

let messages = [];

// 👤 USER
function getUser() {
  let user = localStorage.getItem("user");

  try {
    user = JSON.parse(user);
  } catch {
    user = null;
  }

  if (!user || typeof user !== "object") {
    const role = prompt("Enter role: educator or student");

    user = {
      id: crypto.randomUUID(),
      role: (role || "student").toLowerCase()
    };

    localStorage.setItem("user", JSON.stringify(user));
  }

  return user;
}

// 🏫 CLASS
function getClassId(user) {
  let classId = localStorage.getItem("class_id");

  if (!classId) {
    if (user.role === "educator") {
      classId = "class-" + Math.floor(Math.random() * 10000);
      alert("Your class code:\n" + classId);
    } else {
      classId = prompt("Enter class code:");
    }

    localStorage.setItem("class_id", classId);
  }

  return classId;
}

// 🎯 CLASS CODE HEADER GÖSTER
function showClassInfo(user, classId) {
  const header = document.querySelector(".topbar");

  const div = document.createElement("div");
  div.style.marginLeft = "20px";
  div.style.fontSize = "14px";

  div.innerHTML = `
    <b>Role:</b> ${user.role} | 
    <b>Class:</b> ${classId}
  `;

  header.appendChild(div);
}

// 🚀 START CHAT
document.getElementById("startBtn").addEventListener("click", () => {
  const firstMsg = document.getElementById("q3").value;

  if (!firstMsg) {
    document.getElementById("formError").innerText = "Write first message";
    return;
  }

  document.getElementById("pageWelcome").classList.add("hidden");
  document.getElementById("pageChat").classList.remove("hidden");

  messages.push({ role: "user", content: firstMsg });
  renderChat();
});

// 📩 SEND
document.getElementById("sendBtn").addEventListener("click", sendMessage);

async function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value;

  if (!text) return;

  messages.push({ role: "user", content: text });
  input.value = "";

  renderChat();
  document.getElementById("apiStatus").innerText = "thinking...";

  try {
    const res = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();

    if (!data.choices) {
      alert("API error");
      return;
    }

    const reply = data.choices[0].message.content;

    messages.push({ role: "assistant", content: reply });

    renderChat();
    document.getElementById("apiStatus").innerText = "ready";

    openAnalysis(reply);

  } catch (err) {
    console.error(err);
  }
}

// 🖥️ CHAT
function renderChat() {
  const chatLog = document.getElementById("chatLog");

  chatLog.innerHTML = messages
    .map(m => `<p><b>${m.role}:</b> ${m.content}</p>`)
    .join("");

  chatLog.scrollTop = chatLog.scrollHeight;
}

// 🧠 ANALYSIS
function openAnalysis(text) {
  document.getElementById("selectedText").innerText = text;
  document.getElementById("analysisOverlay").classList.remove("hidden");
}

document.getElementById("saveReturnBtn").addEventListener("click", () => {
  document.getElementById("analysisOverlay").classList.add("hidden");
});

// 📤 SUBMIT
async function submitChat() {
  const user = getUser();
  const classId = getClassId(user);

  await fetch(`${API_URL}/api/save`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      user_id: user.id,
      role: user.role,
      class_id: classId,
      messages
    }),
  });

  alert("Submitted!");
}

// 👨‍🏫 DASHBOARD UI
async function loadClassData(classId) {
  const res = await fetch(`${API_URL}/api/class/${classId}`);
  const data = await res.json();

  let panel = document.getElementById("teacherPanel");

  if (!panel) {
    panel = document.createElement("div");
    panel.id = "teacherPanel";
    panel.style.padding = "10px";
    panel.style.background = "#f3f3f3";
    panel.style.margin = "10px";
    document.body.prepend(panel);
  }

  panel.innerHTML = `
    <h3>📊 Student Submissions (${data.length})</h3>
    ${data.map(d => `
      <div style="border:1px solid #ccc; padding:8px; margin:5px;">
        <b>User:</b> ${d.user_id}<br/>
        <b>Messages:</b> ${d.messages.length}
      </div>
    `).join("")}
  `;
}

// 🔁 AUTO REFRESH (teacher için)
function startTeacherAutoRefresh(classId) {
  setInterval(() => {
    loadClassData(classId);
  }, 5000);
}

// 🌍 INIT
window.onload = () => {
  const user = getUser();
  const classId = getClassId(user);

  showClassInfo(user, classId);

  if (user.role === "educator") {
    loadClassData(classId);
    startTeacherAutoRefresh(classId);
  }
};

// 🌍 GLOBAL
window.submitChat = submitChat;
