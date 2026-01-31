const ATTACK_TYPES = [
  { name: "DDoS", color: "#ff4d4f" },
  { name: "Phishing", color: "#faad14" },
  { name: "Malware", color: "#9254de" },
  { name: "Bruteforce", color: "#36cfc9" },
  { name: "Ransomware", color: "#52c41a" }
];

const LOCATIONS = [
  { country: "USA", lat: 38, lng: -97 },
  { country: "India", lat: 21, lng: 78 },
  { country: "China", lat: 35, lng: 103 },
  { country: "Germany", lat: 51, lng: 10 },
  { country: "Brazil", lat: -10, lng: -55 },
  { country: "Japan", lat: 36, lng: 138 },
  { country: "Russia", lat: 61, lng: 100 },
  { country: "UK", lat: 55, lng: -3 }
];

const liveAttacks = [];
