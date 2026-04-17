import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 🔥 TAYLOR SYSTEM PROMPT
const SYSTEM_PROMPT = `
You are Taylor, a student who thinks 1/4 + 1/6 = 1/10.
Explain your reasoning simply and consistently.
`;

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
    }),
  });

  const data = await response.json();
  res.json(data);
});

// 💾 SAVE
app.post("/api/submit", async (req, res) => {
  const { user_id, user_name, role, class_id, messages } = req.body;

  const { error } = await supabase.from("submissions").insert({
    user_id,
    user_name,
    role,
    class_id,
    messages,
  });

  if (error) return res.status(500).json(error);

  res.json({ ok: true });
});

// 👨‍🏫 DASHBOARD
app.get("/api/submissions/:classId", async (req, res) => {
  const { data } = await supabase
    .from("submissions")
    .select("*")
    .eq("class_id", req.params.classId);

  res.json(data);
});

app.listen(3000);
