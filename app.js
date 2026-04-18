const API="https://aitaylor.onrender.com";

let messages=[];
let typing=false;

function render(){
 const log=document.getElementById("chatLog");
 log.innerHTML=messages.map(m=>`<div>${m.role}: ${m.content}</div>`).join("");
}

async function send(){
 const input=document.getElementById("userInput");
 const text=input.value;
 if(!text)return;
 input.value="";
 messages.push({role:"user",content:text});
 render();

 // typing indicator
 typing=true;
 messages.push({role:"assistant",content:"...typing"});
 render();

 const res=await fetch(API+"/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages})});
 const data=await res.json();

 messages.pop();
 messages.push({role:"assistant",content:data.choices[0].message.content});
 typing=false;
 render();
}

document.getElementById("sendBtn").onclick=send;

document.getElementById("startBtn").onclick=()=>{
 document.getElementById("pageWelcome").classList.add("hidden");
 document.getElementById("pageChat").classList.remove("hidden");
};

document.getElementById("submitBtn").onclick=async()=>{
 await fetch(API+"/api/progress/upsert",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({student_name:"test",class_id:"demo",messages,status:"done"})});
 alert("submitted");
};
