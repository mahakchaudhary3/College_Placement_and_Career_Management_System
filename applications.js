(() => {
  const KEY = "placementPortal";
  const tbody = document.querySelector(".table-wrap tbody");
  if (!tbody) return;
  const search = document.querySelector(".filter input");
  const rows = [...tbody.querySelectorAll("tr")];
  const seed = rows.map(row => {
    const cells = row.querySelectorAll("td");
    return {
      company: cells[0]?.textContent.trim() || "",
      role: cells[1]?.textContent.trim() || "",
      appliedOn: cells[2]?.textContent.trim() || "",
      status: cells[3]?.textContent.trim() || "Applied"
    };
  });
  const read = () => JSON.parse(localStorage.getItem(KEY) || "{}");
  const data = read();
  if (!Array.isArray(data.applications)) {
    data.applications = seed.map((a,i) => ({...a, jobId: "seed-"+i}));
    localStorage.setItem(KEY, JSON.stringify(data));
  }
  const render = () => {
    const d = read(), apps = d.applications || [], q = (search?.value || "").toLowerCase();
    tbody.innerHTML = "";
    apps.filter(a => (a.company+" "+a.role+" "+a.status).toLowerCase().includes(q)).forEach(a => {
      const tr = document.createElement("tr");
      const company = document.createElement("td"); company.textContent = a.company;
      const role = document.createElement("td"); role.textContent = a.role;
      const date = document.createElement("td"); date.textContent = a.appliedOn;
      const statusCell = document.createElement("td");
      const badge = document.createElement("b"); badge.className = "status "+(a.status.toLowerCase().replace(/\s+/g,"-")); badge.textContent = a.status; statusCell.append(badge);
      const action = document.createElement("td"); const link = document.createElement("a"); link.href = "job-details.html"; link.textContent = "View"; action.append(link);
      tr.append(company,role,date,statusCell,action); tbody.append(tr);
    });
    const summary = document.querySelectorAll(".summary-card strong");
    if(summary[0]) summary[0].textContent = apps.length;
    if(summary[1]) summary[1].textContent = apps.filter(a=>a.status==="Shortlisted").length;
    if(summary[2]) summary[2].textContent = apps.filter(a=>a.status==="Under Review").length;
    if(summary[3]) summary[3].textContent = apps.filter(a=>a.status==="Interview Scheduled").length;
  };
  search?.addEventListener("input", render);
  render();
})();