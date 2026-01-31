const ATTACK_TYPES = [
  { name: "DDoS", color: "rgba(0,229,255,0.85)" },       // cyan
  { name: "Phishing", color: "rgba(255,213,79,0.85)" }, // amber
  { name: "Malware", color: "rgba(179,136,255,0.85)" }, // purple
  { name: "Bruteforce", color: "rgba(29,233,182,0.85)" }, // teal
  { name: "Ransomware", color: "rgba(105,240,174,0.85)" } // green
];

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
