// 🔗 BACKEND
const API_URL = "https://aitaylor.onrender.com";

// 🌍 SUPABASE
const supabase = window.supabase.createClient(
"https://xrxbjcfmljimozznnvmy.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeGJqY2ZtbGppbW96em5udm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzM2MjgsImV4cCI6MjA5MjAwOTYyOH0.Y9QvsAkD1FeAvRJrQTNdy59ridkXYQO1nfPul1LF34o"
);

// STATE
let messages = [];
let studentName = "";
let classId = "";

// ================= INIT =================
window.onload = () => {
showOnly("roleScreen");
};

// ================= UI =================
function showOnly(id) {
const sections = [
"roleScreen",
"loginStudent",
"loginEducator",
"studentApp",
"educatorApp"
];

sections.forEach(s => {
const el = document.getElementById(s);
if (el) el.classList.add("hidden");
});

const active = document.getElementById(id);
if (active) active.classList.remove("hidden");
}

// ================= ROLE =================
function enterRole(role) {
if (role === "student") {
showOnly("loginStudent");
} else {
showOnly("loginEducator");
}
}

// ================= LOGIN =================
function loginStudent() {
studentName = document.getElementById("studentName").value.trim();
classId = document.getElementById("classCode").value.trim();

if (!studentName || !classId) {
alert("Fill all fields");
return;
}

showOnly("studentApp");
}

function loginEducator() {
classId = document.getElementById("classCodeEducator").value.trim();

if (!classId) {
alert("Enter class code");
return;
}

showOnly("educatorApp");
loadClass();
}

// ================= START CHAT =================
document.addEventListener("DOMContentLoaded", () => {
const startBtn = document.getElementById("startBtn");
if (startBtn) {
startBtn.onclick = async () => {
const firstMsg = document.getElementById("q3").value;

```
  if (!firstMsg) {
    alert("Write first message");
    return;
  }

  messages.push({ role: "user", content: firstMsg });

  await supabase.from("students").upsert({
    name: studentName,
    class_id: classId
  });

  document.getElementById("page1").classList.add("hidden");
  document.getElementById("page2").classList.remove("hidden");

  renderChat();
};
```

}

const sendBtn = document.getElementById("sendBtn");
if (sendBtn) sendBtn.onclick = sendMessage;

const submitBtn = document.getElementById("submitBtn");
if (submitBtn) submitBtn.onclick = submitChat;
});

// ================= SEND =================
async function sendMessage() {
const input = document.getElementById("userInput");
const text = input.value;

if (!text) return;

messages.push({ role: "user", content: text });
input.value = "";

renderChat();

try {
const res = await fetch(`${API_URL}/api/chat`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ messages })
});

```
const data = await res.json();
const reply = data.choices?.[0]?.message?.content || "Error";

messages.push({ role: "assistant", content: reply });

renderChat();

// ANALYSIS POPUP
const selected = document.getElementById("selectedText");
const overlay = document.getElementById("analysisOverlay");

if (selected && overlay) {
  selected.innerText = reply;
  overlay.classList.remove("hidden");
}
```

} catch (err) {
console.error(err);
alert("API error");
}
}

// ================= CHAT =================
function renderChat() {
const chatLog = document.getElementById("chatLog");
if (!chatLog) return;

chatLog.innerHTML = messages
.map(m => `<p><b>${m.role}:</b> ${m.content}</p>`)
.join("");
}

// ================= SUBMIT =================
async function submitChat() {
try {
await supabase.from("progress").upsert({
student_name: studentName,
class_id: classId,
messages: messages,
status: "done"
});

```
alert("Submitted!");
```

} catch (err) {
console.error(err);
alert("Submit failed");
}
}

// ================= EDUCATOR =================
async function loadClass() {
try {
const { data, error } = await supabase
.from("progress")
.select("*")
.eq("class_id", classId);

```
if (error) throw error;

const list = document.getElementById("studentsList");
if (!list) return;

list.innerHTML = data.map(s => `
  <div style="margin-bottom:10px; padding:10px; border:1px solid #ccc;">
    <b>${s.student_name}</b> → ${s.status}
    <br/>
    <button onclick='viewStudent(${JSON.stringify(s.messages)})'>
      View
    </button>
  </div>
`).join("");
```

} catch (err) {
console.error(err);
}
}

// ================= VIEW =================
function viewStudent(msgs) {
alert(msgs.map(m => m.content).join("\n"));
}
