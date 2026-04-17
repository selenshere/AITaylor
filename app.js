const API_URL = "https://aitaylor.onrender.com";

// 🔥 SUPABASE (DOĞRU)
const client = window.supabase.createClient(
  "https://xrxbjcfmljimozznnvmy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeGJqY2ZtbGppbW96em5udm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzM2MjgsImV4cCI6MjA5MjAwOTYyOH0.Y9QvsAkD1FeAvRJrQTNdy59ridkXYQO1nfPul1LF34o"
);

let messages = [];
let user = null;
let classId = null;
let assignmentId = null;

// 🔐 LOGIN
async function initAuth() {
  const { data } = await client.auth.getUser();

  if (!data.user) {
    const email = prompt("Email:");
    const password = prompt("Password:");
    const role = prompt("Role: educator or student");

    const { data: signUp } = await client.auth.signUp({
      email,
      password,
    });

    user = signUp.user;

    await client.from("users").insert({
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

// 📚 ASSIGNMENT
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
    headers: { "Content-Type": "application/json" },
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
