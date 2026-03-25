let score = 0;
let combo = 0;
let best = localStorage.getItem("best") || 0;
let gameStarted = false;

const audio = document.getElementById("audio");
document.getElementById("highScore").innerText = "Best: " + best;

/* SONGS */
const songs = ["song1.mp3","song2.mp3","song3.mp3","song4.mp3"];
const dropdown = document.getElementById("songDropdown");

/* LOAD */
window.onload = () => {

  /* DROPDOWN */
  if(dropdown){
    dropdown.innerHTML = `<option disabled selected>🎵 Songs</option>`;

    songs.forEach(s=>{
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s.replace(".mp3","");
      dropdown.appendChild(opt);
    });

    dropdown.onchange = ()=>{
      audio.src = "songs/" + dropdown.value;
    };
  }

  loadLeaderboard();
};

/* START BUTTON */
document.getElementById("startBtn").onclick = ()=>{
  if(!audio.src){
    alert("Select a song first");
    return;
  }

  document.getElementById("startScreen").style.display = "none";

  audio.play();
  gameStarted = true;
};

/* LEADERBOARD */
async function loadLeaderboard(){
  try{
    const res = await fetch("https://bronveil-server.onrender.com/leaderboard");
    const data = await res.json();

    const list = document.getElementById("leaderList");
    const mobileList = document.getElementById("leaderListMobile");

    list.innerHTML = "";
    if(mobileList) mobileList.innerHTML = "";

    if(data.length === 0){
      list.innerHTML = "<li>No scores yet</li>";
      return;
    }

    data.sort((a,b)=>b.score-a.score);

    data.slice(0,10).forEach((p,i)=>{
      const html = `<li><span>${i+1}. ${p.name}</span><span>${p.score}</span></li>`;
      list.innerHTML += html;
      if(mobileList) mobileList.innerHTML += html;
    });

  }catch(e){
    console.log(e);
  }
}

/* SPAWN */
function spawnNote(){
  if(!gameStarted) return;

  const lanes = document.querySelectorAll(".lane");
  const lane = lanes[Math.floor(Math.random()*4)];

  const note = document.createElement("div");
  note.className="note";
  lane.appendChild(note);

  let y = -20;

  function fall(){
    y+=5;
    note.style.top = y + "px";

    if(y>window.innerHeight){
      note.remove();
      combo = 0;
      return;
    }

    requestAnimationFrame(fall);
  }

  fall();
}

setInterval(spawnNote,700);

/* HIT */
function hitLane(key){
  if(!gameStarted) return;

  const lane = document.querySelector(`.lane[data-key="${key}"]`);
  if(!lane) return;

  const notes = lane.querySelectorAll(".note");
  const hitLine = document.getElementById("hitLine").getBoundingClientRect();

  let hit=false;

  notes.forEach(n=>{
    const rect = n.getBoundingClientRect();
    const diff = Math.abs(rect.top - hitLine.top);

    if(diff < 40){
      combo++;
      score += 10;
      n.remove();
      hit = true;
    }
  });

  if(!hit){
    /* SAVE BEST */
    if(score > best){
      best = score;
      localStorage.setItem("best", best);
      document.getElementById("highScore").innerText = "Best: " + best;
    }

    restartGame();
    return;
  }

  document.getElementById("score").innerText = "Score: " + score;
}

/* RESTART */
function restartGame(){

  score = 0;
  combo = 0;

  document.getElementById("score").innerText = "Score: 0";

  document.querySelectorAll(".note").forEach(n=>n.remove());

  audio.currentTime = 0;
  audio.play();

  gameStarted = true;

  loadLeaderboard();
}

/* CONTROLS */
function togglePlay(){
  if(audio.paused) audio.play();
  else audio.pause();
}

function setVolume(v){
  audio.volume = v;
}

/* INPUT */
document.addEventListener("keydown", e=>{
  hitLane(e.key.toLowerCase());
});

/* TOUCH */
document.querySelectorAll(".lane").forEach(l=>{
  l.addEventListener("touchstart", ()=>{
    hitLane(l.dataset.key);
  });
});

/* MOBILE LEADERBOARD */
const leaderBtn = document.getElementById("leaderBtn");
const leaderPopup = document.getElementById("leaderPopup");

if(leaderBtn){
  leaderBtn.onclick = ()=>{
    leaderPopup.classList.toggle("show");
  };
}

// PANEL TOGGLE
const songBtn = document.getElementById("songBtn");
const leaderBtn = document.getElementById("leaderBtn");

const songPanel = document.getElementById("songPanel");
const leaderPanel = document.getElementById("leaderPanel");

songBtn.onclick = ()=>{
  songPanel.classList.toggle("open");
};

leaderBtn.onclick = ()=>{
  leaderPanel.classList.toggle("open");
};
