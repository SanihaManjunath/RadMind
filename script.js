// ================= TIME FORMATTER (24-HOUR) =================
function getCurrentTime24() {
  const now = new Date();
  return now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

// ================= LIVE ATTACK FEED =================
const feedList = document.getElementById("feed-list");

function addLiveAttack(from, to, colorClass) {
  const li = document.createElement("li");

  li.innerHTML = `
    <span class="feed-time">[${getCurrentTime24()}]</span>
    <span class="feed-path ${colorClass}">${from} → ${to}</span>
  `;

  feedList.prepend(li);

  // limit feed size
  if (feedList.children.length > 40) {
    feedList.removeChild(feedList.lastChild);
  }
}

// ================= DEMO DATA =================
const countries = ["USA", "India", "Germany", "China", "UK", "Japan", "Brazil", "Russia"];
const attackTypes = ["ddos", "phishing", "malware", "bruteforce", "ransomware"];

setInterval(() => {
  let from = countries[Math.floor(Math.random() * countries.length)];
  let to = countries[Math.floor(Math.random() * countries.length)];
  while (to === from) {
    to = countries[Math.floor(Math.random() * countries.length)];
  }

  const type = attackTypes[Math.floor(Math.random() * attackTypes.length)];
  addLiveAttack(from, to, type);
}, 1800);
