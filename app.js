const API="https://aitaylor.onrender.com";

let classId=null;
let messages=[];

function chooseRole(r){
document.getElementById("entry").style.display="none";
const box=document.getElementById("auth");
box.style.display="block";

if(r==="educator"){
box.innerHTML=`
<input id="classCodeInput" placeholder="Class Code (e.g. math101)">
<input id="tpass" placeholder="Password">
<button onclick="createClass()">Create Class</button>
`;
}

if(r==="student"){
box.innerHTML=`
<input id="sname" placeholder="Name">
<input id="scode" placeholder="Class code or link">
<button onclick="joinClass()">Join</button>
<div id="errorMsg" style="color:red"></div>
`;
}
}

async function createClass(){
const classCode=document.getElementById("classCodeInput").value;
const password=document.getElementById("tpass").value;

const res=await fetch(API+"/api/class/create",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({teacher_name:"t",password,classId:classCode})
});

if(!res.ok){
alert("Class already exists!");
return;
}

classId=classCode;
const link=window.location.origin+"?class="+classId;

document.getElementById("classCodeText").innerText="Code: "+classId;
document.getElementById("copyLink").value=link;
document.getElementById("modal").classList.remove("hidden");
}

function copyLink(){
const input=document.getElementById("copyLink");
navigator.clipboard.writeText(input.value);
alert("Copied!");
}

function goDashboard(){
document.getElementById("modal").classList.add("hidden");
startEducator();
}

async function joinClass(){
const name=document.getElementById("sname").value;
let input=document.getElementById("scode").value;

if(input.includes("?class=")){
input=input.split("?class=")[1];
}

const res=await fetch(API+"/api/student/join",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({name,class_id:input})
});

if(!res.ok){
document.getElementById("errorMsg").innerText="Wrong class code";
return;
}

classId=input;
startStudent();
}

function startEducator(){
document.getElementById("auth").style.display="none";
document.getElementById("app").style.display="block";
document.getElementById("dashboard").classList.remove("hidden");
}

function startStudent(){
document.getElementById("auth").style.display="none";
document.getElementById("app").style.display="block";
document.getElementById("pageWelcome").classList.remove("hidden");
}

function renderChat(){
const log=document.getElementById("chatLog");
log.innerHTML=messages.map(m=>{
const c=m.role==="user"?"user":"taylor";
return `<div class="bubble ${c}">${m.content}</div>`;
}).join("");
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
});
