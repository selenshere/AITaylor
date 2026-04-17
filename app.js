// 🔗 BACKEND
const API_URL = "https://aitaylor.onrender.com";

// 🌍 SUPABASE
const supabase = window.supabase.createClient(
"https://xrxbjcfmljimozznnvmy.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeGJqY2ZtbGppbW96em5udm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzM2MjgsImV4cCI6MjA5MjAwOTYyOH0.Y9QvsAkD1FeAvRJrQTNdy59ridkXYQO1nfPul1LF34o"
);

// 💾 STATE
let messages = [];
let studentName = null;
let classId = null;

// ================= ROLE =================
function enterRole(role) {
document.getElementById("roleScreen").classList.add("hidden");

if (role === "student") {
document.getElementById("studentApp").classList.remove("hidden");
} else {
document.getElementById("educatorApp").classList.remove("hidden");
}
}

// ================= SESSION RESTORE =================
window.onload = () => {
const saved = JSON.parse(localStorage.getItem("session"));

if (saved) {
studentName = saved.name;
classId = saved.classId;
messages = saved.messages || [];

```
document.getElementById("roleScreen").classList.add("hidden");
document.getElementById("studentApp").classList.remove("hidden");

document.getElementById("page1").classList.add("hidden");
document.getElementById("page2").classList.remove("hidden");

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

// ================= START CHAT =================
document.getElementById("startBtn").onclick = async () => {
studentName = document.getElementById("studentName").value;
classId = document.getElementById("classCode").value;
const firstMsg = document.getElementById("q3").value;

if (!studentName || !classId || !firstMsg) {
return alert("Fill all fields");
}

messages.push({ role: "user", content: firstMsg });

// 🔥 öğrenciyi ekle (duplicate engelli)
await supabase.from("students").upsert({
name: studentName,
class_id: classId
});

saveSession();

// PAGE SWITCH
document.getElementById("page1").classList.add("hidden");
document.getElementById("page2").classList.remove("hidden");

renderChat();
};

// ================= SEND =================
document.getElementById("sendBtn").onclick = sendMessage;

async function sendMessage() {
const input = document.getElementById("userInput");
const text = input.value;

if (!text) return;

messages.push({ role: "user", content: text });
input.value = "";

renderChat();
saveSession();

try {
const res = await fetch(`${API_URL}/api/chat`, {
method: "POST",
headers: {"Content-Type": "application/json"},
body: JSON.stringify({ messages }),
});

```
const data = await res.json();
const reply = data.choices?.[0
```
