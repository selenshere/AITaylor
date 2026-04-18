const API="https://aitaylor.onrender.com";

let messages=[];
let annotations=[];
let name="";
let classId = new URLSearchParams(window.location.search).get("class") || "demo";

document.getElementById("startBtn").onclick=()=>{
 name=document.getElementById("firstName").value+" "+document.getElementById("lastName").value;
 document.getElementById("pageWelcome").classList.add("hidden");
 document.getElementById("pageChat").classList.remove("hidden");
};

function render(){
 document.getElementById("chatLog").innerHTML=
  messages.map(m=>`<div><b>${m.role}</b>: ${m.content}</div>`).join("");
}

async function send(){
 const input=document.getElementById("userInput");
 const text=input.value;
 if(!text)return;
 input.value="";
 messages.push({role:"user",content:text});
 render();

 const res=await fetch(API+"/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages})});
 const data=await res.json();

 const reply=data.choices[0].message.content;
 messages.push({role:"assistant",content:reply});
 render();

 document.getElementById("analysisBox").classList.remove("hidden");

 await saveProgress("working");
}

document.getElementById("sendBtn").onclick=send;

document.getElementById("saveAnalysis").onclick=()=>{
 const val=document.getElementById("analysisInput").value;
 annotations.push(val);
 document.getElementById("analysisInput").value="";
 document.getElementById("analysisBox").classList.add("hidden");
};

async function saveProgress(status){
 await fetch(API+"/api/progress/upsert",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
  student_name:name,
  class_id:classId,
  messages,
  annotations,
  status
 })});
}

document.getElementById("submitBtn").onclick=async()=>{
 await saveProgress("done");
 alert("submitted");
};
