// TYPEWRITER

const text="BRONVEIL";
let i=0;

function typeEffect(){
 if(i<text.length){
  document.getElementById("typeText").innerHTML+=text[i];
  i++;
  setTimeout(typeEffect,140);
 }
}
typeEffect();

// PAGE SWITCH

function enterWorld(){
 document.getElementById("intro").classList.remove("active");
 document.getElementById("main").classList.add("active");
 document.getElementById("backBtn").style.display="block";
}

// TOGGLES

function togglePanel(id){
 let p=document.getElementById(id);
 p.style.display=p.style.display==="block"?"none":"block";
}

// PARTICLES

for(let i=0;i<80;i++){
 let p=document.createElement("div");
 p.className="particle";
 p.style.left=Math.random()*100+"vw";
 p.style.animationDuration=5+Math.random()*10+"s";
 document.body.appendChild(p);
}

function goIntro(){
 document.getElementById("main").classList.remove("active");
 document.getElementById("intro").classList.add("active");
 document.getElementById("backBtn").style.display="none";
}

const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  reveals.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);
