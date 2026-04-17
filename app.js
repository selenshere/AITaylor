const API="https://aitaylor.onrender.com";

let role=null;
let classId=null;
let messages=[];
let progressData=[];

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
<hr>
<input id="cid" placeholder="Class code">
<input id="lpass" placeholder="Password">
<button onclick="loginClass()">Login</button>
`;
}

if(r==="student"){
box.innerHTML=`
<input id="sname" placeholder="Name">
<input id="scode" placeholder="Class code OR paste link">
<button onclick="joinClass()">Join</button>
<div id="errorMsg" style="color:red"></div>
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
classId=data.classId;

const link=window.location.origin + "?class="+classId;

alert("Class created!\nCode: "+classId+"\nJoin link: "+link);

startEducator();
}

async function loginClass(){
const id=document.getElementById("cid").value;
const password=document.getElementById("lpass").value;

const res=await fetch(API+"/api/class/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({classId:id,password})
});

if(!res.ok){alert("Wrong class code");return;}

classId=id;
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
loadProgress();
setInterval(loadProgress,3000);
}

function startStudent(){
document.getElementById("auth").style.display="none";
document.getElementById("app").style.display="block";
document.getElementById("pageWelcome").classList.remove("hidden");
}

async function loadProgress(){
const res=await fetch(API+"/api/progress/"+classId);
const data=await res.json();
progressData=data;

document.getElementById("studentList").innerHTML=
data.map(p=>`
<div>
<b onclick="openTranscript('${p.id}')">${p.student_name}</b>
<button onclick="downloadTranscript('${p.id}')">Download</button>
</div>
`).join("");
}

function openTranscript(id){
const item=progressData.find(p=>p.id==id);
alert(item.messages.map(m=>m.role+": "+m.content).join("\n"));
}

function downloadTranscript(id){
const item=progressData.find(p=>p.id==id);
const text=item.messages.map(m=>m.role+": "+m.content).join("\n");

const blob=new Blob([text]);
const url=URL.createObjectURL(blob);

const a=document.createElement("a");
a.href=url;
a.download=item.student_name+".txt";
a.click();
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
// auto join from link
const params=new URLSearchParams(window.location.search);
if(params.get("class")){
chooseRole("student");
setTimeout(()=>{
document.getElementById("scode").value=params.get("class");
},200);
}

document.getElementById("startBtn")?.addEventListener("click",()=>{
document.getElementById("pageWelcome").classList.add("hidden");
document.getElementById("pageChat").classList.remove("hidden");
});

document.getElementById("sendBtn")?.addEventListener("click",sendMessage);

document.getElementById("submitBtn")?.addEventListener("click",async()=>{
await fetch(API+"/api/submit",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
student_name:"student",
class_id:classId,
messages
})
});
alert("Submitted to educator");
});
});
