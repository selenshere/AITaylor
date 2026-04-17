const API = "https://aitaylor.onrender.com";

let user, classId, messages = [];

function start() {
  const name = document.getElementById("name").value;
  const role = document.getElementById("role").value;

  user = {
    id: crypto.randomUUID(),
    name,
    role
  };

  if (role === "educator") {
    classId = "class-" + Math.floor(Math.random()*10000);
    alert("Class code: " + classId);
  } else {
    classId = prompt("Enter class code:");
  }

  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("info").innerText =
    `${user.name} (${role}) | Class: ${classId}`;

  if (role === "educator") {
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("chatSection").style.display = "none";
  }
}

async function send() {
  const text = document.getElementById("msg").value;

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

function render() {
  document.getElementById("chat").innerHTML =
    messages.map(m => `<p><b>${m.role}:</b> ${m.content}</p>`).join("");
}

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

async function loadSubmissions() {
  const res = await fetch(API + "/api/submissions/" + classId);
  const data = await res.json();

  // stats
  const total = data.length;
  const uniqueStudents = [...new Set(data.map(d => d.user_name))];

  document.getElementById("submissions").innerHTML = `
    <h3>Class Stats</h3>
    <p>Total submissions: ${total}</p>
    <p>Students submitted: ${uniqueStudents.length}</p>

    <h3>Submissions</h3>
    ${data.map(d => `
      <div style="border:1px solid #ccc; margin:10px; padding:10px;">
        <b>${d.user_name}</b>
        <button onclick='toggleChat("${d.id}")'>View</button>

        <div id="chat-${d.id}" style="display:none">
          ${d.messages.map(m => `
            <p><b>${m.role}:</b> ${m.content}</p>
          `).join("")}
        </div>
      </div>
    `).join("")}
  `;
}

function toggleChat(id) {
  const el = document.getElementById("chat-" + id);
  el.style.display = el.style.display === "none" ? "block" : "none";
}
