const API_URL = "https://aitaylor.onrender.com";

// 🌍 SUPABASE
const client = window.supabase.createClient(
  "https://xrxbjcfmljimozznnvmy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);

let messages = [];
let user = null;
let classId = null;
let assignmentId = null;

// 🔐 BASİT LOGIN (username + role)
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

// 🏫 CLASS SYSTEM
function setupClass() {
  classId = localStorage.getItem("class_id");

  if (!classId) {
    if (user.role === "educator") {
      classId = "class-" + Math.floor(Math.random() * 10000);
      alert("Your class code: " + classId);
    } else {
      classId = prompt("Enter class code:");
    }

    localStorage.setItem("class_id", classId);
  }
}

// 📚 ASSIGNMENT
async function loadAssignments() {
  const res = await fetch(`${API_URL}/api/assignments/${classId}`);
  const data = await res.json();

  if (!data.length) {
    alert("No assignment yet");
    return;
  }

  assignmentId = data[0].id;
}

// 🚀 START CHAT
document.getElementById("startBtn").addEventListener("click", () => {
  const firstMsg = document.getElementById("q3").value;

  if (!firstMsg) return alert("Write first message");

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

  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || "Error";

  messages.push({ role: "assistant", content: reply });

  renderChat();
  openAnalysis(reply);
}

// 🖥️ CHAT
function renderChat() {
  document.getElementById("chatLog").innerHTML =
    messages.map(m => `<p><b>${m.role}:</b> ${m.content}</p>`).join("");
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
  await fetch(`${API_URL}/api/submit`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      user_id: user.id,
      user_name: user.name,
      role: user.role,
      class_id: classId,
      assignment_id: assignmentId,
      messages
    }),
  });

  alert("Submitted!");
}

document.getElementById("submitBtn").addEventListener("click", submitChat);

// 🌍 INIT
window.onload = async () => {
  initUser();
  setupClass();
  await loadAssignments();
};
