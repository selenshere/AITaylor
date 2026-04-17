const API = "https://aitaylor.onrender.com";

let user = {};
let classId = null;
let messages = [];

// PAGE SWITCH
function showPage(pageId) {
document.querySelectorAll(".page").forEach(p => {
p.style.display = "none";
p.classList.add("hidden");
});

if (!pageId) return;

const page = document.getElementById(pageId);
page.style.display = "block";
page.classList.remove("hidden");
}

// ROLE SELECT
function chooseRole(role) {
document.getElementById("entry").style.display = "none";
const box = document.getElementById("auth");
box.style.display = "block";

if (role === "educator") {
box.innerHTML = ` <h3>Create Class</h3> <input id="tname" placeholder="Name"> <input id="tpass" placeholder="Password"> <button onclick="createClass()">Create</button>

```
  <h3>Login</h3>
  <input id="cid" placeholder="Class code">
  <input id="lpass" placeholder="Password">
  <button onclick="loginClass()">Login</button>
`;
```

}

if (role === "student") {
box.innerHTML = `       <h3>Join</h3>       <input id="sname" placeholder="Name">       <input id="scode" placeholder="Class code">       <button onclick="joinClass()">Join</button>
    `;
}
}

// CREATE CLASS
async function createClass() {
const teacher_name = document.getElementById("tname").value;
const password = document.getElementById("tpass").value;

if (!teacher_name || !password) return alert("Fill all fields");

try {
const res = await fetch(API + "/api/class/create", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ teacher_name, password }),
});

```
const data = await res.json();

user = { name: teacher_name, role: "educator" };
classId = data.classId;

alert("Class: " + classId);

startApp();
```

} catch {
alert("Error creating class");
}
}

// LOGIN
async function loginClass() {
const class_id = document.getElementById("cid").value;
const password = document.getElementById("lpass").value;

if (!class_id || !password) return alert("Fill all fields");

try {
const res = await fetch(API + "/api/class/login", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ classId: class_id, password }),
});

```
if (!res.ok) return alert("Wrong class code or password");

const data = await res.json();

user = { name: data.teacher_name, role: "educator" };
classId = class_id;

startApp();
```

} catch {
alert("Login failed");
}
}

// JOIN
async function joinClass() {
const name = document.getElementById("sname").value;
const class_id = document.getElementById("scode").value;

if (!name || !class_id) return alert("Fill all fields");

try {
await fetch(API + "/api/student/join", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ name, class_id }),
});

```
user = { name, role: "student" };
classId = class_id;

startApp();
```

} catch {
alert("Join failed");
}
}

// START APP
function startApp() {
document.getElementById("auth").style.display = "none";
document.getElementById("app").style.display = "block";

document.getElementById("info").innerText =
`${user.name} | ${user.role} | ${classId}`;

if (user.role === "educator") {
loadStudents();
document.getElementById("dashboard").style.display = "block";

```
showPage(null); // hiçbir page gösterme
```

}

if (user.role === "student") {
document.getElementById("dashboard").style.display = "none";

```
showPage("pageWelcome"); // welcome sayfası
```

}
}

// LOAD STUDENTS
async function loadStudents() {
const res = await fetch(API + "/api/students/" + classId);
const data = await res.json();

document.getElementById("studentList").innerHTML =
data.map(s => `<p>${s.name}</p>`).join("");
}

// SEND MESSAGE
async function sendMessage() {
const input = document.getElementById("userInput");
const text = input.value;

if (!text) return;

messages.push({ role: "user", content: text });
input.value = "";

renderChat();

try {
const res = await fetch(API + "/api/chat", {
method: "POST",
headers: {"Content-Type":"application/json"},
body: JSON.stringify({ messages })
});

```
const data = await res.json();
const reply = data.choices[0].message.content;

messages.push({ role: "assistant", content: reply });

renderChat();

// ANALYSIS POPUP
document.getElementById("analysisOverlay").classList.remove("hidden");
document.getElementById("selectedText").innerText = reply;
```

} catch {
alert("Chat error");
}
}

// RENDER CHAT
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

// EVENTS
document.addEventListener("DOMContentLoaded", () => {

// SEND
document.getElementById("sendBtn")?.addEventListener("click", sendMessage);

// START CHAT
document.getElementById("startBtn")?.addEventListener("click", () => {
const firstName = document.getElementById("firstName").value;
const lastName = document.getElementById("lastName").value;
const q1 = document.getElementById("q1").value;
const q3 = document.getElementById("q3").value;

```
if (!firstName || !lastName || !q1 || !q3) {
  document.getElementById("formError").innerText =
    "Please fill all required fields";
  return;
}

messages.push({
  role: "user",
  content: q3
});

showPage("pageChat");
renderChat();
```

});

// SUBMIT
document.getElementById("submitBtn")?.addEventListener("click", submitChat);

// ANALYSIS SAVE
document.getElementById("saveReturnBtn")?.addEventListener("click", () => {
const reasoning = document.getElementById("reasoning").value;
const nextIntent = document.getElementById("nextIntent").value;

```
if (!reasoning || !nextIntent) {
  alert("Please fill required fields");
  return;
}

document.getElementById("analysisOverlay").classList.add("hidden");
```

});

});
