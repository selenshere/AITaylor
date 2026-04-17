import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();

// 🔥 CORS (EN KRİTİK)
app.use(cors());

app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 🤖 CHAT
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages
    })
  });

  const data = await response.json();
  res.json(data);
});

// 💾 SAVE
app.post("/api/save", async (req, res) => {
  const { user_id, role, class_id, messages } = req.body;

  const { error } = await supabase.from("chats").insert({
    user_id,
    role,
    class_id,
    messages
  });

  if (error) return res.status(500).json(error);

  res.json({ ok: true });
});

// 👨‍🏫 EDUCATOR DATA
app.get("/api/class/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("class_id", req.params.id);

  res.json(data);
});

app.listen(3000, () => {
  console.log("Server running");
});
