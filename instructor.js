const supabaseClient = window.supabase.createClient(
  "https://xrxbjcfmljimozznnvmy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeGJqY2ZtbGppbW96em5udm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzM2MjgsImV4cCI6MjA5MjAwOTYyOH0.Y9QvsAkD1FeAvRJrQTNdy59ridkXYQO1nfPul1LF34o"
);

function hideAll() {
  document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
}

function showCreate() {
  hideAll();
  document.getElementById("pageCreate").classList.remove("hidden");
}

function showLogin() {
  hideAll();
  document.getElementById("pageLogin").classList.remove("hidden");
}

function showDashboard() {
  hideAll();
  document.getElementById("pageDashboard").classList.remove("hidden");
}

// ---------------- CREATE CLASS ----------------

async function createClass() {
  const name = document.getElementById("className").value;
  const password = document.getElementById("classPassword").value;

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data, error } = await supabaseClient
    .from("classes")
    .insert([{
      name,
      class_code: code,
      password
    }])
    .select()    
    .single();  

  if (error) {
    alert(error.message);
  } else {
    document.getElementById("classResult").innerText = "Class created!";
    document.getElementById("copyBox").classList.remove("hidden");
    document.getElementById("classCodeDisplay").value = code;
    document.getElementById("classInfo").innerText =
      `Class: ${name} | Code: ${code}`;

    localStorage.setItem("class_id", data.id);

    showDashboard();
    loadData();
  }
}

// ---------------- LOGIN CLASS ----------------

async function loginClass() {
  const code = document.getElementById("loginCode").value;
  const password = document.getElementById("loginPassword").value;

  const { data, error } = await supabaseClient
    .from("classes")
    .select("*")
    .eq("class_code", code)
    .eq("password", password)
    .single();

  if (!data) {
    alert("Wrong code or password");
    return;
  }

  document.getElementById("classInfo").innerText =
  `Class: ${data.name} | Code: ${data.class_code}`;

  localStorage.setItem("class_id", data.id);

  showDashboard();
  loadData();
}

// ---- ANALYTICS ----
function buildAnalytics(item) {
  const messages = item.data?.messages || [];
  const annotations = item.data?.annotations || {};

  const teacherMsgs = messages.filter(m => m.who === "teacher").length;
  const studentMsgs = messages.filter(m => m.who === "taylor").length;

  const totalChars = messages.reduce((sum, m) => sum + (m.text?.length || 0), 0);

  const totalWords = messages.reduce((sum, m) => {
    return sum + (m.text ? m.text.trim().split(/\s+/).length : 0);
  }, 0);

  let durationMin = 0;
  if (messages.length > 1) {
    const first = new Date(messages[0].ts).getTime();
    const last = new Date(messages[messages.length - 1].ts).getTime();
    durationMin = ((last - first) / 1000 / 60).toFixed(2);
  }

  return {
    name: item.first_name + " " + item.last_name,
    session_id: item.session_id,
    total_messages: messages.length,
    teacher_messages: teacherMsgs,
    student_messages: studentMsgs,
    annotation_count: Object.keys(annotations).length,
    total_characters: totalChars,
    total_words: totalWords,
    duration_minutes: durationMin,
    created_at: item.created_at
  };
}

// ---- CLEAN TXT ----
function buildCleanTXT(item) {
  const messages = item.data?.messages || [];

  return messages.map((m, i) => {
    return `[${i + 1}] ${m.who.toUpperCase()}
${m.text}
`;
  }).join("\n");
}

// ---- CLEAN JSON ----
function buildCleanJSON(item) {
  return {
    meta: {
      name: item.first_name + " " + item.last_name,
      session_id: item.session_id,
      created_at: item.created_at
    },
    messages: item.data?.messages || [],
    annotations: item.data?.annotations || {}
  };
}

// ---- DOWNLOADS ----
function downloadJSON(item) {
  const clean = buildCleanJSON(item);

  const blob = new Blob(
    [JSON.stringify(clean, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${item.first_name}_${item.last_name}.json`;
  a.click();
}

function downloadTXT(item) {
  const text = buildCleanTXT(item);

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${item.first_name}_${item.last_name}.txt`;
  a.click();
}

function downloadAnalytics(item) {
  const analytics = buildAnalytics(item);

  const blob = new Blob(
    [JSON.stringify(analytics, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${item.first_name}_${item.last_name}_analytics.json`;
  a.click();
}

// ---- CSV EXPORT ----
async function exportCSV() {
  const classId = localStorage.getItem("class_id");

  const { data } = await supabaseClient
    .from("submissions")
    .select("*")
    .eq("class_id", classId);

  if (!data || data.length === 0) {
    alert("No data");
    return;
  }

  const rows = data.map(d => {
    const a = buildAnalytics(d);

    return {
      name: a.name,
      total_messages: a.total_messages,
      teacher_messages: a.teacher_messages,
      student_messages: a.student_messages,
      annotations: a.annotation_count,
      words: a.total_words,
      characters: a.total_characters,
      duration_min: a.duration_minutes,
      date: a.created_at
    };
  });

  const csv = [
    Object.keys(rows[0]).join(","),
    ...rows.map(r => Object.values(r).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "submissions_analytics.csv";
  a.click();
}

// ---- LOAD DATA ----
async function loadData() {
  const classId = localStorage.getItem("class_id");

  const { data, error } = await supabaseClient
    .from("submissions")
    .select("*")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  if (error) {
    alert(error.message);
    return;
  }

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";

    const analytics = buildAnalytics(item);
    const textPreview = buildCleanTXT(item).slice(0, 300);

    div.innerHTML = `
      <b>${analytics.name}</b><br>
      <small>${new Date(item.created_at).toLocaleString()}</small><br><br>

      <details>
        <summary>Preview</summary>
        <pre style="max-height:200px; overflow:auto; background:#f5f5f5; padding:10px;">
${textPreview}
        </pre>
      </details>

      <button class="btn primary" onclick='downloadJSON(${JSON.stringify(item)})'> JSON </button>
      <button class="btn secondary" onclick='downloadTXT(${JSON.stringify(item)})'> TXT </button>
      <button class="btn secondary" onclick='downloadAnalytics(${JSON.stringify(item)})'> Analytics </button>`;

    list.appendChild(div);
  });
}

// ---------------- GLOBAL FIX ----------------
window.createClass = createClass;
window.loginClass = loginClass;
window.loadData = loadData;
window.exportCSV = exportCSV;
window.showCreate = showCreate;
window.showLogin = showLogin;

// başlangıç ekranı
hideAll();
document.getElementById("pageStart")?.classList.remove("hidden");

function copyCode() {
  const input = document.getElementById("classCodeDisplay");
  input.select();
  document.execCommand("copy");
}
