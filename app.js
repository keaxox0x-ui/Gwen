const STORAGE_KEY = "studyDashboardData";
const defaultData = { ddays: [], todos: [], studies: [], schedule: [], notes: [] };
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
function renderAll(){renderDdays();renderTodos();renderStudies();renderSchedule();renderNotes();renderCalendar();renderHeroDday()}
function uid(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}

document.querySelector("#todayText").textContent=formatDate(todayISO());
document.querySelector("#heroDate").textContent=formatDate(todayISO());
document.querySelector("#calendarDate").value=todayISO();

document.querySelector("#ddayForm").addEventListener("submit",e=>{e.preventDefault();const name=document.querySelector("#ddayName").value.trim(),date=document.querySelector("#ddayDate").value;if(!name||!date)return;data.ddays.push({id:uid(),name,date});saveData();e.target.reset();renderAll()});
document.querySelector("#todoForm").addEventListener("submit",e=>{e.preventDefault();const text=document.querySelector("#todoText").value.trim();if(!text)return;data.todos.push({id:uid(),text,done:false,dueDate:todayISO()});saveData();e.target.reset();renderAll()});
document.querySelector("#studyForm").addEventListener("submit",e=>{e.preventDefault();const subject=document.querySelector("#studySubject").value.trim(),minutes=Number(document.querySelector("#studyMinutes").value);if(!subject||!minutes)return;data.studies.push({id:uid(),subject,minutes,date:todayISO()});saveData();e.target.reset();renderAll()});
document.querySelector("#scheduleForm").addEventListener("submit",e=>{e.preventDefault();const subject=document.querySelector("#scheduleSubject").value.trim();if(!subject)return;data.schedule.push({id:uid(),day:document.querySelector("#scheduleDay").value,subject});saveData();e.target.reset();renderAll()});
document.querySelector("#noteForm").addEventListener("submit",e=>{e.preventDefault();const text=document.querySelector("#noteText").value.trim();if(!text)return;data.notes.unshift({id:uid(),text,date:todayISO()});saveData();e.target.reset();renderAll()});
document.querySelector("#calendarDate").addEventListener("change",renderCalendar);

document.addEventListener("change",e=>{const cb=e.target;if(!cb.classList.contains("todo-check"))return;const item=data.todos.find(x=>String(x.id)===String(cb.dataset.id));if(!item)return;item.done=cb.checked;if(item.done)item.completedAt=Date.now();else delete item.completedAt;saveData();renderTodos();renderCalendar()});
document.addEventListener("click",e=>{const button=e.target.closest("[data-action]");if(!button)return;const {action,id}=button.dataset;if(action==="delete-dday")data.ddays=data.ddays.filter(x=>String(x.id)!==String(id));if(action==="delete-todo")data.todos=data.todos.filter(x=>String(x.id)!==String(id));if(action==="delete-study")data.studies=data.studies.filter(x=>String(x.id)!==String(id));if(action==="delete-schedule")data.schedule=data.schedule.filter(x=>String(x.id)!==String(id));if(action==="delete-note")data.notes=data.notes.filter(x=>String(x.id)!==String(id));saveData();renderAll()});

renderAll();
