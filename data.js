/* ================= ATTACK COLOR PALETTE ================= */
const ATTACK_COLOR_MAP = {
  DDoS: "#ff4d4f",        // Red
  Phishing: "#faad14",    // Yellow
  Malware: "#9254de",     // Purple
  Bruteforce: "#36cfc9",  // Cyan
  Ransomware: "#52c41a"   // Green
};

/* ================= ATTACK TYPES ================= */
const ATTACK_TYPES = Object.keys(ATTACK_COLOR_MAP).map(type => ({
  name: type,
  color: ATTACK_COLOR_MAP[type]
}));

/* ================= LOCATIONS ================= */
const LOCATIONS = [
  { country: "USA", lat: 37.7749, lng: -122.4194 },
  { country: "UK", lat: 51.5074, lng: -0.1278 },
  { country: "Germany", lat: 52.52, lng: 13.405 },
  { country: "India", lat: 28.6139, lng: 77.209 },
  { country: "China", lat: 39.9042, lng: 116.4074 },
  { country: "Japan", lat: 35.6895, lng: 139.6917 },
  { country: "Russia", lat: 55.7558, lng: 37.6173 },
  { country: "Brazil", lat: -23.5505, lng: -46.6333 }
];

let liveAttacks = [];
