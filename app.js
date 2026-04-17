const API_URL = "https://aitaylor.onrender.com";

// 🌍 SUPABASE
const supabase = window.supabase.createClient(
  "https://xrxbjcfmljimozznnvmy.supabase.co",
  "PASTE_ANON_KEY"
);

let messages = [];
let user = null;
let classId = null;
let assignmentId = null;

// 🔐 LOGIN (AUTO)
async function initAuth() {
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    const email = prompt("Email:");
    const password = prompt("Password:");
    const role = prompt("Role: educator or student");

    const { data: signUp } = await supabase.auth.signUp({
      email,
      password,
    });

    user = signUp.user;

    await supabase.from("users").insert({
      id: user.id,
      role,
      name: email
    });

  } else {
    user = data.user;
  }
}

// 🏫 CLASS
function getClass() {
  classId = localStorage.getItem("class_id");

  if (!classId) {
    classId = prompt("Enter class code:");
    localStorage.setItem("class_id", classId);
  }
}

// 📚 LOAD ASSIGNMENTS
async function loadAssignments() {
  const res = await fetch(`${API_URL}/api/assignments/${classId}`);
  const data = await res.json();

  if (!data.length) {
    alert("No assignment yet");
    return;
  }

  assignmentId = data[0].id;

  alert("Assigned: " + data[0].title);
}

// 🚀 START CHAT
document.getElementById("startBtn").addEventListener("click", async () => {
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
    headers: {"Content-Type": "application/json"},
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
  const chatLog = document.getElementById("chatLog");

  chatLog.innerHTML = messages
    .map(m => `<p><b>${m.role}:</b> ${m.content}</p>`)
    .join("");
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
      class_id: classId,
      assignment_id: assignmentId,
      messages
    }),
  });

  alert("Submitted!");
}

// 🔘 SUBMIT BUTTON
document.getElementById("submitBtn").addEventListener("click", submitChat);

// 🌍 INIT
window.onload = async () => {
  await initAuth();
  getClass();
  await loadAssignments();
};
