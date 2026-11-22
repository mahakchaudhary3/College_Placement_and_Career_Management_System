(() => {
  const KEY = "placementPortal";
  const d = JSON.parse(localStorage.getItem(KEY) || "{}");
  const apps = d.applications || [];
  const jobs = document.querySelectorAll(".job-card");
  const upcoming = (d.interviews || []).filter(i => i.status !== "Completed").length;
  const stats = document.querySelectorAll(".stats .stat-card strong");
  if (stats[0]) stats[0].textContent = jobs.length;
  if (stats[1]) stats[1].textContent = apps.length;
  if (stats[2]) stats[2].textContent = apps.filter(a => a.status === "Shortlisted").length;
  if (stats[3]) stats[3].textContent = upcoming || 1;
  const name = d.profile?.name || d.currentUser?.name;
  if (name) {
    const student = document.querySelector(".topbar .student strong");
    const welcome = document.querySelector(".welcome h1");
    if (student) student.textContent = name;
    if (welcome) welcome.textContent = "Welcome back, " + name + "!";
  }
  const search = document.querySelector(".topbar .search input");
  search?.addEventListener("keydown", e => {
    if (e.key === "Enter" && search.value.trim()) location.href = "jobs.html?search=" + encodeURIComponent(search.value.trim());
  });
})();