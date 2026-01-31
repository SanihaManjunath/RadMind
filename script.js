const globeContainer = document.getElementById("globe-container");
const targetsList = document.getElementById("targets-list");
const feedList = document.getElementById("feed-list");

const todayEl = document.getElementById("count-today");
const activeEl = document.getElementById("count-active");
const peakEl = document.getElementById("count-peak");

let liveAttacks = [];
let regionHeat = [];
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
  .arcDashAnimateTime(3000)
  .pointsData(regionHeat)
  .pointLat(d => d.lat)
  .pointLng(d => d.lng)
  .pointColor(d => d.color)
  .pointAltitude(0.035)
  .pointRadius(d => d.intensity * 1.6)
  .pointOpacity(0.35)
  .pointResolution(32)
  .pointOfView({ lat: 20, lng: 0, altitude: 2.2 })
  (globeContainer);

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.3;

/* REGION HEAT */
function addRegionHeat(attack) {
  const existing = regionHeat.find(r => r.country === attack.target);

  if (existing) {
    existing.intensity = Math.min(existing.intensity + 0.35, 2.5);
  } else {
    regionHeat.push({
      country: attack.target,
      lat: attack.endLat,
      lng: attack.endLng,
      intensity: 0.9,
      color: attack.color
    });
  }

  globe.pointsData(regionHeat);
}

/* DECAY */
setInterval(() => {
  regionHeat = regionHeat
    .map(r => ({ ...r, intensity: r.intensity * 0.92 }))
    .filter(r => r.intensity > 0.18);

  globe.pointsData(regionHeat);
}, 1200);

/* PANELS */
function updateTopTargets() {
  const counts = {};
  liveAttacks.forEach(a => counts[a.target] = (counts[a.target] || 0) + 1);

  targetsList.innerHTML = "";
  Object.entries(counts)
    .sort((a,b) => b[1] - a[1])
    .slice(0,5)
    .forEach(([c,n]) => {
      targetsList.innerHTML += `<li><span>${c}</span><span>${n}</span></li>`;
    });
}

function addToFeed(a) {
  const li = document.createElement("li");
  li.innerHTML = `[${new Date().toLocaleTimeString()}] 
    <span style="color:${a.color}">${a.type}</span> | ${a.source} → ${a.target}`;
  feedList.prepend(li);
  if (feedList.children.length > 20) feedList.removeChild(feedList.lastChild);
}

/* COUNTERS */
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

/* GENERATE ATTACK */
function generateAttack() {
  const type = ATTACK_TYPES[Math.floor(Math.random()*ATTACK_TYPES.length)];
  let from = LOCATIONS[Math.floor(Math.random()*LOCATIONS.length)];
  let to = LOCATIONS[Math.floor(Math.random()*LOCATIONS.length)];
  while (from === to) to = LOCATIONS[Math.floor(Math.random()*LOCATIONS.length)];

  return {
    startLat: from.lat,
    startLng: from.lng,
    endLat: to.lat,
    endLng: to.lng,
    source: from.country,
    target: to.country,
    color: type.color,
    type: type.name
  };
}

/* LOOP */
setInterval(() => {
  const a = generateAttack();
  liveAttacks.push(a);
  if (liveAttacks.length > 18) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  addRegionHeat(a);
  updateTopTargets();
  addToFeed(a);
  updateCounters();
}, 2000);
