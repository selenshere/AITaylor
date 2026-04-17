const API="https://aitaylor.onrender.com";

let role=null;
let classId=null;
let messages=[];

function chooseRole(r){
role=r;
document.getElementById("entry").style.display="none";
const box=document.getElementById("auth");
box.style.display="block";

if(r==="educator"){
box.innerHTML=`
<input id="tname" placeholder="Name">
<input id="tpass" placeholder="Password">
<button onclick="createClass()">Create Class</button>
<input id="cid" placeholder="Class code">
<input id="lpass" placeholder="Password">
<button onclick="loginClass()">Login</button>
`;
}

if(r==="student"){
box.innerHTML=`
<input id="sname" placeholder="Name">
<input id="scode" placeholder="Class code">
<button onclick="joinClass()">Join</button>
`;
}
}

async function createClass(){
const name=document.getElementById("tname").value;
const password=document.getElementById("tpass").value;

const res=await fetch(API+"/api/class/create",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({teacher_name:name,password})
});

const data=await res.json();
alert("Class created: "+data.classId);
}

async function loginClass(){
const id=document.getElementById("cid").value;
const password=document.getElementById("lpass").value;

const res=await fetch(API+"/api/class/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({classId:id,password})
});

if(!res.ok){alert("Wrong login");return;}

classId=id;
startEducator();
}

async function joinClass(){
const name=document.getElementById("sname").value;
const id=document.getElementById("scode").value;

const res=await fetch(API+"/api/student/join",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({name,class_id:id})
});

if(!res.ok){alert("Class not found");return;}

classId=id;
startStudent();
}

function startEducator(){
document.getElementById("auth").style.display="none";
document.getElementById("app").style.display="block";
document.getElementById("dashboard").classList.remove("hidden");
loadStudents();
}

function startStudent(){
document.getElementById("auth").style.display="none";
document.getElementById("app").style.display="block";
document.getElementById("pageWelcome").classList.remove("hidden");
}

async function loadStudents(){
const res=await fetch(API+"/api/students/"+classId);
const data=await res.json();
document.getElementById("studentList").innerHTML=
data.map(s=>"<p>"+s.name+"</p>").join("");
}

function renderChat(){
const log=document.getElementById("chatLog");
log.innerHTML=messages.map(m=>{
const c=m.role==="user"?"user":"taylor";
return `<div class="bubble ${c}">${m.content}</div>`;
}).join("");
log.scrollTop=log.scrollHeight;
}

async function sendMessage(){
const input=document.getElementById("userInput");
const text=input.value;
if(!text)return;

messages.push({role:"user",content:text});
input.value="";
renderChat();

const res=await fetch(API+"/api/chat",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({messages})
});

const data=await res.json();
messages.push({role:"assistant",content:data.choices[0].message.content});
renderChat();
}

document.addEventListener("DOMContentLoaded",()=>{
document.getElementById("startBtn")?.addEventListener("click",()=>{
document.getElementById("pageWelcome").classList.add("hidden");
document.getElementById("pageChat").classList.remove("hidden");
});

document.getElementById("sendBtn")?.addEventListener("click",sendMessage);

document.getElementById("submitBtn")?.addEventListener("click",()=>{
alert("Sent to educator dashboard (mock)");
});
});
