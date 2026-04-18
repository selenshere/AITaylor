import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ---- CREATE CLASS ----
app.post("/api/class/create", async (req, res) => {
  const { code, password } = req.body;

  const { error } = await supabase.from("classes").insert({
    id: code,
    password
  });

  if (error) return res.status(400).json({ error: "exists" });

  res.json({ ok: true });
});

// ---- LOGIN CLASS ----
app.post("/api/class/login", async (req, res) => {
  const { code, password } = req.body;

  const { data } = await supabase
    .from("classes")
    .select("*")
    .eq("id", code)
    .eq("password", password)
    .maybeSingle();

  if (!data) return res.status(401).json({ error: "wrong" });

  res.json({ ok: true });
});

// ---- STUDENT JOIN ----
app.post("/api/student/join", async (req, res) => {
  const { name, class_id } = req.body;

  await supabase.from("students").upsert(
    { name, class_id },
    { onConflict: "name,class_id" }
  );

  const { data } = await supabase
    .from("progress")
    .select("*")
    .eq("student_name", name)
    .eq("class_id", class_id)
    .maybeSingle();

  res.json({ progress: data });
});

// ---- SAVE PROGRESS ----
app.post("/api/progress/upsert", async (req, res) => {
  const { student_name, class_id, messages, annotations, status } = req.body;

  await supabase.from("progress").upsert(
    {
      student_name,
      class_id,
      messages,
      annotations,
      status,
      updated_at: new Date()
    },
    { onConflict: "student_name,class_id" }
  );

  res.json({ ok: true });
});

// ---- GET CLASS DATA (TEACHER) ----
app.get("/api/class/:code", async (req, res) => {
  const { data } = await supabase
    .from("progress")
    .select("*")
    .eq("class_id", req.params.code);

  res.json(data);
});

// ---- CHAT ----
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages
    })
  });

  res.json(await r.json());
});

app.listen(3000);
