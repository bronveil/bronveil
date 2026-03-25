// ===== GAME STATE =====
let score = 0;
let combo = 0;
let playing = false;
let gameStarted = false;
let spawnInterval = null;
let userScores = JSON.parse(localStorage.getItem("userScores")) || {};
let best = 0;
let lastUser = localStorage.getItem("lastUser") || null;
let currentUser = localStorage.getItem("currentUser") || null;
let usedNames = JSON.parse(localStorage.getItem("usedNames")) || [];

// 🎵 SAFE SONG DETECTOR (VERY IMPORTANT)
function getCurrentSong(){
  if(!audio.src) return "unknown";

  return audio.src.split("/").pop().split("?")[0];
}


// ===== DOM =====
const audio = document.getElementById("audio");
document.getElementById("highScore").innerText = "Best: " + best;

// ===== SONGS =====
const songs = ["song1.mp3","song2.mp3","song3.mp3","song4.mp3"];
const list = document.getElementById("songList");

songs.forEach(s=>{
  const li = document.createElement("li");
  li.innerHTML = `${s} <span>▶</span>`;
  li.onclick = ()=>{
    audio.src = "songs/"+s;
  };
  list.appendChild(li);
});

// ===== START BUTTON =====
document.getElementById("startBtn").onclick = ()=>{

  const name = document.getElementById("playerName").value.trim();

  if(!name){
    alert("Enter your name");
    return;
  }

  if(!audio.src){
    alert("Select a song first");
    return;
  }

  if(usedNames.includes(name) && currentUser !== name){
    alert("Name already taken");
    return;
  }

  currentUser = name;
  localStorage.setItem("currentUser", name);

  // 🧠 Detect new user
if(lastUser !== currentUser){
  best = 0; // reset score for new user
}

localStorage.setItem("lastUser", currentUser);

  if(!usedNames.includes(name)){
    usedNames.push(name);
    localStorage.setItem("usedNames", JSON.stringify(usedNames));
  }

  startGame();
};

// ===== GAME START =====
function startGame(){

  document.getElementById("startScreen").style.display="none";

  score = 0;
  combo = 0;

  document.getElementById("score").innerText = "Score: 0";
  document.getElementById("combo").classList.add("hide");
  document.getElementById("highScore").innerText = "Best: " + best;

  gameStarted = true;
  playing = true;

  audio.currentTime = 0;
  audio.play();

  stopSpawning(); // safety
  startSpawning();
  loadLeaderboard();
}

// ===== SPAWN CONTROL =====
function startSpawning(){
  spawnInterval = setInterval(spawnNote, 700);
}

function stopSpawning(){
  clearInterval(spawnInterval);
}

// ===== RESTART =====
function restartGame(){

  score = 0;
  combo = 0;

  document.getElementById("score").innerText = "Score: 0";
  document.getElementById("combo").classList.add("hide");

  /* REMOVE ALL NOTES */
  document.querySelectorAll(".note").forEach(n=>n.remove());

  audio.currentTime = 0;
  audio.play();

  gameStarted = true;

  loadLeaderboard();
}

// ===== CONTROLS =====
function togglePlay(){
  if(!playing){
    audio.play();
    playing = true;
  } else {
    audio.pause();
    playing = false;
  }
}

function setVolume(v){
  audio.volume = v;
}

// ===== SPAWN NOTE =====
function spawnNote(){
  if(!gameStarted) return;

  const lanes = document.querySelectorAll(".lane");
  const lane = lanes[Math.floor(Math.random()*4)];

  const note = document.createElement("div");
  note.className="note";
  lane.appendChild(note);

  let y = -20;

  function fall(){

    if(!gameStarted){
      note.remove();
      return;
    }

    y += 5;
    note.style.top = y + "px";

    if(y > window.innerHeight){
      note.remove();
      combo = 0;
      return;
    }

    requestAnimationFrame(fall);
  }

  fall();
}

// ===== FEEDBACK =====
function showFeedback(text){
  const f = document.getElementById("feedback");
  f.innerText = text;
  f.style.opacity = 1;
  setTimeout(()=>f.style.opacity=0,400);
}

