(() => {
  if (!PlacementAuth.guard("student")) return;

  const content = document.querySelector(".profile-content");
  if (!content) return;

  const session = PlacementAuth.user();
  const headerName = content.querySelector(".profile-header h2");
  const headerCourse = content.querySelector(".profile-header p");
  const paragraphs = [...content.querySelectorAll(".profile-grid .info-grid p")];
  const fields = ["name", "email", "phone", "location", "course", "branch", "percentage", "cgpa", "attendance"];
  const labels = ["Name", "Email", "Phone", "Location", "Course", "Branch", "12th Percentage", "CGPA", "Attendance (%)"];
  let student = null;

  function getInitials(name) {
    const parts = String(name || "Student").trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase() || "ST";
  }

  function updateAvatar(name) {
    const initials = getInitials(name);
    // Update every avatar on the page, including the top-right header avatar.
    document.querySelectorAll(".avatar, .profile-avatar").forEach(avatar => {
      avatar.textContent = initials;
      avatar.setAttribute("aria-label", `${name || "Student"} initials`);
    });
  }

  function setValue(index, value) {
    if (paragraphs[index]) paragraphs[index].textContent = value || "—";
  }

  function renderStudent(record) {
    student = record;
    if (headerName) headerName.textContent = record.name || "Student";
    updateAvatar(record.name || session.name);
    if (headerCourse) headerCourse.textContent = record.course || "—";
    setValue(0, record.name);
    setValue(1, record.email);
    setValue(4, record.course);
    setValue(7, record.cgpa === undefined || record.cgpa === null ? "Not updated" : Number(record.cgpa).toFixed(2));

    // Add the attendance display dynamically; no HTML or CSS file changes are needed.
    const academicCard = [...content.querySelectorAll(".profile-grid .card")]
      .find(card => card.querySelector("h3")?.textContent.trim() === "Academic Information");
    const infoGrid = academicCard?.querySelector(".info-grid");
    if (infoGrid) {
      let attendanceBlock = infoGrid.querySelector('[data-profile-attendance="true"]');
      if (!attendanceBlock) {
        attendanceBlock = document.createElement("div");
        attendanceBlock.dataset.profileAttendance = "true";
        const small = document.createElement("small");
        small.textContent = "Attendance";
        const p = document.createElement("p");
        attendanceBlock.append(small, p);
        infoGrid.append(attendanceBlock);
      }
      attendanceBlock.querySelector("p").textContent = record.attendance === undefined || record.attendance === null ? "Not updated" : `${Number(record.attendance)}%`;
    }
  }

  async function loadStudent() {
    try {
      const fresh = await PortalDB.get(`students/${encodeURIComponent(session.id)}`);
      renderStudent(fresh);
    } catch (error) {
      console.error("Could not load student profile from JSON Server:", error);
      if (headerName && session.name) headerName.textContent = session.name;
      updateAvatar(session.name);
    }
  }

  const edit = content.querySelector(".profile-header button");
  edit?.addEventListener("click", () => {
    if (!student || content.querySelector(".profile-edit-panel")) return;
    const panel = document.createElement("section");
    panel.className = "card full profile-edit-panel";
    panel.style.cssText = "margin:16px 0;padding:18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px";

    fields.forEach((field, index) => {
      const label = document.createElement("label");
      label.textContent = labels[index];
      const input = document.createElement("input");
      input.name = field;
      input.value = student[field] ?? "";
      input.style.cssText = "display:block;width:100%;padding:10px;border:1px solid #ccd5df;border-radius:5px;margin-top:5px;box-sizing:border-box";
      if (field === "cgpa") {
        input.type = "number"; input.min = "0"; input.max = "10"; input.step = "0.01";
      } else if (field === "attendance") {
        input.type = "number"; input.min = "0"; input.max = "100"; input.step = "0.1";
      }
      if (["name", "email", "course", "cgpa", "attendance"].includes(field)) input.required = true;
      label.append(input);
      panel.append(label);
    });

    const save = document.createElement("button");
    save.type = "button";
    save.textContent = "Save Changes";
    save.style.cssText = "padding:10px 16px;background:#0b2d4d;color:white;border:0;border-radius:5px;cursor:pointer";
    save.addEventListener("click", async () => {
      const values = Object.fromEntries([...panel.querySelectorAll("input")].map(input => [input.name, input.value.trim()]));
      const cgpa = Number(values.cgpa), attendance = Number(values.attendance);
      if (!values.name || !values.email || !values.course || values.cgpa === "" || values.attendance === "" || !Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10 || !Number.isFinite(attendance) || attendance < 0 || attendance > 100) {
        alert("Enter valid name, email, course, CGPA (0–10) and attendance (0–100).");
        return;
      }
      save.disabled = true;
      save.textContent = "Saving...";
      try {
        const updated = await PortalDB.patch("students", student.id, {
          name: values.name,
          email: values.email.toLowerCase(),
          phone: values.phone,
          location: values.location,
          course: values.course,
          branch: values.branch,
          percentage: values.percentage,
          cgpa,
          attendance
        });
        localStorage.setItem("placementSession", JSON.stringify({
          ...session, name: updated.name, email: updated.email, course: updated.course,
          cgpa: updated.cgpa, attendance: updated.attendance
        }));
        panel.remove();
        renderStudent(updated);
        alert("Profile and academic details saved successfully.");
      } catch (error) {
        console.error(error);
        alert("Could not save profile. Make sure JSON Server is running on port 3002.");
        save.disabled = false;
        save.textContent = "Save Changes";
      }
    });
    panel.append(save);
    content.querySelector(".profile-grid")?.before(panel);
  });

  loadStudent();
})();
