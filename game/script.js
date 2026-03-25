let score = 0;
let combo = 0;
let best = localStorage.getItem("best") || 0;

const audio = document.getElementById("audio");
document.getElementById("highScore").innerText = "Best: " + best;

/* SONGS */
const songs = ["song1.mp3","song2.mp3","song3.mp3","song4.mp3"];
const dropdown = document.getElementById("songDropdown");

window.onload = () => {

  /* LOAD SONGS */
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
      loadLeaderboard();
    };
  }

  loadLeaderboard();
};

/* LEADERBOARD */
async function loadLeaderboard(){
  try{
    const res = await fetch("https://bronveil-server.onrender.com/leaderboard");
    const data = await res.json();

    const list = document.getElementById("leaderList");
    list.innerHTML = "";

    if(data.length === 0){
      list.innerHTML = "<li>No scores yet</li>";
      return;
    }

    data.sort((a,b)=>b.score-a.score);

    data.slice(0,10).forEach((p,i)=>{
      const li = document.createElement("li");
      li.innerHTML = `<span>${i+1}. ${p.name}</span><span>${p.score}</span>`;
      list.appendChild(li);
    });

  }catch(e){
    console.log(e);
  }
}

/* GAME */
function spawnNote(){
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
    combo = 0;

    if(score > best){
      best = score;
      localStorage.setItem("best", best);
      document.getElementById("highScore").innerText = "Best: " + best;
    }

    score = 0;
  }

  document.getElementById("score").innerText = "Score: " + score;
}

/* INPUT */
document.addEventListener("keydown", e=>{
  hitLane(e.key.toLowerCase());
});

/* MOBILE TOUCH */
document.querySelectorAll(".lane").forEach(l=>{
  l.addEventListener("touchstart", ()=>{
    hitLane(l.dataset.key);
  });
});

/* LEADER POPUP */
const leaderBtn = document.getElementById("leaderBtn");
const leaderPopup = document.getElementById("leaderPopup");

if(leaderBtn){
  leaderBtn.onclick = ()=>{
    leaderPopup.classList.toggle("show");
  };
}
