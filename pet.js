const pet = document.getElementById("pet");


// Position
let petX = window.innerWidth / 2;
let petY = window.innerHeight / 2;
let targetX = petX;
let targetY = petY;

// State
let state = "idle";
let frame = 0;
let frameTimer = 0;

// Animation frames
const animations = {
  idle: ["images/idle1.png","images/idle2.png"],
  walk: ["images/walk1.png","images/walk2.png"],
  run:  ["images/run1.png","images/run2.png"],
  jump: ["images/jump.png"]
};

// Speeds
const SPEED_WALK = 1.0;
const SPEED_RUN  = 2.6;

// Jump
let jumpOffset = 0;
let jumpVelocity = 0;

// Mouse
let mouseX = petX;
let mouseY = petY;
let lastMouseX = mouseX;
let lastMouseY = mouseY;
let mouseIdleFrames = 0;

// Idle wander
let idleTimer = 0;

// Mouse tracking
document.addEventListener("mousemove", e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Helpers
function distance(x1,y1,x2,y2){
  return Math.hypot(x2-x1, y2-y1);
}

// Animation
function updateAnimation(){
  frameTimer++;
  if(frameTimer > 26){
    frameTimer = 0;
    frame = (frame+1) % animations[state].length;
    pet.style.backgroundImage = `url(${animations[state][frame]})`;
  }
}

// Random small wander target
function setIdleTarget(){
  targetX = petX + (Math.random()*200 - 100);
  targetY = petY + (Math.random()*200 - 100);
}

// Main Loop
function updatePet(){

  // Mouse idle detection
  if(Math.abs(mouseX-lastMouseX)<1 && Math.abs(mouseY-lastMouseY)<1){
    mouseIdleFrames++;
  } else {
    mouseIdleFrames = 0;
  }

  lastMouseX = mouseX;
  lastMouseY = mouseY;

  const dToMouse = distance(petX, petY, mouseX, mouseY);

  // ----- STATE LOGIC -----

  // Jump state
  if(jumpOffset < 0){
    state = "jump";
  }

  // If mouse idle for a while
  else if(mouseIdleFrames > 120){

    idleTimer--;

    if(idleTimer <= 0){
      if(Math.random() < 0.6){
        state = "idle";
      } else {
        state = "walk";
        setIdleTarget();
      }
      idleTimer = 180 + Math.random()*200;
    }

  }

  // Mouse moving → follow
  else {

    targetX = mouseX;
    targetY = mouseY;

    if(dToMouse < 80){
      state = "run";
    }
    else if(dToMouse < 350){
      state = "walk";
    }
    else{
      state = "idle";
    }
  }

  // ----- SPEED -----
  let speed = SPEED_WALK;
  if(state === "run") speed = SPEED_RUN;

  // ----- MOVE -----
  let dx = targetX - petX;
  let dy = targetY - petY;
  let dist = Math.hypot(dx,dy);

  if(state !== "idle" && dist > 1){
    petX += (dx/dist)*speed;
    petY += (dy/dist)*speed;
  }

  // ----- FACING -----
  if(dx < 0){
    pet.style.transform = "scaleX(-1)";
  } else {
    pet.style.transform = "scaleX(1)";
  }

  // ----- RANDOM JUMP (only while walking or idle) -----
  if((state === "walk" || state === "idle") && Math.random() < 0.002 && jumpOffset === 0){
    jumpVelocity = -7;
  }

  // Gravity
  jumpVelocity += 0.4;
  jumpOffset += jumpVelocity;

  if(jumpOffset > 0){
    jumpOffset = 0;
    jumpVelocity = 0;
  }

  pet.style.left = petX + "px";
  pet.style.top = (petY + jumpOffset) + "px";

  updateAnimation();
  requestAnimationFrame(updatePet);
}

// Start
updatePet();
