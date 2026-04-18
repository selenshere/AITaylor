const API = "https://aitaylor.onrender.com";

let classId = localStorage.getItem("classId");
let studentName = localStorage.getItem("studentName");
let messages = JSON.parse(localStorage.getItem("messages") || "[]");

function closeModal(){
  document.getElementById("modal").classList.add("hidden");
}

function chooseRole(r){
  closeModal();

  document.getElementById("entry").classList.add("hidden");
  const box = document.getElementById("auth");
  box.classList.remove("hidden");

  if(r==="educator"){
    box.innerHTML=`

    <h3>Create Class</h3>
    <input id="code" placeholder="Class Code">
    <input id="pass" placeholder="Password">
    <button onclick="createClass()">Create</button>

    <hr>

    <h3>Login to Class</h3>
    <input id="loginCode" placeholder="Class Code">
    <input id="loginPass" placeholder="Password">
    <button onclick="loginClass()">Login</button>

    `;
  }

  if(r==="student"){
    box.innerHTML=`
      <input id="name" placeholder="Name">
      <input id="codeJoin" placeholder="Code or link">
      <button onclick="join()">Join</button>
      <div id="err" style="color:red"></div>
    `;
  }
}

async function createClass(){
  const code = document.getElementById("code").value;
  const password = document.getElementById("pass").value;

  const res = await fetch(API+"/api/class/create",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({teacher_name:"t",password,classId:code})
  });

  if(!res.ok){
    alert("Class already exists");
    return;
  }

  classId = code;
  localStorage.setItem("classId", code);

  const link = location.origin+"?class="+code;

  document.getElementById("classCodeText").innerText="Code: "+code;
  document.getElementById("copyLink").value=link;

  document.getElementById("modal").classList.remove("hidden");
}

async function loginClass(){
  const code = document.getElementById("loginCode").value;
  const password = document.getElementById("loginPass").value;

  const res = await fetch(API+"/api/class/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ classId: code, password })
  });

  if(!res.ok){
    alert("Wrong class code or password");
    return;
  }

  classId = code;
  localStorage.setItem("classId", code);

  startEducator();
}

function goDashboard(){
  closeModal();
  startEducator();
}

function startEducator(){
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  document.getElementById("submitBtn").style.display="none";
  document.getElementById("dashboard").classList.remove("hidden");

  loadProgress();
  setInterval(loadProgress,3000);
}

async function join(){
  let name=document.getElementById("name").value;
  let code=document.getElementById("codeJoin").value;

  if(code.includes("?class=")){
    code=code.split("?class=")[1];
  }

  const res=await fetch(API+"/api/student/join",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({name, class_id:code})
  });

  if(!res.ok){
    document.getElementById("err").innerText="Wrong class code";
    return;
  }

  const data = await res.json();

  classId=code;
  studentName=name;

  localStorage.setItem("classId", code);
  localStorage.setItem("studentName", name);

  // 🔥 kaldığı yerden devam
  if(data.progress){
    messages = data.progress.messages || [];
  }

  closeModal();

  document.getElementById("auth").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  document.getElementById("submitBtn").style.display="block";
  document.getElementById("pageWelcome").classList.remove("hidden");

  render();
}

async function loadProgress(){
  const res=await fetch(API+"/api/progress/"+classId);
  const data=await res.json();

  document.getElementById("studentList").innerHTML =
    data.map(p=>`<div>${p.student_name} - ${p.status}</div>`).join("");
}

function render(){
  const log=document.getElementById("chatLog");

  log.innerHTML = messages.map(m => `
    <div class="bubble ${m.role==='user'?'user':'taylor'}">
      ${m.content}
    </div>
  `).join("");
}

async function send(){
  const input=document.getElementById("userInput");

  messages.push({role:"user",content:input.value});
  input.value="";
  render();

  await saveProgress("working");

  const res=await fetch(API+"/api/chat",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({messages})
  });

  const data=await res.json();

  messages.push({
    role:"assistant",
    content:data.choices[0].message.content
  });

  render();

  await saveProgress("working");
}

// 🔥 YENİ
async function saveProgress(status){
  localStorage.setItem("messages", JSON.stringify(messages));

  await fetch(API+"/api/progress/upsert",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      student_name: studentName,
      class_id: classId,
      messages,
      status
    })
  });
}

document.addEventListener("DOMContentLoaded",()=>{

  closeModal();

  document.getElementById("startBtn")?.addEventListener("click",()=>{
    document.getElementById("pageWelcome").classList.add("hidden");
    document.getElementById("pageChat").classList.remove("hidden");
  });

  document.getElementById("sendBtn")?.addEventListener("click",send);

  // 🔥 SUBMIT FIX
  document.getElementById("submitBtn")?.addEventListener("click", async ()=>{
    await saveProgress("done");
    alert("Submitted!");
  });

});
