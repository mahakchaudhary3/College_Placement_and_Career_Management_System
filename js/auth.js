(() => {
  const ADMIN_EMAIL = "mk9142812668@gmail.com";
  const ADMIN_PASSWORD = "Madhav@123";
  const SESSION_KEY = "placementSession";
  const readSession = () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } };
  window.PlacementAuth = {
    user: readSession,
    async register({name,email,course,password,cgpa,attendance}) {
      const normalized = email.trim().toLowerCase();
      const users = await PortalDB.get(`students?email=${encodeURIComponent(normalized)}`);
      if (users.length) throw new Error("This email is already registered.");
      return PortalDB.post("students", {
        name:name.trim(),
        email:normalized,
        course:course.trim(),
        password,
        cgpa:Number(cgpa),
        attendance:Number(attendance),
        createdAt:new Date().toISOString()
      });
    },
    async login(email,password,role) {
      email=email.trim().toLowerCase();
      if(role==="admin") {
        if(email!==ADMIN_EMAIL || password!==ADMIN_PASSWORD) throw new Error("Invalid admin email or password.");
        localStorage.setItem(SESSION_KEY,JSON.stringify({role:"admin",name:"Admin",email}));
        return "admin-dashboard.html";
      }
      const users=await PortalDB.get(`students?email=${encodeURIComponent(email)}`);
      const student=users.find(u=>u.password===password);
      if(!student) throw new Error("Please register first or check your login details.");
      localStorage.setItem(SESSION_KEY,JSON.stringify({role:"student",id:student.id,name:student.name,email:student.email,course:student.course,cgpa:student.cgpa,attendance:student.attendance}));
      return "dashboard.html";
    },
    logout(){localStorage.removeItem(SESSION_KEY);location.href="login.html";},
    guard(role){
      const user=readSession();
      if(!user){location.replace("login.html");return false;}
      if(role&&user.role!==role){location.replace(user.role==="admin"?"admin-dashboard.html":"dashboard.html");return false;}
      return true;
    }
  };
  document.addEventListener("DOMContentLoaded",()=>{
    const session = readSession();
    // All student pages share this script, so update every header/profile avatar here.
    if (session?.role === "student") {
      const initials = String(session.name || "Student")
        .trim()
        .split(/\\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part.charAt(0))
        .join("")
        .toUpperCase() || "ST";
      document.querySelectorAll(".avatar, .profile-avatar").forEach(avatar => {
        avatar.textContent = initials;
        avatar.setAttribute("aria-label", `${session.name || "Student"} initials`);
      });
    }
    document.querySelectorAll(".logout,[data-logout]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();PlacementAuth.logout();}));
  });
})();
