fetch('./data/attacks.json')
  .then(res => res.json())
  .then(attacks => {

    // Global stats
    document.getElementById('totalAttacks').innerText = attacks.length;
    document.getElementById('activeAttacks').innerText =
      Math.floor(attacks.length * 0.6);

    const countries = new Set();
    attacks.forEach(a => countries.add(a.destination));
    document.getElementById('countriesAffected').innerText = countries.size;

    // Top targets
    const targetCount = {};
    attacks.forEach(a => {
      targetCount[a.destination] =
        (targetCount[a.destination] || 0) + 1;
    });

    const sorted = Object.entries(targetCount)
      .sort((a, b) => b[1] - a[1]);

    const topTargets = document.getElementById('topTargets');
    sorted.forEach(([country, count]) => {
      const li = document.createElement('li');
      li.textContent = `${country} – ${count}`;
      topTargets.appendChild(li);
    });

    // Timeline
    const timeline = document.getElementById('timeline');
    attacks.forEach(a => {
      const li = document.createElement('li');
      li.innerHTML = `<span style="color:${a.color}">●</span>
        ${a.type} — ${a.source} ➝ ${a.destination}`;
      timeline.appendChild(li);
    });
  });
