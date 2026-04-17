import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// CHAT (proxy)
app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: req.body.messages,
        temperature: 0.7
      })
    });

    const data = await r.json();
    res.json({ reply: data.choices[0].message.content });

  } catch (e) {
    res.status(500).send(e.message);
  }
});

// SAVE PROGRESS
app.post("/api/progress", async (req, res) => {
  const { studentName, classId, messages, annotations, status } = req.body;

  const { error } = await supabase
    .from("progress")
    .upsert({
      student_name: studentName,
      class_id: classId,
      messages,
      annotations,
      status,
      updated_at: new Date().toISOString()
    });

  if (error) return res.status(500).json(error);

  res.json({ ok: true });
});

// TEACHER DASHBOARD DATA
app.get("/api/teacher", async (req, res) => {
  const { classId } = req.query;

  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("class_id", classId);

  if (error) return res.status(500).json(error);

  res.json(data);
});

// STATIC (ROOT FIX)
app.use(express.static("public"));

// 🔥 CRITICAL FIX (root çalışmama sorunu)
app.get("/", (req, res) => {
  res.sendFile(new URL("./public/index.html", import.meta.url).pathname);
});

app.listen(process.env.PORT || 3000);
