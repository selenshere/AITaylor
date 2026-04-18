import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const app=express();
app.use(cors());
app.use(express.json());

const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_KEY);

app.post("/api/chat", async(req,res)=>{
 const r=await fetch("https://api.openai.com/v1/chat/completions",{
  method:"POST",
  headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
  body:JSON.stringify({model:"gpt-4o-mini",messages:req.body.messages})
 });
 res.json(await r.json());
});

app.post("/api/progress/upsert", async(req,res)=>{
 await supabase.from("progress").upsert(req.body,{onConflict:"student_name,class_id"});
 res.json({ok:true});
});

app.get("/api/progress/:classId", async(req,res)=>{
 const {data}=await supabase.from("progress").select("*").eq("class_id",req.params.classId);
 res.json(data);
});

// CSV export
app.get("/api/export/:classId", async(req,res)=>{
 const {data}=await supabase.from("progress").select("*").eq("class_id",req.params.classId);
 let csv="name,status\n"+data.map(d=>`${d.student_name},${d.status}`).join("\n");
 res.header("Content-Type","text/csv");
 res.send(csv);
});

app.listen(3000);
