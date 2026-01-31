const globeContainer = document.getElementById("globe-container");
const targetsList = document.getElementById("targets-list");
const feedList = document.getElementById("feed-list");

const todayEl = document.getElementById("count-today");
const activeEl = document.getElementById("count-active");

let totalToday = 0;
let heatRings = [];

const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")

  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcAltitude(0.32)
  .arcStroke(0.6)
  .arcDashLength(0.18)
  .arcDashGap(0.8)
  .arcDashInitialGap(d => d._dashOffset)
  .arcDashAnimateTime(1800)

  .ringsData(heatRings)
  .ringColor(d => d.color)
  .ringMaxRadius(d => d.maxR)
  .ringPropagationSpeed(d => d.speed)
  .ringRepeatPeriod(d => d.repeat)

  .pointOfView({ lat: 20, lng: 0, altitude: 2.35 })
  (globeContainer);

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.35;

/* ================= FEED ================= */
function addToFeed(attack) {
  const li = document.createElement("li");
  const time = new Date(attack.time).toLocaleTimeString();

  li.innerHTML = `
    <span class="feed-time">[${time}]</span>
    <span class="feed-path" style="color:${attack.color}">
      ${attack.source} → ${attack.target}
    </span>
  `;

  feedList.prepend(li);
  if (feedList.children.length > 30) {
    feedList.removeChild(feedList.lastChild);
  }
}

/* ================= TARGETS ================= */
function updateTopTargets() {
  const counts = {};
  liveAttacks.forEach(a => counts[a.target] = (counts[a.target] || 0) + 1);

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

/* ================= GENERATOR ================= */
function generateAttack() {
  const attack = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
  let from, to;

  do {
    from = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  } while (from === to);

  return {
    startLat: from.lat,
    startLng: from.lng,
    endLat: to.lat,
    endLng: to.lng,
    source: from.country,
    target: to.country,
    color: attack.color,
    time: Date.now(),
    _dashOffset: Math.random() * 2
  };
}

/* ================= LOOP ================= */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);
  if (liveAttacks.length > 20) liveAttacks.shift();

  heatRings.push({
    lat: attack.endLat,
    lng: attack.endLng,
    maxR: 2.5,
    speed: 2,
    repeat: 700,
    color: attack.color
  });

  globe.arcsData(liveAttacks);
  globe.ringsData(heatRings);

  addToFeed(attack);
  updateTopTargets();

  totalToday++;
  todayEl.textContent = totalToday;
  activeEl.textContent = liveAttacks.length;

}, 1800);
