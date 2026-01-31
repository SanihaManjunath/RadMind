const globeContainer = document.getElementById("globe-container");
const targetsList = document.getElementById("targets-list");
const feedList = document.getElementById("feed-list");

const todayEl = document.getElementById("count-today");
const activeEl = document.getElementById("count-active");
const peakEl = document.getElementById("count-peak");

let totalToday = 0;
let attacksThisMinute = [];
let peakPerMinute = 0;

/* COUNTRY HEAT STORAGE */
const countryHeat = {};

/* GLOBE */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")
  .arcColor(d => d.color)
  .arcStroke(1.4)
  .arcAltitude(0.25)
  .arcDashLength(0.5)
  .arcDashGap(4)
  .arcDashAnimateTime(3200)
  .pointOfView({ lat: 20, lng: 0, altitude: 2.3 })
  (globeContainer);

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.3;

/* LOAD COUNTRIES */
fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
  .then(res => res.json())
  .then(data => {
    const countries = topojson.feature(data, data.objects.countries).features;

    globe.polygonsData(countries)
      .polygonCapColor(() => "rgba(0,0,0,0)")
      .polygonSideColor(() => "rgba(0,0,0,0)")
      .polygonStrokeColor(d => {
        const heat = countryHeat[d.properties.name] || 0;
        return heat > 0 ? `rgba(255,80,80,${Math.min(0.8, heat / 10)})` : "rgba(0,0,0,0)";
      })
      .polygonStrokeWidth(d => {
        const heat = countryHeat[d.properties.name] || 0;
        return heat > 0 ? Math.min(2.5, heat / 2) : 0;
      });
  });

/* ATTACK GENERATOR */
function generateAttack() {
  const attack = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
  let from = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  let to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  while (from === to) to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

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

/* UPDATE UI */
function updateUI(attack) {
  totalToday++;
  todayEl.textContent = totalToday;

  activeEl.textContent = liveAttacks.length;

  const now = Date.now();
  attacksThisMinute.push(now);
  attacksThisMinute = attacksThisMinute.filter(t => now - t < 60000);
  peakPerMinute = Math.max(peakPerMinute, attacksThisMinute.length);
  peakEl.textContent = peakPerMinute;

  countryHeat[attack.target] = (countryHeat[attack.target] || 0) + 1;

  setTimeout(() => {
    countryHeat[attack.target] = Math.max(0, countryHeat[attack.target] - 1);
  }, 6000);

  const li = document.createElement("li");
  li.innerHTML = `[${new Date(attack.time).toLocaleTimeString()}] 
    <span style="color:${attack.color}">${attack.type}</span> | 
    ${attack.source} → ${attack.target}`;
  feedList.prepend(li);
  if (feedList.children.length > 20) feedList.removeChild(feedList.lastChild);

  const counts = {};
  liveAttacks.forEach(a => counts[a.target] = (counts[a.target] || 0) + 1);
  targetsList.innerHTML = "";
  Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5)
    .forEach(([c,n])=>{
      const li=document.createElement("li");
      li.innerHTML=`<span>${c}</span><span>${n}</span>`;
      targetsList.appendChild(li);
    });
}

/* LIVE LOOP */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);
  if (liveAttacks.length > 18) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  updateUI(attack);
}, 2000);
