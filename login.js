(() => {
  const form = document.querySelector(".login-card form");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.querySelector("#email")?.value.trim();
    const password = document.querySelector("#password")?.value;
    if (!email || !password) { alert("Please enter your login details."); return; }
    const KEY = "placementPortal";
    const d = JSON.parse(localStorage.getItem(KEY) || "{}");
    d.currentUser = { email, name: d.profile?.name || "Rahul Sharma", loggedInAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(d));
    location.href = "dashboard.html";
  });
  const remembered = localStorage.getItem("placementRememberedEmail");
  if (remembered && document.querySelector("#email")) {
    document.querySelector("#email").value = remembered;
    const check = form.querySelector('input[type="checkbox"]');
    if (check) check.checked = true;
  }
  form.addEventListener("submit", () => {
    const check = form.querySelector('input[type="checkbox"]');
    if (check?.checked) localStorage.setItem("placementRememberedEmail", document.querySelector("#email").value.trim());
    else localStorage.removeItem("placementRememberedEmail");
  });
})();
