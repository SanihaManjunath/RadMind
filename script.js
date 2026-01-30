const globeContainer = document.getElementById("globe-container");
const targetsList = document.getElementById("targets-list");
const feedList = document.getElementById("feed-list");

const todayEl = document.getElementById("count-today");
const activeEl = document.getElementById("count-active");
const peakEl = document.getElementById("count-peak");

let totalToday = 0;
let attacksThisMinute = [];
let peakPerMinute = 0;

/* GLOBE */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcStroke(1.4)
  .arcAltitude(0.25)
  .arcDashLength(0.55)
  .arcDashGap(4)
  .arcDashAnimateTime(3200)
  .pointOfView({ lat: 20, lng: 0, altitude: 2.25 })
  (globeContainer);

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.32;

/* CAMERA */
let isFocusing = false;
function focusOnAttack(a) {
  if (isFocusing) return;
  isFocusing = true;
  globe.controls().autoRotate = false;
  globe.pointOfView({ lat:a.endLat, lng:a.endLng, altitude:1.6 }, 1200);
  setTimeout(() => {
    globe.pointOfView({ lat:20, lng:0, altitude:2.25 }, 1200);
    setTimeout(() => {
      globe.controls().autoRotate = true;
      isFocusing = false;
    }, 1200);
  }, 1500);
}

/* PANELS */
function updateTopTargets() {
  const counts = {};
  liveAttacks.forEach(a => counts[a.target]=(counts[a.target]||0)+1);
  targetsList.innerHTML="";
  Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5)
    .forEach(([c,n])=>{
      const li=document.createElement("li");
      li.innerHTML=`<span>${c}</span><span>${n}</span>`;
      targetsList.appendChild(li);
    });
}

function addToFeed(a) {
  const li=document.createElement("li");
  li.innerHTML=`[${new Date(a.time).toLocaleTimeString()}] 
    <span style="color:${a.color}">${a.type}</span> | ${a.source} → ${a.target}`;
  feedList.prepend(li);
  if(feedList.children.length>20) feedList.removeChild(feedList.lastChild);
}

/* COUNTERS */
function pulse(el){
  el.classList.add("pulse");
  setTimeout(()=>el.classList.remove("pulse"),200);
}

function updateCounters() {
  totalToday++;
  todayEl.textContent = totalToday;
  activeEl.textContent = liveAttacks.length;

  pulse(todayEl);
  pulse(activeEl);

  const now=Date.now();
  attacksThisMinute.push(now);
  attacksThisMinute=attacksThisMinute.filter(t=>now-t<60000);

  if(attacksThisMinute.length>peakPerMinute){
    peakPerMinute=attacksThisMinute.length;
    peakEl.textContent=peakPerMinute;
    peakEl.style.color = peakPerMinute>=20 ? "#ff4d4f"
                        : peakPerMinute>=10 ? "#faad14"
                        : "#fff";
    pulse(peakEl);
  }
}

/* ATTACK GEN */
function generateAttack() {
  const a=ATTACK_TYPES[Math.floor(Math.random()*ATTACK_TYPES.length)];
  let from,to;
  do{
    from=LOCATIONS[Math.floor(Math.random()*LOCATIONS.length)];
    to=LOCATIONS[Math.floor(Math.random()*LOCATIONS.length)];
  }while(from===to);
  return {
    startLat:from.lat,startLng:from.lng,
    endLat:to.lat,endLng:to.lng,
    source:from.country,target:to.country,
    color:a.color,type:a.name,time:Date.now()
  };
}

/* LOOP */
setInterval(()=>{
  const attack=generateAttack();
  liveAttacks.push(attack);
  if(liveAttacks.length>18) liveAttacks.shift();
  globe.arcsData(liveAttacks);
  updateTopTargets();
  addToFeed(attack);
  updateCounters();
  focusOnAttack(attack);
},2000);
