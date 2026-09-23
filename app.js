
const KEY = "kampanjeovelser-v2";
const CURRENT_WEEK = weekNumber();

let saved = JSON.parse(localStorage.getItem(KEY) || "null");
let data = saved?.current || [];
let history = saved?.history || [];

document.getElementById("week").textContent = "Uke " + CURRENT_WEEK;

function save(){
  localStorage.setItem(KEY, JSON.stringify({current:data, history}));
}

function weekNumber(d=new Date()){
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate()+4-day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  return Math.ceil((((date-yearStart)/86400000)+1)/7);
}

function render(){
  const list=document.getElementById("list");
  list.innerHTML="";

  if(data.length===0){
    list.innerHTML='<div class="card"><div style="color:#77736b">Ingen kampanjeøvelser valgt ennå. Trykk «Legg til kampanjeøvelse» for å velge selv.</div></div>';
  }

  data.forEach((x,i)=>{
    if(!x.color) x.color="#7ca66a";
    const card=document.createElement("div");
    card.className="card";

    const row=document.createElement("div");
    row.className="row";
    row.innerHTML=`
      <div class="name">${escapeHtml(x.name)}</div>
      <input class="color" type="color" value="${x.color}" title="Velg farge" onchange="setColor(${i},this.value)">
      <button class="minus" onclick="change(${i},-1)">−</button>
      <div class="count">${x.count}</div>
      <button class="plus" onclick="change(${i},1)">+</button>
      <button class="delete" onclick="removeExercise(${i})" title="Fjern">×</button>`;
    card.appendChild(row);

    const boxes=document.createElement("div");
    boxes.className="boxes";
    const amount=Math.max(10,x.count);
    for(let n=0;n<amount;n++){
      const b=document.createElement("span");
      b.className="box";
      if(n<x.count) b.style.background=x.color;
      boxes.appendChild(b);
    }
    card.appendChild(boxes);
    list.appendChild(card);
  });

  renderHistory();
}

function renderHistory(){
  const el=document.getElementById("history");
  if(!history.length){
    el.innerHTML='<div class="history-empty">Ingen tidligere uker ennå.</div>';
    return;
  }
  el.innerHTML=history.slice().reverse().map(h=>`
    <div class="history-row">
      <strong>Uke ${h.week}</strong>
      <div>${h.items.map(x=>`<span class="tag" style="background:${x.color}22">${escapeHtml(x.name)}: <b>${x.count}</b></span>`).join("")}</div>
    </div>`).join("");
}

function change(i,delta){
  data[i].count=Math.max(0,data[i].count+delta);
  save(); render();
}

function setColor(i,color){
  data[i].color=color;
  save(); render();
}

function removeExercise(i){
  data.splice(i,1);
  save(); render();
}

function newWeek(){
  if(data.length){
    history.push({
      week: CURRENT_WEEK,
      items: data.map(x=>({name:x.name,count:x.count,color:x.color}))
    });
  }
  // A new week starts completely empty so the user chooses the campaigns again.
  data=[];
  save(); render();
  document.getElementById("week").textContent="Uke "+CURRENT_WEEK;
}

function showNew(){
  document.getElementById("newBox").style.display="flex";
  document.getElementById("newName").focus();
}

function addExercise(){
  const input=document.getElementById("newName");
  const name=input.value.trim();
  if(!name) return;
  data.push({name,count:0,color:"#7ca66a"});
  input.value="";
  document.getElementById("newBox").style.display="none";
  save(); render();
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

render();
