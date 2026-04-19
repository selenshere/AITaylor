const supabaseClient = window.supabase.createClient(
  "https://xrxbjcfmljimozznnvmy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeGJqY2ZtbGppbW96em5udm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzM2MjgsImV4cCI6MjA5MjAwOTYyOH0.Y9QvsAkD1FeAvRJrQTNdy59ridkXYQO1nfPul1LF34o"
);

async function loadData() {
  const { data, error } = await supabaseClient
    .from("submissions")
    .select("*")
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

    div.innerHTML = `
      <b>${item.first_name} ${item.last_name}</b><br>
      <small>${new Date(item.created_at).toLocaleString()}</small><br><br>

      <button class="btn primary" onclick='downloadOne(${JSON.stringify(item)})'>
        Download JSON
      </button>
    `;

    list.appendChild(div);
  });
}

function downloadOne(item) {
  const content = JSON.stringify(item, null, 2);

  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${item.first_name}_${item.last_name}.json`;
  a.click();
}

async function exportCSV() {
  const { data } = await supabaseClient
    .from("submissions")
    .select("*");

  const rows = data.map(d => ({
    name: d.first_name + " " + d.last_name,
    date: d.created_at,
    session: d.session_id
  }));

  const csv = [
    Object.keys(rows[0]).join(","),
    ...rows.map(r => Object.values(r).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "submissions.csv";
  a.click();
}

// auto load
loadData();
data.forEach(item => {
  const div = document.createElement("div");
  div.className = "card";

  const messages = item.data?.messages || [];

  const textVersion = messages
    .map(m => `${m.who}: ${m.text}`)
    .join("\n");

  div.innerHTML = `
    <b>${item.first_name} ${item.last_name}</b><br>
    <small>${new Date(item.created_at).toLocaleString()}</small><br><br>

    <details>
      <summary>Preview</summary>
      <pre style="max-height:200px; overflow:auto; background:#f5f5f5; padding:10px;">
${textVersion}
      </pre>
    </details>

    <button class="btn primary" onclick='downloadJSON(${JSON.stringify(item)})'>
      JSON
    </button>

    <button class="btn secondary" onclick='downloadTXT(${JSON.stringify(textVersion)})'>
      TXT
    </button>
  `;

  list.appendChild(div);
});

function downloadTXT(text) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "chat.txt";
  a.click();
}

function downloadJSON(item) {
  const content = JSON.stringify(item, null, 2);

  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${item.first_name}_${item.last_name}.json`;
  a.click();
}
