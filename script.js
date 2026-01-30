const globeContainer = document.getElementById("globe-container");
const targetsList = document.getElementById("targets-list");
const feedList = document.getElementById("feed-list");
const regionList = document.getElementById("region-list");

const todayEl = document.getElementById("count-today");
const activeEl = document.getElementById("count-active");
const peakEl = document.getElementById("count-peak");

let totalToday = 0;
let attacksThisMinute = [];
let peakPerMinute = 0;
let liveAttacks = [];

/* ================= GLOBE ================= */
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

/* ================= PANELS ================= */
function updateTopTargets() {
  const counts = {};
  liveAttacks.forEach(a => counts[a.target] = (counts[a.target] || 0) + 1);

  targetsList.innerHTML = "";
  Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5)
    .forEach(([c,n]) => {
      targetsList.innerHTML += `<li><span>${c}</span><span>${n}</span></li>`;
    });
}

function updateRegionAlerts() {
  const counts = {};
  liveAttacks.forEach(a => counts[a.target] = (counts[a.target] || 0) + 1);

  regionList.innerHTML = "";
  Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5)
    .forEach(([country,count]) => {
      let level = count >= 5 ? "high" : count >= 3 ? "medium" : "low";
      regionList.innerHTML += `
        <li class="${level}">
          <span>${country}</span>
          <span>${count}</span>
        </li>`;
    });
}

function addToFeed(attack) {
  const li = document.createElement("li");
  const time = new Date(attack.time).toLocaleTimeString();
  li.innerHTML = `[${time}] <span style="color:${attack.color}">${attack.type}</span> | ${attack.source} → ${attack.target}`;
  feedList.prepend(li);
  if (feedList.children.length > 20) feedList.removeChild(feedList.lastChild);
}

/* ================= COUNTERS ================= */
function updateCounters() {
  totalToday++;
  todayEl.textContent = totalToday;
  activeEl.textContent = liveAttacks.length;

  const now = Date.now();
  attacksThisMinute.push(now);
  attacksThisMinute = attacksThisMinute.filter(t => now - t < 60000);

  if (attacksThisMinute.length > peakPerMinute) {
    peakPerMinute = attacksThisMinute.length;
    peakEl.textContent = peakPerMinute;
  }
}

/* ================= ATTACK GENERATOR ================= */
function generateAttack() {
  const attack = ATTACK_TYPES[Math.floor(Math.random()*ATTACK_TYPES.length)];
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
    color: attack.color,
    type: attack.name,
    time: Date.now()
  };
}

/* ================= LOOP ================= */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);
  if (liveAttacks.length > 18) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  updateTopTargets();
  updateRegionAlerts();
  addToFeed(attack);
  updateCounters();
}, 2000);
