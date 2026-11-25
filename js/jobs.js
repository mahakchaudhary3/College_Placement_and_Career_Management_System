(() => {
 if(!window.PlacementAuth?.guard("student"))return;
 const grid=document.querySelector(".job-grid");if(!grid)return;
 const template=grid.querySelector(".job-card");const input=document.querySelector(".search-box input"),buttons=[...document.querySelectorAll(".filters button")],params=new URLSearchParams(location.search);
 if(params.get("search")&&input)input.value=params.get("search");
 let category="All Jobs",all=[];
 const render=()=>{
  grid.innerHTML="";const q=(input?.value||"").toLowerCase().trim();
  const filtered=all.filter(j=>(category==="All Jobs"||String(j.category).toLowerCase()===category.toLowerCase()||String(j.type).toLowerCase()===category.toLowerCase())&&(`${j.company} ${j.role} ${j.location} ${j.category}`).toLowerCase().includes(q));
  filtered.forEach(j=>{
   const card=template.cloneNode(true);
   card.querySelector(".job-head h3").textContent=j.company;card.querySelector(".job-head p").textContent=j.role;
   const logo=card.querySelector(".company-logo");if(logo)logo.textContent=(j.company||"J")[0];
   const spans=card.querySelectorAll(".job-info span");[j.package,j.location,j.type].forEach((v,i)=>{if(spans[i])spans[i].textContent=v||"";});
   const deadline=card.querySelector(".deadline");if(deadline)deadline.textContent="Deadline: "+new Date(j.deadline+"T00:00:00").toLocaleDateString("en-IN");
   const eligibility=card.querySelector(".eligibility");if(eligibility)eligibility.innerHTML="<strong>Eligibility:</strong> "+(j.eligibility||"");
   card.querySelectorAll(".card-buttons a").forEach(a=>{a.href=`job-details.html?id=${j.id}`;a.addEventListener("click",()=>localStorage.setItem("placementSelectedJob",JSON.stringify(j)));});
   grid.append(card);
  });
  let count=document.querySelector("#jobCountMessage");if(!count){count=document.createElement("p");count.id="jobCountMessage";document.querySelector(".filters").after(count);}count.textContent=`${filtered.length} job opportunities found`;
 };
 buttons.forEach(b=>b.addEventListener("click",()=>{buttons.forEach(x=>x.classList.remove("selected"));b.classList.add("selected");category=b.textContent.trim();render();}));
 input?.addEventListener("input",render);
 PortalDB.get("jobs").then(jobs=>{all=jobs;render();}).catch(()=>{grid.innerHTML="<p>Start JSON Server to load job opportunities.</p>";});
 const user=PlacementAuth.user();const name=document.querySelector(".topbar .student strong");const course=document.querySelector(".topbar .student small");if(name)name.textContent=user.name;if(course)course.textContent=user.course||"";
})();