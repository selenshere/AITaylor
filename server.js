import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 ENV
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 🤖 SYSTEM PROMPT
const SYSTEM_PROMPT = `
You are Taylor, a student who thinks 1/4 + 1/6 = 1/10.
Explain your reasoning simply and consistently.
`;

// 💬 CHAT
app.post("/api/chat", async (req, res) => {
  try {
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

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "chat failed" });
  }
});

// 💾 SUBMIT
app.post("/api/submit", async (req, res) => {
  try {
    const { user_id, user_name, role, class_id, messages } = req.body;

    const { error } = await supabase.from("submissions").insert({
      user_id,
      user_name,
      role,
      class_id,
      messages,
      status: "submitted"
    });

    if (error) {
      console.error(error);
      return res.status(500).json(error);
    }

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "submit failed" });
  }
});

// 📊 DASHBOARD
app.get("/api/submissions/:classId", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("class_id", req.params.classId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).json(error);
    }

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "fetch failed" });
  }
});

// 🟢 HEALTH CHECK (ÖNEMLİ)
app.get("/", (req, res) => {
  res.send("API running");
});

// 🚀 START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
