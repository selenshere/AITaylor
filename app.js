const API="https://aitaylor.onrender.com";

let messages=[];
let name="";

document.getElementById("startBtn").onclick=()=>{
 name=document.getElementById("firstName").value+" "+document.getElementById("lastName").value;
 document.getElementById("pageWelcome").classList.add("hidden");
 document.getElementById("pageChat").classList.remove("hidden");
};

function render(){
 document.getElementById("chatLog").innerHTML=
  messages.map(m=>`<div>${m.role}: ${m.content}</div>`).join("");
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

 messages.push({role:"assistant",content:data.choices[0].message.content});
 render();

 await fetch(API+"/api/progress/upsert",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({student_name:name,class_id:"demo",messages,status:"working"})});
}

document.getElementById("sendBtn").onclick=send;

document.getElementById("submitBtn").onclick=()=>{
 fetch(API+"/api/progress/upsert",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({student_name:name,class_id:"demo",messages,status:"done"})});
 alert("submitted");
};
