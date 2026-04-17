// 🔗 BACKEND
const API_URL = "https://aitaylor.onrender.com";

// 🌍 SUPABASE
const supabase = window.supabase.createClient(
"https://xrxbjcfmljimozznnvmy.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);

let messages = [];
let studentName = null;
let classId = null;

// 🔄 STATE RESTORE
window.onload = () => {
const saved = JSON.parse(localStorage.getItem("session"));

if (saved) {
studentName = saved.name;
classId = saved.classId;
messages = saved.messages || [];

```
showStudent();
openChat();
renderChat();
```

}
};

// 💾 SAVE SESSION
function saveSession() {
localStorage.setItem("session", JSON.stringify({
name: studentName,
classId,
messages
}));
}

// 🎭 ROLE
function enterRole(role) {
document.getElementById("roleScreen").classList.add("hidden");

if (role === "educator") {
document.getElementById("educatorScreen").classList.remove("hidden");
} else {
showStudent();
}
}

function showStudent() {
document.getElementById("studentScreen").classList.remove("hidden");
}

// 🚀 START CHAT
document.getElementById("startBtn").onclick = async () => {
studentName = document.getElementById("studentName").value;
classId = document.getElementById("classCode").value;

const firstMsg = document.getElementById("q3").value;

if (!studentName || !classId || !firstMsg) {
return alert("Fill all fields");
}

messages.push({ role: "user", content: firstMsg });

await supabase.from("students").upsert({
name: studentName,
class_id: classId
});

saveSession();
openChat();
renderChat();
};

// 📩 SEND
document.getElementById("sendBtn").onclick = sendMessage;

async function sendMessage() {
const input = document.getElementById("userInput");
const text = input.value;

if (!text) return;

messages.push({ role: "user", content: text });
input.value = "";

renderChat();
saveSession();

const res = await fetch(`${API_URL}/api/chat`, {
method: "POST",
headers: {"Content-Type": "application/json"},
body: JSON.stringify({ messages }),
});

const data = await res.json();
const reply = data.choices?.[0]?.message?.content || "Error";

messages.push({ role: "assistant", content: reply });

renderChat();
saveSession();
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

document.getElementById("saveReturnBtn").onclick = () => {
document.getElementById("analysisOverlay").classList.add("hidden");
};

// 📤 SUBMIT
document.getElementById("submitBtn").onclick = async () => {

await supabase.from("progress").upsert({
student_name: studentName,
class_id: classId,
messages,
status: "done"
});

localStorage.removeItem("session");

alert("Submitted!");
};

// 🧭 NAV
function openChat() {
document.getElementById("pageWelcome").classList.add("hidden");
document.getElementById("pageChat").classList.remove("hidden");
}

// 🎓 EDUCATOR
async function loadClass() {
const classCode = document.getElementById("classInput").value;

const { data } = await supabase
.from("progress")
.select("*")
.eq("class_id", classCode);

const list = document.getElementById("studentsList");

list.innerHTML = data.map(s => `     <div>       <b>${s.student_name}</b> → ${s.status}       <button onclick='viewStudent(${JSON.stringify(s.messages)})'>View</button>     </div>
  `).join("");
}

function viewStudent(messages) {
alert(messages.map(m => m.content).join("\n"));
}
