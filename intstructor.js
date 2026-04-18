const supabase = supabase.createClient(
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY"
);

async function loadData() {
  const { data } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  const table = document.getElementById("table");

  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Date</th>
      <th>Session</th>
    </tr>
  `;

  data.forEach(d => {
    table.innerHTML += `
      <tr>
        <td>${d.first_name} ${d.last_name}</td>
        <td>${new Date(d.created_at).toLocaleString()}</td>
        <td>${d.session_id}</td>
      </tr>
    `;
  });
}

async function exportCSV() {
  const { data } = await supabase.from("submissions").select("*");

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
