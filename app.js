const API="https://aitaylor.onrender.com";

let classId=null;
let messages=[];

function closeModal(){
  document.getElementById("modal").classList.add("hidden");
}

function chooseRole(r){

  // 🔥 HER ZAMAN modal reset
  closeModal();

  document.getElementById("entry").classList.add("hidden");
  const box=document.getElementById("auth");
  box.classList.remove("hidden");

  if(r==="educator"){
    box.innerHTML=`
      <input id="code" placeholder="Class Code">
      <input id="pass" placeholder="Password">
      <button onclick="createClass()">Create</button>
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
  const code=document.getElementById("code").value;
  const password=document.getElementById("pass").value;

  const res=await fetch(API+"/api/class/create",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({teacher_name:"t",password,classId:code})
  });

  if(!res.ok){
    alert("Class already exists");
    return;
  }

  classId=code;
  const link=location.origin+"?class="+code;

  document.getElementById("classCodeText").innerText="Code: "+code;
  document.getElementById("copyLink").value=link;

  // ✅ SADECE BURADA açılır
  document.getElementById("modal").classList.remove("hidden");
}

function copyLink(){
  navigator.clipboard.writeText(document.getElementById("copyLink").value);
}

function goDashboard(){
  closeModal();

  document.getElementById("auth").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  document.getElementById("submitBtn").style.display="none";
  document.getElementById("dashboard").classList.remove("hidden");

  loadProgress();
  setInterval(loadProgress,3000);
}

async function join(){
  let code=document.getElementById("codeJoin").value;

  if(code.includes("?class=")){
    code=code.split("?class=")[1];
  }

  const res=await fetch(API+"/api/student/join",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({name:"student",class_id:code})
  });

  if(!res.ok){
    document.getElementById("err").innerText="Wrong class code";
    return;
  }

  classId=code;

  closeModal();

  document.getElementById("auth").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  document.getElementById("submitBtn").style.display="block";
  document.getElementById("pageWelcome").classList.remove("hidden");
}

async function loadProgress(){
  const res=await fetch(API+"/api/progress/"+classId);
  const data=await res.json();

  document.getElementById("studentList").innerHTML =
    data.map(p=>`<div>${p.student_name}</div>`).join("");
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
}

document.addEventListener("DOMContentLoaded",()=>{

  // 🔥 garanti kapalı başlasın
  closeModal();

  document.getElementById("startBtn")?.addEventListener("click",()=>{
    document.getElementById("pageWelcome").classList.add("hidden");
    document.getElementById("pageChat").classList.remove("hidden");
  });

  document.getElementById("sendBtn")?.addEventListener("click",send);

  // dış tıklama
  document.getElementById("modal").addEventListener("click",(e)=>{
    if(e.target.id==="modal"){
      closeModal();
    }
  });

  // ESC
  document.addEventListener("keydown",(e)=>{
    if(e.key==="Escape"){
      closeModal();
    }
  });
});
