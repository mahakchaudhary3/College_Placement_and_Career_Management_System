(() => {
  const cards = [...document.querySelectorAll(".job-card")];
  if (!cards.length) return;
  const input = document.querySelector(".search-box input");
  const buttons = [...document.querySelectorAll(".filters button")];
  const params = new URLSearchParams(location.search);
  if (params.get("search") && input) input.value = params.get("search");
  let category = params.get("category") || "All Jobs";
  const filter = () => {
    const q = (input?.value || "").toLowerCase().trim();
    let shown = 0;
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const cat = category.toLowerCase();
      const categoryMatch = cat === "all jobs" ||
        (cat === "software" && /software|engineer|developer/.test(text)) ||
        (cat === "data" && /data|analyst/.test(text)) ||
        (cat === "full time" && text.includes("full time"));
      const ok = categoryMatch && (!q || text.includes(q));
      card.hidden = !ok;
      if (ok) shown++;
    });
    let count = document.querySelector("#jobCountMessage");
    if (!count) {
      count = document.createElement("p");
      count.id = "jobCountMessage";
      count.style.cssText = "margin:12px 0;color:#667085;font-size:13px";
      document.querySelector(".filters")?.after(count);
    }
    count.textContent = shown + " job opportunit" + (shown === 1 ? "y" : "ies") + " found";
  };
  buttons.forEach(button => button.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("selected"));
    button.classList.add("selected");
    category = button.textContent.trim();
    filter();
  }));
  input?.addEventListener("input", filter);
  if (category !== "All Jobs") {
    const match = buttons.find(b => b.textContent.trim().toLowerCase() === category.toLowerCase());
    if (match) { buttons.forEach(b => b.classList.remove("selected")); match.classList.add("selected"); }
  }
  cards.forEach((card, index) => {
    const company = card.querySelector(".job-head h3")?.textContent.trim() || "";
    const role = card.querySelector(".job-head p")?.textContent.trim() || "";
    const id = (company + "-" + role).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    card.dataset.jobId = id;
    card.querySelectorAll(".card-buttons a").forEach(link => link.addEventListener("click", () => {
      localStorage.setItem("placementSelectedJob", JSON.stringify({
        id, company, role,
        package: card.querySelector(".job-info span:nth-child(1)")?.textContent.trim() || "",
        location: card.querySelector(".job-info span:nth-child(2)")?.textContent.trim() || "",
        type: card.querySelector(".job-info span:nth-child(3)")?.textContent.trim() || "",
        deadline: card.querySelector(".deadline")?.textContent.replace("Deadline:", "").trim() || ""
      }));
      if (link.classList.contains("apply")) localStorage.setItem("placementApplyIntent", "1");
    }));
  });
  filter();
})();