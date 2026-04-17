import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 ENV
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 🏫 CREATE CLASS
app.post("/api/class/create", async (req, res) => {
  const { teacher_name, password } = req.body;

  const classId = "class-" + Math.floor(Math.random() * 10000);

  const { error } = await supabase.from("classes").insert({
    id: classId,
    teacher_name,
    password,
  });

  if (error) return res.status(500).json(error);

  res.json({ classId });
});

// 🔑 LOGIN
app.post("/api/class/login", async (req, res) => {
  const { classId, password } = req.body;

  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .eq("password", password)
    .single();

  if (error) return res.status(401).json({ error: "wrong" });

  res.json(data);
});

// JOIN
app.post("/api/student/join", async (req, res) => {
  const { name, class_id } = req.body;

  await supabase.from("students").upsert({
    name,
    class_id,
  });

  res.json({ ok: true });
});

// STUDENTS
app.get("/api/students/:classId", async (req, res) => {
  const { data } = await supabase
    .from("students")
    .select("*")
    .eq("class_id", req.params.classId);

  res.json(data);
});

// 💬 CHAT (TAYLOR)
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  const systemPrompt = `
You are Taylor, a student solving a fraction problem.
You sometimes make mistakes but explain your thinking.
Keep answers short and student-like.
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
  });

  const data = await response.json();
  res.json(data);
});

// SUBMIT
app.post("/api/submit", async (req, res) => {
  const { student_name, class_id, messages } = req.body;

  await supabase.from("progress").upsert({
    student_name,
    class_id,
    messages,
    status: "submitted",
  });

  res.json({ ok: true });
});

// AUTOSAVE
app.post("/api/progress/save", async (req, res) => {
  const { student_name, class_id, messages } = req.body;

  await supabase.from("progress").upsert({
    student_name,
    class_id,
    messages,
    status: "working",
    updated_at: new Date()
  });

  res.json({ ok: true });
});

// DASHBOARD DATA
app.get("/api/progress/:classId", async (req, res) => {
  const { data } = await supabase
    .from("progress")
    .select("*")
    .eq("class_id", req.params.classId);

  res.json(data);
});

app.listen(3000, () => console.log("Server running"));
