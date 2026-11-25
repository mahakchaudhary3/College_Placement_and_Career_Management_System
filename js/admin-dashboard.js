(() => {
 if(!PlacementAuth.guard("admin"))return;
 const $=s=>document.querySelector(s),criteriaKey="placementCompanyCriteria";
 const defaults={TCS:6.5,Infosys:7,Wipro:6.5,Accenture:7,Deloitte:8,Capgemini:6.5};
 const readCriteria=()=>{try{return {...defaults,...JSON.parse(localStorage.getItem(criteriaKey)||"{}")}}catch{return {...defaults}}};
 let criteria=readCriteria(),students=[],jobs=[],applications=[],interviews=[];
 const fmt=v=>v?new Date(v).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—";
 function renderStudents(){
  const q=($("#studentSearch").value||"").toLowerCase(),body=$("#studentRows");body.innerHTML="";
  const list=students.filter(s=>(`${s.name} ${s.email} ${s.course}`).toLowerCase().includes(q));
  list.forEach(s=>{
   const tr=document.createElement("tr");
   const eligible=Object.entries(criteria).filter(([company,min])=>Number(s.cgpa)>=Number(min)&&Number(s.attendance)>=75).map(([company])=>company);
   [s.name+" ("+s.email+")",s.course||"—",Number(s.cgpa||0).toFixed(2),`${Number(s.attendance||0)}%`].forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.append(td);});
   const at=document.createElement("td");at.innerHTML=`<span class="pill ${Number(s.attendance)>=75?"yes":"no"}">${Number(s.attendance)>=75?"Meets 75% rule":"Below 75%"}</span>`;tr.append(at);
   const co=document.createElement("td");co.textContent=eligible.length?eligible.join(", "):"Not eligible under current criteria";tr.append(co);body.append(tr);
  });
  $("#totalStudents").textContent=students.length;
  $("#eligibleStudents").textContent=students.filter(s=>Number(s.attendance)>=75&&Object.values(criteria).some(min=>Number(s.cgpa)>=Number(min))).length;
  $("#lowAttendance").textContent=students.filter(s=>Number(s.attendance)<75).length;
 }
 function renderApplications(){
  $("#totalApplications").textContent=applications.length;
  const body=$("#applicationRows");body.innerHTML="";
  applications.slice().sort((a,b)=>new Date(b.appliedAt)-new Date(a.appliedAt)).forEach(a=>{
   const s=students.find(x=>String(x.id)===String(a.studentId));
   const tr=document.createElement("tr");
   [s?.name||a.studentName||`Student ${a.studentId}`,a.company,a.role,fmt(a.appliedAt),a.status].forEach(v=>{const td=document.createElement("td");td.textContent=v||"—";tr.append(td);});
   body.append(tr);
  });
  if(!applications.length)body.innerHTML='<tr><td colspan="5">No applications submitted yet.</td></tr>';
 }
 function populateApplicationSelect(){
  const select=$("#interviewApplication");select.innerHTML='<option value="">Select an application</option>';
  applications.filter(a=>!["Rejected","Withdrawn"].includes(a.status)).forEach(a=>{
   const student=students.find(s=>String(s.id)===String(a.studentId));
   const label=`${student?.name||a.studentName||"Student"} — ${a.company} / ${a.role} (Applied ${a.appliedAt?new Date(a.appliedAt).toLocaleDateString("en-IN"):"date unavailable"})`;
   const option=document.createElement("option");option.value=a.id;option.textContent=label;select.append(option);
  });
 }
 async function load(){
  try{
   [students,jobs,applications,interviews]=await Promise.all([PortalDB.get("students"),PortalDB.get("jobs"),PortalDB.get("applications"),PortalDB.get("interviews")]);
   renderStudents();renderApplications();populateApplicationSelect();
  }catch(e){
   $("#studentRows").innerHTML='<tr><td colspan="6">Cannot connect to JSON Server. Start npm run db and check port 3002.</td></tr>';
   console.error(e);
  }
 }
 document.querySelectorAll("[data-company]").forEach(input=>{
  input.value=criteria[input.dataset.company]??6.5;
  input.addEventListener("change",()=>{
   const n=Number(input.value);
   if(n<6.5||n>8){input.setCustomValidity("Set CGPA between 6.5 and 8.0");input.reportValidity();return;}
   input.setCustomValidity("");criteria[input.dataset.company]=n;localStorage.setItem(criteriaKey,JSON.stringify(criteria));renderStudents();
  });
 });
 $("#studentSearch").addEventListener("input",renderStudents);
 $("#interviewApplication").addEventListener("change",()=>{
  const app=applications.find(a=>String(a.id)===String($("#interviewApplication").value));
  const student=app&&students.find(s=>String(s.id)===String(app.studentId));
  $("#selectedApplicationInfo").textContent=app?`Student: ${student?.name||app.studentName||"Student"} • Company: ${app.company} • Role: ${app.role} • Status: ${app.status}`:"Select an application to view the student and company.";
 });
 const date=$("#interviewDate");const now=new Date();const localNow=new Date(now.getTime()-now.getTimezoneOffset()*60000);date.min=localNow.toISOString().slice(0,10);
 $("#interviewForm").addEventListener("submit",async e=>{
  e.preventDefault();const msg=$("#scheduleMessage");msg.textContent="";
  const app=applications.find(a=>String(a.id)===String($("#interviewApplication").value));
  if(!app){msg.textContent="Select a submitted application first.";return;}
  const student=students.find(s=>String(s.id)===String(app.studentId));
  const dateValue=date.value,time=$("#interviewTime").value,scheduled=new Date(`${dateValue}T${time}:00`);
  if(!dateValue||!time||Number.isNaN(scheduled.getTime())||scheduled<=new Date()){msg.textContent="Choose a future interview date and time.";return;}
  try{
   await PortalDB.post("interviews",{
    applicationId:app.id,studentId:app.studentId,studentName:student?.name||app.studentName||"",
    jobId:app.jobId,company:app.company,role:app.role,round:$("#interviewRound").value.trim(),
    date:dateValue,time,mode:$("#interviewMode").value,notes:$("#interviewNotes").value.trim(),
    status:"Upcoming",createdAt:new Date().toISOString()
   });
   msg.textContent="Interview scheduled for the selected application. It will appear in the student's schedule.";
   e.target.reset();$("#selectedApplicationInfo").textContent="Select an application to view the student and company.";
   date.min=localNow.toISOString().slice(0,10);
   interviews=await PortalDB.get("interviews");
  }catch(err){msg.textContent="Could not save interview. Check that JSON Server is running on port 3002.";}
 });
 load();
})();