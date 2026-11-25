(() => {
 if(!PlacementAuth.guard("student"))return;
 const user=PlacementAuth.user(),tbody=document.querySelector(".table-wrap tbody");if(!tbody)return;
 const search=document.querySelector(".filter input"),filter=document.querySelector(".filter select");let rows=[];
 const fmt=v=>v?new Date(v).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—";
 function render(){
  const q=(search?.value||"").toLowerCase(),status=filter?.value||"All Status";
  const list=rows.filter(a=>(`${a.company} ${a.role} ${a.status}`).toLowerCase().includes(q)&&(status==="All Status"||a.status===status));
  tbody.innerHTML="";
  list.forEach(a=>{const tr=document.createElement("tr");[a.company,a.role,fmt(a.appliedAt)].forEach(v=>{const td=document.createElement("td");td.textContent=v||"";tr.append(td);});
   const st=document.createElement("td"),b=document.createElement("b");b.className="status "+String(a.status).toLowerCase().replace(/\\s+/g,"-");b.textContent=a.status;st.append(b);tr.append(st);
   const act=document.createElement("td"),link=document.createElement("a");link.href=`job-details.html?id=${a.jobId}`;link.textContent="View";act.append(link);tr.append(act);tbody.append(tr);
  });
  const cards=document.querySelectorAll(".summary-card strong");if(cards[0])cards[0].textContent=rows.length;if(cards[1])cards[1].textContent=rows.filter(a=>a.status==="Shortlisted").length;if(cards[2])cards[2].textContent=rows.filter(a=>a.status==="Under Review").length;if(cards[3])cards[3].textContent=rows.filter(a=>a.status==="Interview Scheduled").length;
 }
 search?.addEventListener("input",render);filter?.addEventListener("change",render);
 PortalDB.get(`applications?studentId=${user.id}`).then(data=>{rows=data.sort((a,b)=>new Date(b.appliedAt)-new Date(a.appliedAt));render();}).catch(()=>{tbody.innerHTML='<tr><td colspan="5">Start JSON Server to load applications.</td></tr>';});
 const name=document.querySelector(".topbar .student strong");if(name)name.textContent=user.name;
})();