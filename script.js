// script.js

const globeContainer = document.getElementById("globe-container");
const targetsList = document.getElementById("targets-list");
const feedList = document.getElementById("feed-list");

const todayEl = document.getElementById("count-today");
const activeEl = document.getElementById("count-active");

let totalToday = 0;
const heatRings = [];

/* ================= GLOBE ================= */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")

  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcAltitude(0.32)
  .arcStroke(0.6)
  .arcDashLength(0.18)
  .arcDashGap(0.8)
  .arcDashInitialGap(d => d._dashOffset || 0)
  .arcDashAnimateTime(1800)

  .ringsData(heatRings)
  .ringColor(d => d.color)
  .ringMaxRadius(d => d.maxR)
  .ringPropagationSpeed(d => d.propagationSpeed)
  .ringRepeatPeriod(d => d.repeatPeriod)

  .labelsData(LOCATIONS)
  .labelLat(d => d.lat)
  .labelLng(d => d.lng)
  .labelText(d => d.country)
  .labelSize(0.75)
  .labelDotRadius(0.12)
  .labelColor(() => "rgba(140,170,200,0.55)")
  .labelResolution(1.5)
  .labelAltitude(0.008)

  .pointOfView({ lat: 20, lng: 0, altitude: 2.35 })
  (globeContainer);

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.35;

/* ================= UTIL ================= */
function getLocation(country) {
  return LOCATIONS.find(l => l.country === country);
}

function addRegionHeat(attack) {
  heatRings.push({
    lat: attack.endLat,
    lng: attack.endLng,
    maxR: 2.6,
    propagationSpeed: 2.2,
    repeatPeriod: 700,
    color: attack.color
  });
  globe.ringsData(heatRings);
}

/* ================= PANELS ================= */
function updateTopTargets() {
  const counts = {};
  liveAttacks.forEach(a => {
    counts[a.target] = (counts[a.target] || 0) + 1;
  });

  targetsList.innerHTML = "";
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([country, count]) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${country}</span><span>${count}</span>`;
      targetsList.appendChild(li);
    });
}

function addToFeed(attack) {
  const li = document.createElement("li");
  const time = new Date().toLocaleTimeString();

  li.innerHTML = `
    <span class="feed-time">[${time}]</span>
    <span class="feed-path" style="color:${attack.color}">
      Known Attacker → ${attack.target}
      (Next: ${attack.nextMove})
    </span>
  `;

  feedList.prepend(li);
  if (feedList.children.length > 20) {
    feedList.removeChild(feedList.lastChild);
  }
}

function updateCounters() {
  totalToday++;
  todayEl.textContent = totalToday;
  activeEl.textContent = liveAttacks.length;
}

/* ================= 🔥 BACKEND INTEGRATION ================= */
async function fetchLiveAttack() {
  const res = await fetch("http://127.0.0.1:5000/demo_attack");
  const data = await res.json();

  if (data.status !== "KNOWN_ATTACKER_DETECTED") return;

  const from = getLocation("Japan"); // attacker origin (demo)
  const to = getLocation(data.company === "XYZ" ? "India" : "USA");

  const attackType = ATTACK_TYPES.find(a => a.name === "DDoS");

  const attack = {
    startLat: from.lat,
    startLng: from.lng,
    endLat: to.lat,
    endLng: to.lng,
    source: from.country,
    target: to.country,
    color: attackType.color,
    nextMove: data.predicted_next_move,
    _dashOffset: Math.random() * 2
  };

  liveAttacks.push(attack);
  if (liveAttacks.length > 20) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  addRegionHeat(attack);
  updateTopTargets();
  addToFeed(attack);
  updateCounters();
}

/* ================= LIVE LOOP ================= */
setInterval(fetchLiveAttack, 3000);
