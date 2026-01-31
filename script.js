const globeContainer = document.getElementById("globe-container");
const targetsList = document.getElementById("targets-list");
const feedList = document.getElementById("feed-list");

const todayEl = document.getElementById("count-today");
const activeEl = document.getElementById("count-active");
const peakEl = document.getElementById("count-peak");

let liveAttacks = [];
let heatPoints = [];

let totalToday = 0;
let attacksThisMinute = [];
let peakPerMinute = 0;

/* GLOBE */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")

  /* ATTACK ARCS WITH MOVING ARROWS */
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcStroke(1.8)
  .arcAltitude(0.3)
  .arcDashLength(0.45)
  .arcDashGap(3)
  .arcDashAnimateTime(2600)

  /* REGION HEAT GLOW */
  .pointsData(heatPoints)
  .pointLat(d => d.lat)
  .pointLng(d => d.lng)
  .pointColor(d => d.color)
  .pointRadius(d => d.radius)
  .pointAltitude(0.02)

  .pointOfView({ lat: 20, lng: 0, altitude: 2.2 })
  (globeContainer);

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.35;

/* UI */
function updateTopTargets() {
  const counts = {};
  liveAttacks.forEach(a => counts[a.target] = (counts[a.target] || 0) + 1);

  targetsList.innerHTML = "";
  Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5)
    .forEach(([c,n])=>{
      const li = document.createElement("li");
      li.innerHTML = `<span>${c}</span><span>${n}</span>`;
      targetsList.appendChild(li);
    });
}

function addToFeed(a) {
  const li = document.createElement("li");
  li.innerHTML = `
    <span class="feed-time">[${new Date(a.time).toLocaleTimeString()}]</span>
    <span class="feed-type" style="color:${a.color}">${a.type}</span>
    | ${a.source} → ${a.target}
  `;
  feedList.prepend(li);
  if (feedList.children.length > 20) feedList.lastChild.remove();
}

function updateCounters() {
  totalToday++;
  todayEl.textContent = totalToday;
  activeEl.textContent = liveAttacks.length;

  const now = Date.now();
  attacksThisMinute.push(now);
  attacksThisMinute = attacksThisMinute.filter(t => now - t < 60000);
  peakPerMinute = Math.max(peakPerMinute, attacksThisMinute.length);
  peakEl.textContent = peakPerMinute;
}

/* HEAT MAP */
function addHeat(loc, color) {
  heatPoints.push({
    lat: loc.lat,
    lng: loc.lng,
    color,
    radius: 0.5,
    created: Date.now()
  });
  heatPoints = heatPoints.filter(h => Date.now() - h.created < 12000);
}

/* ATTACK GENERATOR */
function generateAttack() {
  const attack = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
  let from = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  let to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  while (from === to) to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

  addHeat(to, attack.color);

  return {
    startLat: from.lat,
    startLng: from.lng,
    endLat: to.lat,
    endLng: to.lng,
    source: from.country,
    target: to.country,
    color: attack.color,
    type: attack.name,
    time: Date.now()
  };
}

/* LOOP */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);
  if (liveAttacks.length > 20) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  globe.pointsData(heatPoints);

  updateTopTargets();
  addToFeed(attack);
  updateCounters();
}, 2000);
