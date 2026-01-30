let total = 0;
let active = 0;
const regions = ["USA","India","Germany","China","Brazil","UK","Japan"];
const targetCount = {};

const totalEl = document.getElementById("totalAttacks");
const activeEl = document.getElementById("activeAttacks");
const countriesEl = document.getElementById("countriesAffected");
const topTargetsEl = document.getElementById("topTargets");
const timelineEl = document.getElementById("attackTimeline");
const alertsEl = document.getElementById("regionAlerts");

window.addEventListener("newAttack", () => {
  total++;
  active = Math.floor(Math.random()*5)+1;
  totalEl.innerText = total;
  activeEl.innerText = active;

  const src = regions[Math.floor(Math.random()*regions.length)];
  const dst = regions[Math.floor(Math.random()*regions.length)];

  targetCount[dst]=(targetCount[dst]||0)+1;
  countriesEl.innerText = Object.keys(targetCount).length;

  topTargetsEl.innerHTML="";
  Object.entries(targetCount).sort((a,b)=>b[1]-a[1]).slice(0,5)
    .forEach(([c,n])=>{
      const li=document.createElement("li");
      li.textContent=`${c} – ${n}`;
      topTargetsEl.appendChild(li);
    });

  const tli=document.createElement("li");
  tli.textContent=`Attack ${src} → ${dst}`;
  timelineEl.prepend(tli);
  if(timelineEl.children.length>6) timelineEl.removeChild(timelineEl.lastChild);

  const ali=document.createElement("li");
  ali.textContent=`${dst} under attack`;
  alertsEl.prepend(ali);
  if(alertsEl.children.length>5) alertsEl.removeChild(alertsEl.lastChild);
});
