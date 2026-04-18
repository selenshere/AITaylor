import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const app=express();
app.use(cors());
app.use(express.json());

const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_KEY);

app.post("/api/class/create", async(req,res)=>{
 await supabase.from("classes").insert({id:req.body.code,password:req.body.password});
 res.json({ok:true});
});

app.post("/api/class/login", async(req,res)=>{
 const {data}=await supabase.from("classes").select("*").eq("id",req.body.code).eq("password",req.body.password).maybeSingle();
 if(!data)return res.status(401).json({error:"wrong"});
 res.json({ok:true});
});

app.post("/api/progress/upsert", async(req,res)=>{
 await supabase.from("progress").upsert(req.body,{onConflict:"student_name,class_id"});
 res.json({ok:true});
});

app.get("/api/class/:id", async(req,res)=>{
 const {data}=await supabase.from("progress").select("*").eq("class_id",req.params.id);
 res.json(data);
});

app.post("/api/chat", async(req,res)=>{
 const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-4o-mini",messages:req.body.messages})});
 res.json(await r.json());
});

app.listen(3000);
