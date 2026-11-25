document.querySelector("#registerForm")?.addEventListener("submit",async event=>{
 event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
 const msg=document.querySelector("#formMessage");msg.textContent="";
 const password=document.querySelector("#password").value;
 if(password!==document.querySelector("#confirmPassword").value){msg.textContent="Passwords do not match.";return;}
 const cgpa=Number(document.querySelector("#cgpa").value),attendance=Number(document.querySelector("#attendance").value);
 if(cgpa<0||cgpa>10||attendance<0||attendance>100){msg.textContent="Enter valid CGPA and attendance values.";return;}
 try{
  await PlacementAuth.register({name:document.querySelector("#name").value,email:document.querySelector("#email").value,course:document.querySelector("#course").value,password,cgpa,attendance});
  alert("Registration successful. Please login.");location.href="login.html";
 }catch(error){msg.textContent=error.message;}
});