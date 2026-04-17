const API = "https://aitaylor.onrender.com";

let user = {};
let classId = null;
let messages = [];

function showPage(id){
document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
if(id) document.getElementById(id).classList.remove("hidden");
}

function chooseRole(role){
document.getElementById("entry").style.display="none";
const box=document.getElementById("auth");
box.style.display="block";

if(role==="student"){
box.innerHTML=`
<input id="sname" placeholder="Name">
<input id="scode" placeholder="Class code">
<button onclick="joinClass()">Join</button>
`;
}

if(role==="educator"){
box.innerHTML=`
<input id="cid" placeholder="Class code">
<input id="lpass" placeholder="Password">
<button onclick="loginClass()">Login</button>
`;
}
}

async function joinClass(){
const name=document.getElementById("sname").value;
const class_id=document.getElementById("scode").value;

await fetch(API+"/api/student/join",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({name,class_id})
});

user={name,role:"student"};
classId=class_id;
startApp();
}

async function loginClass(){
const class_id=document.getElementById("cid").value;
const password=document.getElementById("lpass").value;

const res=await fetch(API+"/api/class/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({classId:class_id,password})
});

const data=await res.json();
user={name:data.teacher_name,role:"educator"};
classId=class_id;
startApp();
}

function startApp(){
document.getElementById("auth").style.display="none";
document.getElementById("app").style.display="block";

if(user.role==="student"){
showPage("pageWelcome");
}else{
document.getElementById("dashboard").style.display="block";
}
}

function renderChat(){
const log=document.getElementById("chatLog");

log.innerHTML=messages.map(m=>{
const role=m.role==="user"?"user":"taylor";
return `<div class="bubble ${role}">${m.content}</div>`;
}).join("");

log.scrollTop=log.scrollHeight;
}

async function sendMessage(){
const input=document.getElementById("userInput");
const text=input.value;
if(!text) return;

messages.push({role:"user",content:text});
input.value="";
renderChat();

const res=await fetch(API+"/api/chat",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({messages})
});

const data=await res.json();
const reply=data.choices[0].message.content;

messages.push({role:"assistant",content:reply});
renderChat();
}

document.addEventListener("DOMContentLoaded",()=>{
document.getElementById("sendBtn")?.addEventListener("click",sendMessage);

document.getElementById("startBtn")?.addEventListener("click",()=>{
showPage("pageChat");
});
});
