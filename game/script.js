const audio = document.getElementById("audio");
const dropdown = document.getElementById("songDropdown");

const songs = ["song1.mp3","song2.mp3","song3.mp3","song4.mp3"];

// 🎵 LOAD SONGS
songs.forEach((s,i)=>{
  const opt = document.createElement("option");
  opt.value = s;
  opt.textContent = s;
  dropdown.appendChild(opt);
});

dropdown.value = songs[0];
audio.src = "game/songs/" + songs[0];

dropdown.onchange = ()=>{
  audio.src = "game/songs/" + dropdown.value;
  loadLeaderboard();
};

// GAME STATE
let score=0, combo=0, playing=false, gameStarted=false;
let interval;

// START
document.getElementById("startBtn").onclick = ()=>{
  if(!audio.src){
    alert("Select song");
    return;
  }
  gameStarted=true;
  score=0;
  combo=0;
  audio.currentTime=0;
  audio.play();
  startSpawn();
};

// SPAWN
function startSpawn(){
  interval=setInterval(spawnNote,600);
}

// NOTE
function spawnNote(){
  const lane=document.querySelectorAll(".lane")[Math.floor(Math.random()*4)];
  const note=document.createElement("div");
  note.className="note";
  lane.appendChild(note);

  let y=-20;
  function fall(){
    y+=5;
    note.style.top=y+"px";
    if(y>window.innerHeight){
      note.remove();
      combo=0;
      return;
    }
    requestAnimationFrame(fall);
  }
  fall();
}

// HIT
function hitLane(key){
  const lane=document.querySelector(`.lane[data-key="${key}"]`);
  if(!lane) return;

  const notes=lane.querySelectorAll(".note");
  const hitLine=document.getElementById("hitLine").getBoundingClientRect();

  let hit=false;

  notes.forEach(n=>{
    const diff=Math.abs(n.getBoundingClientRect().top-hitLine.top);
    if(diff<40){
      score+=10;
      combo++;
      n.remove();
      hit=true;
    }
  });

  if(!hit){
    combo=0;
  }

  document.getElementById("score").innerText="Score: "+score;
  document.getElementById("combo").innerText=combo+"x";
}

// INPUT
document.addEventListener("keydown",e=>hitLane(e.key));
document.querySelectorAll(".lane").forEach(l=>{
  l.addEventListener("touchstart",()=>hitLane(l.dataset.key));
});

// CONTROLS
function togglePlay(){
  if(audio.paused) audio.play();
  else audio.pause();
}

function restartGame(){
  location.reload();
}

function setVolume(v){
  audio.volume=v;
}

// 🏆 LEADERBOARD
async function loadLeaderboard(){
  const res = await fetch("https://bronveil-server.onrender.com/leaderboard");
  const data = await res.json();

  const ul=document.getElementById("leaderList");
  ul.innerHTML="";

  data.slice(0,5).forEach(p=>{
    const li=document.createElement("li");
    li.textContent=p.name+" - "+p.score;
    ul.appendChild(li);
  });
}

loadLeaderboard();
