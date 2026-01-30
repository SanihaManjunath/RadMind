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

  /* ✅ CLEAR MOVING ARROWS */
  .arcColor(d => d.color)
  .arcStroke(2.2)
  .arcAltitude(0.35)

  /* 🔥 KEY FIX */
  .arcDashLength(0.35)        // LONG arrowhead
  .arcDashGap(0.8)            // VERY small gap
  .arcDashInitialGap(() => Math.random())
  .arcDashAnimateTime(1800)   // faster motion

  .pointOfView({ lat: 20, lng: 0, altitude: 2.3 })
  (globeContainer);

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.3;

/* ATTACK LOGIC */
function generateAttack() {
  const a = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
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
    color: a.color,
    type: a.name,
    time: Date.now()
  };
}

/* UI */
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

function updateTopTargets() {
  const counts = {};
  liveAttacks.forEach(a => counts[a.target] = (counts[a.target] || 0) + 1);

  targetsList.innerHTML = "";
  Object.entries(counts)
    .sort((a,b) => b[1]-a[1])
    .slice(0,5)
    .forEach(([c,n]) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${c}</span><span>${n}</span>`;
      targetsList.appendChild(li);
    });
}

function addToFeed(a) {
  const li = document.createElement("li");
  li.innerHTML = `[${new Date(a.time).toLocaleTimeString()}]
    <span style="color:${a.color}">${a.type}</span> | ${a.source} → ${a.target}`;
  feedList.prepend(li);
  if (feedList.children.length > 20)
    feedList.removeChild(feedList.lastChild);
}

/* LOOP */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);
  if (liveAttacks.length > 15) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  updateCounters();
  updateTopTargets();
  addToFeed(attack);
}, 2000);
