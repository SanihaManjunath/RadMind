const ATTACK_TYPES = [
  { name: "DDoS", color: "rgba(255,77,79,0.85)" },
  { name: "Phishing", color: "rgba(250,173,20,0.85)" },
  { name: "Malware", color: "rgba(146,84,222,0.85)" },
  { name: "Bruteforce", color: "rgba(54,207,201,0.85)" },
  { name: "Ransomware", color: "rgba(82,196,26,0.85)" }
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
