let total = 0;
let active = 0;

const totalEl = document.getElementById("totalAttacks");
const activeEl = document.getElementById("activeAttacks");

window.addEventListener("newAttack", () => {
  total++;
  active = Math.max(1, Math.floor(Math.random() * 5));

  totalEl.innerText = total;
  activeEl.innerText = active;
});
