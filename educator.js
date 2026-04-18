const API="https://aitaylor.onrender.com";
let classId="";

async function create(){
 const code=document.getElementById("code").value;
 const pass=document.getElementById("pass").value;
 await fetch(API+"/api/class/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,password:pass})});
 alert("link: "+location.origin+"?class="+code);
}

async function login(){
 const code=document.getElementById("code2").value;
 const pass=document.getElementById("pass2").value;
 await fetch(API+"/api/class/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,password:pass})});
 classId=code;
 load();
}

async function load(){
 const res=await fetch(API+"/api/class/"+classId);
 const data=await res.json();
 document.getElementById("dashboard").innerHTML=data.map(d=>`<div>${d.student_name} - ${d.status}</div>`).join("");
 setTimeout(load,3000);
}
