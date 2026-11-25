(() => {
 if(!PlacementAuth.guard("student"))return;
 const user=PlacementAuth.user();
 document.addEventListener("DOMContentLoaded",async()=>{
  const name=document.querySelector(".topbar .student strong"),welcome=document.querySelector(".welcome h1");
  if(name)name.textContent=user.name;if(welcome)welcome.textContent=`Welcome back, ${user.name}!`;
  const search=document.querySelector(".topbar .search input");
  search?.addEventListener("keydown",e=>{if(e.key==="Enter"&&search.value.trim())location.href="jobs.html?search="+encodeURIComponent(search.value.trim());});
  const interviewBox=document.querySelector("#dashboardInterview");
  try{
   const [jobs,apps,allInterviews]=await Promise.all([PortalDB.get("jobs"),PortalDB.get(`applications?studentId=${user.id}`),PortalDB.get(`interviews?studentId=${user.id}`)]);
   const now=new Date();
   const upcoming=allInterviews.filter(i=>new Date(`${i.date}T${i.time||"23:59"}:00`)>now).sort((a,b)=>new Date(`${a.date}T${a.time||"00:00"}`)-new Date(`${b.date}T${b.time||"00:00"}`));
   const stats=document.querySelectorAll(".stats .stat-card strong");
   if(stats[0])stats[0].textContent=jobs.length;if(stats[1])stats[1].textContent=apps.length;if(stats[2])stats[2].textContent=apps.filter(a=>a.status==="Shortlisted").length;
   if(stats[3])stats[3].textContent=upcoming.length;
   if(interviewBox){
    interviewBox.innerHTML="";
    if(!upcoming.length){const p=document.createElement("p");p.textContent="No upcoming interviews scheduled yet. Apply for a job and wait for the admin to schedule your interview.";interviewBox.append(p);}
    else{
     const i=upcoming[0],company=document.createElement("div");company.className="interview-company";
     const icon=document.createElement("div");icon.className="round-icon";icon.textContent=(i.company||"C").charAt(0);
     const details=document.createElement("div"),strong=document.createElement("strong"),round=document.createElement("span");
     strong.textContent=i.company||"Company";round.textContent=i.round||"Interview";details.append(strong,round);company.append(icon,details);
     const info=document.createElement("div");info.className="interview-details";
     [["Date",new Date(`${i.date}T00:00:00`).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})],["Time",i.time],["Mode",i.mode]].forEach(([label,value])=>{const d=document.createElement("div"),small=document.createElement("small"),b=document.createElement("strong");small.textContent=label;b.textContent=value||"—";d.append(small,b);info.append(d);});
     interviewBox.append(company,info);
    }
   }
  }catch(e){if(interviewBox)interviewBox.textContent="Interview information is unavailable. Check JSON Server connection.";console.error(e);}
 });
})();