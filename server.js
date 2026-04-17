
import express from "express";
import { createClient } from "@supabase/supabase-js";

const app=express();
app.use(express.json());

const supabase=createClient(
 process.env.SUPABASE_URL,
 process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post("/api/chat", async (req,res)=>{
 const r=await fetch("https://api.openai.com/v1/chat/completions",{
  method:"POST",
  headers:{
   "Content-Type":"application/json",
   "Authorization":"Bearer "+process.env.OPENAI_API_KEY
  },
  body:JSON.stringify({
   model:"gpt-4o-mini",
   messages:req.body.messages
  })
 });
 const data=await r.json();
 res.json({reply:data.choices[0].message.content});
});

app.post("/api/progress", async (req,res)=>{
 const {studentName,classId,messages,annotations,status}=req.body;
 const {error}=await supabase.from("progress").upsert({
  student_name:studentName,
  class_id:classId,
  messages,
  annotations,
  status,
  updated_at:new Date().toISOString()
 });
 if(error) return res.status(500).json(error);
 res.json({ok:true});
});

app.get("/api/teacher", async (req,res)=>{
 const {classId}=req.query;
 const {data,error}=await supabase.from("progress").select("*").eq("class_id",classId);
 if(error) return res.status(500).json(error);
 res.json(data);
});

app.use(express.static("public"));
app.get("/",(req,res)=>{
 res.sendFile(new URL("./public/index.html",import.meta.url).pathname);
});

app.listen(process.env.PORT||3000);
