import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 ENV CHECK
const {
  OPENAI_API_KEY,
  SUPABASE_URL,
  SUPABASE_KEY
} = process.env;

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing ENV variables");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 🏫 CREATE CLASS
app.post("/api/class/create", async (req, res) => {
  const { teacher_name, password } = req.body;

  const classId = "class-" + Date.now(); // 🔥 fix

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

  if (error || !data) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json(data);
});

// 👨‍🎓 JOIN
app.post("/api/student/join", async (req, res) => {
  const { name, class_id } = req.body;

  const { error } = await supabase.from("students").insert({
    name,
    class_id,
  });

  if (error) return res.status(500).json(error);

  res.json({ ok: true });
});

// 📊 STUDENTS
app.get("/api/students/:classId", async (req, res) => {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("class_id", req.params.classId);

  if (error) return res.status(500).json(error);

  res.json(data);
});

// 💬 CHAT
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  const systemPrompt = `
You are Taylor, a student solving a fraction problem.
You sometimes make mistakes but explain your thinking.
Keep answers short and student-like.
`;

  try {
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

    if (!data.choices) {
      return res.status(500).json({ error: "OpenAI error", data });
    }

    res.json(data);

  } catch (e) {
    res.status(500).json({ error: "Chat failed" });
  }
});

// 📤 SUBMIT
app.post("/api/submit", async (req, res) => {
  const { student_name, class_id, messages } = req.body;

  const { error } = await supabase.from("progress").insert({
    student_name,
    class_id,
    messages,
  });

  if (error) return res.status(500).json(error);

  res.json({ ok: true });
});

// 🚀 START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
