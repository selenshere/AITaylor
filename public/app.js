// 🔗 BACKEND URL
const API_URL = "https://aitaylor.onrender.com";

// 💾 GLOBAL STATE
let messages = [];

// 👤 USER
function getUser() {
  let user = localStorage.getItem("user");

  if (!user) {
    user = {
      id: crypto.randomUUID(),
      role: "student"
    };
    localStorage.setItem("user", JSON.stringify(user));
  }

  return JSON.parse(user);
}

// 🏫 CLASS
function getClassId() {
  let classId = localStorage.getItem("class_id");

  if (!classId) {
    classId = prompt("Enter class code:") || "demo-class";
    localStorage.setItem("class_id", classId);
  }

  return classId;
}

// 🚀 START CHAT
document.getElementById("startBtn").addEventListener("click", () => {
  const firstMsg = document.getElementById("q3").value;

  if (!firstMsg) {
    document.getElementById("formError").innerText = "Please write first message";
    return;
  }

  // welcome → chat geçiş
  document.getElementById("pageWelcome").classList.add("hidden");
  document.getElementById("pageChat").classList.remove("hidden");

  messages.push({ role: "user", content: firstMsg });
  renderChat();
});

// 📩 SEND MESSAGE
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();

    const reply = data.choices?.[0]?.message?.content || "Error";

    messages.push({ role: "assistant", content: reply });

    renderChat();

    document.getElementById("apiStatus").innerText = "ready";

    // 🔥 ANALYSIS POPUP AÇ
    openAnalysis(reply);

  } catch (err) {
    console.error(err);
    document.getElementById("apiStatus").innerText = "error";
  }
}

// 🖥️ CHAT RENDER
function renderChat() {
  const chatLog = document.getElementById("chatLog");

  chatLog.innerHTML = messages
    .map(m => `<p><b>${m.role}:</b> ${m.content}</p>`)
    .join("");

  chatLog.scrollTop = chatLog.scrollHeight;
}

// 🧠 ANALYSIS POPUP
function openAnalysis(text) {
  const overlay = document.getElementById("analysisOverlay");

  document.getElementById("selectedText").innerText = text;

  overlay.classList.remove("hidden");
}

// 🔙 ANALYSIS SAVE
document.getElementById("saveReturnBtn").addEventListener("click", () => {
  const reasoning = document.getElementById("reasoning").value;
  const nextIntent = document.getElementById("nextIntent").value;

  if (!reasoning || !nextIntent) {
    alert("Please fill required fields");
    return;
  }

  document.getElementById("analysisOverlay").classList.add("hidden");

  // temizle
  document.getElementById("reasoning").value = "";
  document.getElementById("nextIntent").value = "";
});

// 📤 SUBMIT (EN KRİTİK)
async function submitChat() {
  const user = getUser();
  const classId = getClassId();

  try {
    await fetch(`${API_URL}/api/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        role: user.role,
        class_id: classId,
        messages
      }),
    });

    alert("✅ Submitted successfully!");

  } catch (err) {
    console.error(err);
    alert("❌ Submit failed");
  }
}

// 🌍 GLOBAL expose (index için)
window.submitChat = submitChat;
