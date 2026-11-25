document.querySelector("#loginForm")?.addEventListener("submit",async event=>{
 event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
 const msg=document.querySelector("#formMessage");msg.textContent="";
 try{const dest=await PlacementAuth.login(document.querySelector("#email").value,document.querySelector("#password").value,document.querySelector('input[name="role"]:checked').value);location.href=dest;}
 catch(error){msg.textContent=error.message;}
});