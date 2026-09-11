const STORAGE_KEY = "studyDashboardData";
const defaultData = {
  ddays: [],
  todos: [],
  studies: [],
  schedule: [],
  notes: [],
  coins: 0,
  rewardClaimedDates: [],
  albums: {}
};
let data = loadData();

function loadData(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return saved && typeof saved === "object" ? {...defaultData,...saved} : {...defaultData};
  }catch{return {...defaultData};}
}
function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}
function todayISO(){const d=new Date();const offset=d.getTimezoneOffset()*60000;return new Date(d.getTime()-offset).toISOString().slice(0,10)}
function formatDate(s){return new Intl.DateTimeFormat("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"short"}).format(new Date(`${s}T00:00:00`))}
function calculateDday(s){const a=new Date(`${todayISO()}T00:00:00`),b=new Date(`${s}T00:00:00`),diff=Math.round((b-a)/86400000);return diff===0?"D-DAY":diff>0?`D-${diff}`:`D+${Math.abs(diff)}`}
function escapeHTML(v){const d=document.createElement("div");d.textContent=String(v ?? "");return d.innerHTML}
function getNearestDday(){const today=todayISO();return data.ddays.filter(x=>x.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0]||null}

function renderHeroDday(){const el=document.querySelector("#heroDday");const d=getNearestDday();if(!d){el.innerHTML='<span class="hero-dday-label">NEXT D-DAY</span><strong class="hero-dday-empty">등록된 예정 D-Day가 없습니다.</strong>';return}el.innerHTML=`<span class="hero-dday-label">${escapeHTML(d.name)}</span><strong class="hero-dday-number">${calculateDday(d.date)}</strong><span class="hero-dday-date">${formatDate(d.date)}</span>`}
function renderDdays(){const el=document.querySelector("#ddayList"),items=[...data.ddays].sort((a,b)=>a.date.localeCompare(b.date));if(!items.length){el.innerHTML='<div class="empty">아직 등록된 D-Day가 없습니다.</div>';return}el.innerHTML=items.map(x=>`<div class="item"><div class="item-main"><div class="item-name">${escapeHTML(x.name)}</div><div class="item-sub">${formatDate(x.date)}</div></div><div class="item-actions"><span class="dday-number">${calculateDday(x.date)}</span><button class="delete-btn" data-action="delete-dday" data-id="${x.id}">삭제</button></div></div>`).join("")}
function renderTodos(){const el=document.querySelector("#todoList");if(!data.todos.length){el.innerHTML='<div class="empty">할 일이 없습니다. 꽤 평화롭군요.</div>';return}const items=[...data.todos].sort((a,b)=>{if(a.done!==b.done)return a.done?1:-1;if(a.done&&b.done)return Number(a.completedAt||0)-Number(b.completedAt||0);return 0});el.innerHTML=items.map(x=>`<div class="item ${x.done?"done":""}"><div class="item-main" style="display:flex;align-items:center;gap:9px;"><input class="todo-check" type="checkbox" data-id="${x.id}" ${x.done?"checked":""}><div class="item-name">${escapeHTML(x.text)}</div></div><button class="delete-btn" data-action="delete-todo" data-id="${x.id}">삭제</button></div>`).join("")}
function renderStudies(){const el=document.querySelector("#studyList"),items=data.studies.filter(x=>x.date===todayISO());if(!items.length)el.innerHTML='<div class="empty">오늘 공부 기록이 없습니다.</div>';else el.innerHTML=items.map(x=>`<div class="item"><div class="item-name">${escapeHTML(x.subject)}</div><div class="item-actions"><strong>${Number(x.minutes)}분</strong><button class="delete-btn" data-action="delete-study" data-id="${x.id}">삭제</button></div></div>`).join("");document.querySelector("#todayStudyTotal").textContent=`${items.reduce((s,x)=>s+Number(x.minutes),0)}분`}
function renderSchedule(){const el=document.querySelector("#scheduleList"),days=["월","화","수","목","금"];el.innerHTML=days.map(day=>{const items=data.schedule.filter(x=>x.day===day);return `<div class="day-column"><div class="day-name">${day}</div>${items.length?items.map(x=>`<div class="class-item"><span>${escapeHTML(x.subject)}</span><button class="delete-btn" data-action="delete-schedule" data-id="${x.id}">×</button></div>`).join(""):'<div class="item-sub">-</div>'}</div>`}).join("")}
function renderNotes(){const el=document.querySelector("#noteList");if(!data.notes.length){el.innerHTML='<div class="empty">메모가 없습니다.</div>';return}el.innerHTML=data.notes.map(x=>`<div class="item"><div class="item-main"><div class="item-name">${escapeHTML(x.text)}</div><div class="item-sub">${formatDate(x.date)}</div></div><button class="delete-btn" data-action="delete-note" data-id="${x.id}">삭제</button></div>`).join("")}
function renderCalendar(){const date=document.querySelector("#calendarDate").value||todayISO(),info=document.querySelector("#calendarInfo"),ddays=data.ddays.filter(x=>x.date===date),todos=data.todos.filter(x=>x.dueDate===date);const lines=[`<strong>${formatDate(date)}</strong>`];if(ddays.length)lines.push(`📌 D-Day: ${ddays.map(x=>escapeHTML(x.name)).join(", ")}`);if(todos.length)lines.push(`☑ 할 일: ${todos.map(x=>escapeHTML(x.text)).join(", ")}`);if(lines.length===1)lines.push("이 날짜에 연결된 정보가 없습니다.");info.innerHTML=lines.join("<br>")}
function renderAll(){normalizeRewardData();checkTodoReward();renderDdays();renderTodos();renderStudies();renderSchedule();renderNotes();renderCalendar();renderHeroDday();renderReward();renderAlbumCollection()}
function uid(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}

const ALBUMS = [
  {id:1,title:"SWAG II",artist:"Justin Bieber",cover:"assets/albums/swag-ii.webp"},
  {id:2,title:"Red Light",artist:"Zion.T",cover:"assets/albums/red-light.webp"},
  {id:3,title:"MM..FOOD",artist:"MF DOOM",cover:"assets/albums/mm-food.webp"},
  {id:4,title:"BEIGE",artist:"Kid Milli",cover:"assets/albums/beige.webp"},
  {id:5,title:"Illmatic",artist:"Nas",cover:"assets/albums/illmatic.webp"},
  {id:6,title:"AM",artist:"Arctic Monkeys",cover:"assets/albums/am.webp"},
  {id:7,title:"HIT ME HARD AND SOFT",artist:"Billie Eilish",cover:"assets/albums/hit-me-hard-and-soft.webp"},
  {id:8,title:"Definitely Maybe",artist:"Oasis",cover:"assets/albums/definitely-maybe.webp"},
  {id:9,title:"More Life",artist:"Drake",cover:"assets/albums/more-life.webp"},
  {id:10,title:"To Pimp A Butterfly",artist:"Kendrick Lamar",cover:"assets/albums/to-pimp-a-butterfly.webp"},
  {id:11,title:"The Divine Feminine",artist:"Mac Miller",cover:"assets/albums/the-divine-feminine.jpeg"},
  {id:12,title:"Channel Orange",artist:"Frank Ocean",cover:"assets/albums/channel-orange.webp"},
  {id:13,title:"Luv(sic) Hexalogy",artist:"Nujabes & Shing02",cover:null},
  {id:14,title:"Free Hukky Shibaseki & the God Sun Symphony Group : Odyssey.1",artist:"B-FREE & Hukky Shibaseki",cover:"assets/albums/odyssey-1.webp"},
  {id:15,title:"NEVER ENOUGH",artist:"Daniel Caesar",cover:null},
  {id:16,title:"킁",artist:"C JAMM",cover:null},
  {id:17,title:"The College Dropout",artist:"Kanye West",cover:null},
  {id:18,title:"“Awake, My Love!”",artist:"Childish Gambino",cover:null},
  {id:19,title:"BRAT",artist:"Charli xcx",cover:null},
  {id:20,title:"Gemini Rights",artist:"Steve Lacy",cover:null}
];

function normalizeRewardData(){
  data.coins = Number.isFinite(Number(data.coins)) ? Math.max(0, Number(data.coins)) : 0;
  if(!Array.isArray(data.rewardClaimedDates)) data.rewardClaimedDates = [];
  if(!data.albums || typeof data.albums !== "object" || Array.isArray(data.albums)) data.albums = {};
}

function renderReward(){
  normalizeRewardData();
  const balance=document.querySelector("#coinBalance");
  const status=document.querySelector("#rewardStatus");
  const button=document.querySelector("#gachaButton");
  if(balance) balance.textContent=String(data.coins);
  const today=todayISO();
  const claimed=data.rewardClaimedDates.includes(today);
  const todos=data.todos.filter(x=>x.dueDate===today);
  const allClear=todos.length>0 && todos.every(x=>x.done);
  if(status){
    status.textContent = claimed ? "TODAY'S ALL CLEAR REWARD CLAIMED · +10 Coins" : (allClear ? "ALL CLEAR · +10 Coins 획득" : "오늘의 TO-DO를 전부 완료하면 +10 Coins");
    status.classList.toggle("complete", claimed || allClear);
  }
  if(button){
    button.disabled=data.coins<100;
    button.textContent=data.coins>=100 ? "ALBUM 뽑기" : "100 Coins 필요";
  }
}

function coverHTML(album, className="album-cover"){
  if(album.cover) return `<img class="${className}" src="${album.cover}" alt="${escapeHTML(album.title)} album cover" onerror="this.outerHTML='<div class="${className} placeholder">COVER COMING SOON</div>'">`;
  return `<div class="${className} placeholder">COVER COMING SOON</div>`;
}

function renderAlbumCollection(){
  normalizeRewardData();
  const el=document.querySelector("#albumCollection");
  const countEl=document.querySelector("#collectionCount");
  const owned=Object.keys(data.albums).filter(id=>Number(data.albums[id])>0);
  if(countEl) countEl.textContent=`${owned.length} / ${ALBUMS.length}`;
  if(!el)return;
  el.innerHTML=ALBUMS.map(album=>{
    const level=Number(data.albums[album.id]||0);
    return `<div class="album-card ${level?"":"locked"}">
      ${coverHTML(album)}
      <div class="album-title">${escapeHTML(level?album.title:"LOCKED")}</div>
      <div class="album-artist">${escapeHTML(level?album.artist:"Album not collected")}</div>
      ${level?`<span class="album-level">Lv.${level}</span>`:""}
    </div>`;
  }).join("");
}

function renderGachaResult(albumId){
  const el=document.querySelector("#gachaResult");
  if(!el)return;
  if(!albumId){el.innerHTML='<div class="gacha-placeholder">100 Coins로 앨범을 뽑아보세요.</div>';return}
  const album=ALBUMS.find(x=>x.id===albumId);
  if(!album)return;
  const level=Number(data.albums[album.id]||1);
  el.innerHTML=`<div class="result-album">
    ${coverHTML(album)}
    <div class="album-meta">
      <div class="eyebrow">YOU GOT</div>
      <div class="album-title">${escapeHTML(album.title)}</div>
      <div class="album-artist">${escapeHTML(album.artist)}</div>
      <span class="album-level">Lv.${level}</span>
    </div>
  </div>`;
}

function checkTodoReward(){
  normalizeRewardData();
  const today=todayISO();
  if(data.rewardClaimedDates.includes(today)) return false;
  const todos=data.todos.filter(x=>x.dueDate===today);
  if(!todos.length || !todos.every(x=>x.done)) return false;
  data.coins += 10;
  data.rewardClaimedDates.push(today);
  saveData();
  return true;
}

function drawAlbum(){
  normalizeRewardData();
  if(data.coins<100)return;
  const album=ALBUMS[Math.floor(Math.random()*ALBUMS.length)];
  data.coins-=100;
  data.albums[album.id]=Number(data.albums[album.id]||0)+1;
  saveData();
  renderReward();
  renderAlbumCollection();
  renderGachaResult(album.id);
}


document.querySelector("#todayText").textContent=formatDate(todayISO());
document.querySelector("#heroDate").textContent=formatDate(todayISO());
document.querySelector("#calendarDate").value=todayISO();

document.querySelector("#ddayForm").addEventListener("submit",e=>{e.preventDefault();const name=document.querySelector("#ddayName").value.trim(),date=document.querySelector("#ddayDate").value;if(!name||!date)return;data.ddays.push({id:uid(),name,date});saveData();e.target.reset();renderAll()});
document.querySelector("#todoForm").addEventListener("submit",e=>{e.preventDefault();const text=document.querySelector("#todoText").value.trim();if(!text)return;data.todos.push({id:uid(),text,done:false,dueDate:todayISO()});saveData();e.target.reset();renderAll()});
document.querySelector("#studyForm").addEventListener("submit",e=>{e.preventDefault();const subject=document.querySelector("#studySubject").value.trim(),minutes=Number(document.querySelector("#studyMinutes").value);if(!subject||!minutes)return;data.studies.push({id:uid(),subject,minutes,date:todayISO()});saveData();e.target.reset();renderAll()});
document.querySelector("#scheduleForm").addEventListener("submit",e=>{e.preventDefault();const subject=document.querySelector("#scheduleSubject").value.trim();if(!subject)return;data.schedule.push({id:uid(),day:document.querySelector("#scheduleDay").value,subject});saveData();e.target.reset();renderAll()});
document.querySelector("#noteForm").addEventListener("submit",e=>{e.preventDefault();const text=document.querySelector("#noteText").value.trim();if(!text)return;data.notes.unshift({id:uid(),text,date:todayISO()});saveData();e.target.reset();renderAll()});
document.querySelector("#calendarDate").addEventListener("change",renderCalendar);

document.addEventListener("change",e=>{const cb=e.target;if(!cb.classList.contains("todo-check"))return;const item=data.todos.find(x=>String(x.id)===String(cb.dataset.id));if(!item)return;item.done=cb.checked;if(item.done)item.completedAt=Date.now();else delete item.completedAt;saveData();checkTodoReward();renderTodos();renderCalendar();renderReward()});
document.addEventListener("click",e=>{const button=e.target.closest("[data-action]");if(!button)return;const {action,id}=button.dataset;if(action==="delete-dday")data.ddays=data.ddays.filter(x=>String(x.id)!==String(id));if(action==="delete-todo")data.todos=data.todos.filter(x=>String(x.id)!==String(id));if(action==="delete-study")data.studies=data.studies.filter(x=>String(x.id)!==String(id));if(action==="delete-schedule")data.schedule=data.schedule.filter(x=>String(x.id)!==String(id));if(action==="delete-note")data.notes=data.notes.filter(x=>String(x.id)!==String(id));saveData();renderAll()});

document.querySelector("#gachaButton").addEventListener("click",drawAlbum);

renderAll();
