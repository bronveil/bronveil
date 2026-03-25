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

function openGame(game){

 document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
 document.getElementById("gamePage").classList.add("active");

 document.getElementById("backBtn").style.display = "none";
 document.getElementById("backBtnGame").style.display = "block";

 if(game === "game1"){
   document.getElementById("gameFrame").src = "game/index.html";
 }

}

function closeGame(){

 document.getElementById("gamePage").classList.remove("active");
 document.getElementById("main").classList.add("active");

 document.getElementById("backBtn").style.display = "block";
 document.getElementById("backBtnGame").style.display = "none";

}

// ===== PARTICLES SYSTEM (CANVAS) =====

const canvas = document.getElementById("particlesCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for(let i=0;i<80;i++){
 particles.push({
   x: Math.random()*canvas.width,
   y: Math.random()*canvas.height,
   size: Math.random()*2 + 1,
   speedY: Math.random()*0.5 + 0.2
 });
}

function animateParticles(){
 ctx.clearRect(0,0,canvas.width,canvas.height);

 particles.forEach(p=>{
   p.y += p.speedY;

   if(p.y > canvas.height){
     p.y = 0;
     p.x = Math.random()*canvas.width;
   }

   ctx.beginPath();
   ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
   ctx.fillStyle = "rgba(180,120,255,0.8)";
ctx.shadowBlur = 15;
ctx.shadowColor = "#8a2cff";
   ctx.fill();
 });

 requestAnimationFrame(animateParticles);
}

animateParticles();

window.addEventListener("resize", ()=>{
 canvas.width = window.innerWidth;
 canvas.height = window.innerHeight;
});


// ===== CURSOR GLOW =====

const cursor = document.getElementById("cursorGlow");

document.addEventListener("mousemove", e=>{
 cursor.style.left = e.clientX + "px";
 cursor.style.top = e.clientY + "px";
});

function openGame(){
  window.location.href = "game/index.html";
}