// ===== HIT SYSTEM =====
function hitLane(key){

  if(!gameStarted) return;

  const lane = document.querySelector(`.lane[data-key="${key}"]`);
  if(!lane) return;

  lane.classList.add("hit");
  setTimeout(()=>lane.classList.remove("hit"),150);

  const notes = lane.querySelectorAll(".note");
  const hitLine = document.getElementById("hitLine").getBoundingClientRect();

  let hit = false;

  notes.forEach(n=>{
    const rect = n.getBoundingClientRect();
    const diff = Math.abs(rect.top - hitLine.top);

   if(diff < 30){
  combo++;

  let multiplier = 1 + Math.floor(combo / 3);
  if(multiplier > 10) multiplier = 10;

  score += 20 * multiplier;

  showFeedback("PERFECT x" + multiplier);
  n.remove();
  hit = true;
}
else if(diff < 60){
  combo++;

  let multiplier = 1 + Math.floor(combo / 3);
  if(multiplier > 10) multiplier = 10;

  score += 10 * multiplier;

  showFeedback("GOOD x" + multiplier);
  n.remove();
  hit = true;
}
else if(diff < 60){
  combo++;

  let multiplier = 1 + Math.floor(combo / 3);
  if(multiplier > 10) multiplier = 10;

  score += 10 * multiplier;

  showFeedback("GOOD x" + multiplier);
  n.remove();
  hit = true;
}
  });

  if(!hit){

  combo = 0;

  /* SAVE BEST */
  if(score > best){
    best = score;
    localStorage.setItem("best", best);
    document.getElementById("highScore").innerText = "Best: " + best;
  }

  /* 🔥 FULL RESET GAME */
  restartGame();

  showFeedback("MISS");
}

  const comboEl = document.getElementById("combo");

  if(combo > 0){
    comboEl.classList.remove("hide");
    comboEl.innerText = combo + "x";
  } else {
    comboEl.classList.add("hide");
  }

  document.getElementById("score").innerText = "Score: " + score;
}

// ===== INPUT =====
document.addEventListener("keydown",e=>{
  hitLane(e.key.toLowerCase());
});

document.querySelectorAll(".lane").forEach(l=>{
  l.addEventListener("touchstart",(e)=>{
    e.preventDefault(); // 🔥 important

    l.classList.add("hit");
    setTimeout(()=>l.classList.remove("hit"),100);

    hitLane(l.dataset.key);
  });
});

// ===== HELP =====
document.getElementById("helpBtn").onclick = ()=>{
  document.getElementById("helpBox").classList.toggle("hide");
};

// ===== AUTO USER =====
if(currentUser){
  document.getElementById("playerName").value = currentUser;
}

if(currentUser && userScores[currentUser]){
  best = userScores[currentUser];
}else{
  best = 0;
}

document.getElementById("highScore").innerText = "Best: " + best;


loadLeaderboard();

async function sendScore(finalScore, streak, mmr){

  if(!currentUser) return;

  await fetch("http://127.0.0.1:8000/leaderboard",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      name: currentUser,
      score: finalScore,
      song: getCurrentSong(), // ✅ FIXED
      streak: streak,
      mmr: mmr
    })
  });

  loadLeaderboard();
}

async function loadLeaderboard(){

  try{
    const res = await fetch("https://bronveil-server.onrender.com/leaderboard");
    const data = await res.json();

    const list = document.getElementById("leaderList");
    if(!list) return;

    list.innerHTML = "";

    if(data.length === 0){
      list.innerHTML = "<li>No scores yet</li>";
      return;
    }

    data.sort((a,b)=>b.score-a.score);

    data.slice(0,10).forEach((p,i)=>{

      const li = document.createElement("li");

      li.innerHTML = `
        <span>${i+1}. ${p.name}</span>
        <span>${p.score}</span>
      `;

      list.appendChild(li);
    });

  }catch(err){
    console.log("Leaderboard error", err);
  }

}
if(finalScore > 50){
  sendScore(finalScore);
}

setInterval(()=>{
  loadLeaderboard();
}, 5000); // refresh every 5 sec

function goBack(){
  window.location.href = "../index.html";
}


// 🎵 MOBILE SONG DROPDOWN FIX
/* SONGS */
const songs = ["song1.mp3","song2.mp3","song3.mp3","song4.mp3"];

const dropdown = document.getElementById("songDropdown");

/* 🔥 FORCE LOAD DROPDOWN AFTER PAGE LOAD */
window.addEventListener("load", ()=>{

  if(!dropdown) return;

  dropdown.innerHTML = "";

  const def = document.createElement("option");
  def.textContent = "🎵 Songs";
  def.disabled = true;
  def.selected = true;
  dropdown.appendChild(def);

  songs.forEach(s=>{
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s.replace(".mp3","");
    dropdown.appendChild(opt);
  });

  dropdown.addEventListener("change", ()=>{
    audio.src = "songs/" + dropdown.value;
    loadLeaderboard();
  });

});

const leaderBtn = document.getElementById("leaderBtn");
const leaderPopup = document.getElementById("leaderPopup");
const closeLeader = document.getElementById("closeLeader");

if(leaderBtn){
  leaderBtn.onclick = ()=>{
    leaderPopup.classList.toggle("hide");
  };
}

if(closeLeader){
  closeLeader.onclick = ()=>{
    leaderPopup.classList.add("hide");
  };
}

window.onload = ()=>{
  loadLeaderboard();
};

window.addEventListener("load", ()=>{
  loadLeaderboard();
});
