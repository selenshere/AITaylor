import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

const { OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// CREATE CLASS (custom code)
app.post("/api/class/create", async (req, res) => {
  const { teacher_name, password, classId } = req.body;

  const { error } = await supabase.from("classes").insert({
    id: classId,
    teacher_name,
    password,
  });

  if (error) return res.status(400).json({ error: "exists" });
  res.json({ classId });
});

// LOGIN
app.post("/api/class/login", async (req, res) => {
  const { classId, password } = req.body;

  const { data } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .eq("password", password)
    .maybeSingle();

  if (!data) return res.status(401).json({ error: "wrong" });
  res.json(data);
});

// JOIN (validated)
app.post("/api/student/join", async (req, res) => {
  const { name, class_id } = req.body;

  const { data } = await supabase
    .from("classes")
    .select("*")
    .eq("id", class_id)
    .maybeSingle();

  if (!data) return res.status(400).json({ error: "no class" });

  // duplicate engelle
  await supabase.from("students").upsert(
    { name, class_id },
    { onConflict: "name,class_id" }
  );

  // progress varsa getir
  const { data: progress } = await supabase
    .from("progress")
    .select("*")
    .eq("student_name", name)
    .eq("class_id", class_id)
    .maybeSingle();

  res.json({ ok: true, progress });
});

app.post("/api/progress/upsert", async (req, res) => {
  const { student_name, class_id, messages, status } = req.body;

  await supabase.from("progress").upsert(
    {
      student_name,
      class_id,
      messages,
      status,
      updated_at: new Date()
    },
    { onConflict: "student_name,class_id" }
  );

  res.json({ ok: true });
});

// PROGRESS
app.get("/api/progress/:classId", async (req, res) => {
  const { data } = await supabase
    .from("progress")
    .select("*")
    .eq("class_id", req.params.classId);

  res.json(data);
});

// CHAT
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
    }),
  });

  const data = await response.json();
  res.json(data);
});

// SUBMIT
app.post("/api/submit", async (req, res) => {
  const { student_name, class_id, messages } = req.body;

  await supabase.from("progress").upsert(
    {
      student_name,
      class_id,
      messages,
      status: "done",
      updated_at: new Date()
    },
    { onConflict: "student_name,class_id" }
  );

  res.json({ ok: true });
});

app.listen(3000);
