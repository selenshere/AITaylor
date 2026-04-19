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
}
