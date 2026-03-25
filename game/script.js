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
  const dropdown = document.getElementById("songDropdown");

  if(dropdown && dropdown.value){
    return dropdown.value;
  }

  if(audio.src){
    return audio.src.split("/").pop().split("?")[0];
  }

  return "song1.mp3"; // fallback
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

  gameStarted = false;
  playing = false;

  stopSpawning();

  audio.pause();
  audio.currentTime = 0;

  // remove all notes
  document.querySelectorAll(".note").forEach(n=>n.remove());

  score = 0;
  combo = 0;

  document.getElementById("score").innerText = "Score: 0";
  document.getElementById("combo").classList.add("hide");

  // show start again
  document.getElementById("startScreen").style.display = "flex";
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

  let finalScore = score;

  if(finalScore > 0){

    let mmr = Math.floor(finalScore / 10 + combo * 2);

    sendScore(finalScore, combo, mmr); // ✅ FIXED
  }

  if(finalScore > best){
  best = finalScore;

  userScores[currentUser] = best;
  localStorage.setItem("userScores", JSON.stringify(userScores));

  document.getElementById("highScore").innerText = "Best: " + best;
}

  combo = 0;
  score = 0;

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

  await fetch("https://bronveil-server.onrender.com/leaderboard",{
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

  const song = getCurrentSong();

  try{
    const res = await fetch(`https://bronveil-server.onrender.com/leaderboard?song=${song}`);
    const data = await res.json();

    const ul = document.getElementById("leaderList");
    ul.innerHTML = "";

    if(!data || data.length === 0){
      ul.innerHTML = "<li>No scores yet</li>";
      return;
    }

    data.forEach((p, index)=>{
      const li = document.createElement("li");

      li.innerHTML = `
        <span>#${index+1} ${p.name}</span>
        <span>${p.score} 🔥${p.streak || 0} ⭐${p.mmr || 0}</span>
      `;

      if(index === 0) li.classList.add("top1");
      if(index === 1) li.classList.add("top2");
      if(index === 2) li.classList.add("top3");

      if(p.name === currentUser){
        li.classList.add("me");
      }

      ul.appendChild(li);
    });

  }catch(e){
    console.log("Leaderboard error:", e);
  }
}


setInterval(()=>{
  loadLeaderboard();
}, 5000); // refresh every 5 sec

function goBack(){
  window.location.href = "../index.html";
}


// 🎵 MOBILE SONG DROPDOWN FIX
const dropdown = document.getElementById("songDropdown");

if(dropdown){

  dropdown.innerHTML = "";

songs.forEach((s, i)=>{
  const opt = document.createElement("option");
  opt.value = s;
  opt.innerText = s.replace(".mp3","");
  if(i === 0) opt.selected = true;
  dropdown.appendChild(opt);
});

audio.src = "songs/" + songs[0];

dropdown.onchange = ()=>{
  audio.src = "songs/" + dropdown.value;
  loadLeaderboard();
};
}
