(() => {

  
  const KEY = "placementPortal";
  const data = JSON.parse(localStorage.getItem(KEY) || "{}");
  const search = document.createElement("div");
  search.className = "portal-home-search";
  search.innerHTML = '<input type="search" id="homeJobSearch" placeholder="Search jobs or companies"><button type="button">Search Jobs</button>';
  const hero = document.querySelector(".hero-content");
  if (hero) {
    hero.append(search);
    search.querySelector("button").addEventListener("click", () => {
      const q = search.querySelector("input").value.trim();
      location.href = "jobs.html" + (q ? "?search=" + encodeURIComponent(q) : "");
    });
    search.querySelector("input").addEventListener("keydown", e => {
      if (e.key === "Enter") search.querySelector("button").click();
    });
  }
  document.querySelectorAll(".company-card").forEach(card => {
    card.tabIndex = 0;
    card.title = "Explore jobs from " + card.textContent.trim();
    card.addEventListener("click", () => location.href = "jobs.html?search=" + encodeURIComponent(card.textContent.trim()));
    card.addEventListener("keydown", e => { if (e.key === "Enter") card.click(); });
  });
  document.querySelectorAll('a[href="#contact"]').forEach(a => a.addEventListener("click", () => {
    const contact = document.querySelector("#contact");
    if (contact) contact.scrollIntoView({ behavior: "smooth" });
  }));
})();