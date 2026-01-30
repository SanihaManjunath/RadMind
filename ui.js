let totalAttacks = 0;
let activeAttacks = 0;

const totalEl = document.getElementById("totalAttacks");
const activeEl = document.getElementById("activeAttacks");
const countriesEl = document.getElementById("countriesAffected");

const topTargetsEl = document.getElementById("topTargets");
const timelineEl = document.getElementById("attackTimeline");
const regionAlertsEl = document.getElementById("regionAlerts");

const targetCount = {};
const regions = ["USA", "India", "Germany", "China", "Brazil", "UK", "Japan"];

function randomRegion() {
  return regions[Math.floor(Math.random() * regions.length)];
}

window.addEventListener("newAttack", (e) => {
  totalAttacks++;
  activeAttacks = Math.floor(Math.random() * 5) + 1;

  totalEl.innerText = totalAttacks;
  activeEl.innerText = activeAttacks;

  const source = randomRegion();
  const target = randomRegion();

  // Countries affected
  const affected = new Set(Object.keys(targetCount));
  affected.add(target);
  countriesEl.innerText = affected.size;

  // Top targets
  targetCount[target] = (targetCount[target] || 0) + 1;
  topTargetsEl.innerHTML = "";
  Object.entries(targetCount)
    .sort((a,b) => b[1] - a[1])
    .slice(0,5)
    .forEach(([country, count]) => {
      const li = document.createElement("li");
      li.textContent = `${country} – ${count}`;
      topTargetsEl.appendChild(li);
    });

  // Timeline
  const timeItem = document.createElement("li");
  timeItem.textContent = `${e.detail} — ${source} → ${target}`;
  timelineEl.prepend(timeItem);
  if (timelineEl.children.length > 6) timelineEl.removeChild(timelineEl.lastChild);

  // Region alerts
  const alert = document.createElement("li");
  alert.textContent = `${target} under attack`;
  regionAlertsEl.prepend(alert);
  if (regionAlertsEl.children.length > 5) regionAlertsEl.removeChild(regionAlertsEl.lastChild);
});
