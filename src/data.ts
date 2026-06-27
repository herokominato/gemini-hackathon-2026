import { CoffeeShop } from './types';

// Map boundary for central Tokyo area to render fallback offline radar map with percentages
export const TOKYO_BOUNDS = {
  minLat: 35.6350,
  maxLat: 35.6800,
  minLng: 139.6500,
  maxLng: 139.7250,
};

/**
 * Translates real GPS Lat/Lng in central Tokyo to percentage coordinates (0-100) for custom SVG fallback radar
 */
export function realToPercent(lat: number, lng: number) {
  const x = ((lng - TOKYO_BOUNDS.minLng) / (TOKYO_BOUNDS.maxLng - TOKYO_BOUNDS.minLng)) * 100;
  // y is inverted since 0% is at the top of the screen
  const y = (1 - (lat - TOKYO_BOUNDS.minLat) / (TOKYO_BOUNDS.maxLat - TOKYO_BOUNDS.minLat)) * 100;
  // clamp values
  return {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(5, Math.min(95, y))
  };
}

/**
 * Translates percentage coordinates (0-100) to real GPS Lat/Lng in central Tokyo
 */
export function percentToReal(x: number, y: number) {
  const lng = TOKYO_BOUNDS.minLng + (x / 100) * (TOKYO_BOUNDS.maxLng - TOKYO_BOUNDS.minLng);
  const lat = TOKYO_BOUNDS.minLat + (1 - y / 100) * (TOKYO_BOUNDS.maxLat - TOKYO_BOUNDS.minLat);
  return { lat, lng };
}

export const VERIFIED_HANGOUTS: CoffeeShop[] = [
  {
    id: 'kurasu-tokyo',
    name: 'Kurasu Tokyo',
    neighborhood: 'Shibuya',
    address: '5-29-1 Jingumae, Shibuya City, Tokyo',
    lat: 35.6644,
    lng: 139.7058,
    photoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    description: 'Minimalist modern Kyoto-origin roast. Features monoline architecture, clean light wood accents, and precision pour-overs. Perfect for conversational coffee.',
    features: ['Pour-over', 'Single Origin', 'AC', 'Outlets', 'Outdoor Seating'],
    hours: '08:00 - 18:00'
  },
  {
    id: 'fuglen-tokyo',
    name: 'Fuglen Tokyo',
    neighborhood: 'Yoyogi Koen',
    address: '1-16-11 Tomigaya, Shibuya City, Tokyo',
    lat: 35.6698,
    lng: 139.6929,
    photoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    description: 'Mid-century Norwegian design meets Tokyo coffee culture. Warm wood panels, vintage furniture, and a lively outdoor curb-side social scene near the park.',
    features: ['Espresso Bar', 'Vintage Furniture', 'Outdoor Curb', 'Cocktails', 'No Laptop Policy After 18:00'],
    hours: '07:00 - 22:00'
  },
  {
    id: 'sidewalk-stand-nakameguro',
    name: 'Sidewalk Stand',
    neighborhood: 'Nakameguro',
    address: '1-23-14 Aobadai, Meguro City, Tokyo',
    lat: 35.6465,
    lng: 139.6946,
    photoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    description: 'Canalside brick-and-mortar spot with a polished industrial steel look. Known for craft beer, hot sandwiches, and exceptionally smooth espresso right by the Meguro river.',
    features: ['Canalside View', 'Craft Beer', 'Hot Sandwiches', 'Stand Only', 'Dogs Allowed'],
    hours: '09:00 - 21:00'
  },
  {
    id: 'about-life-coffee',
    name: 'About Life Coffee Brewers',
    neighborhood: 'Shibuya',
    address: '1-19-8 Dogenzaka, Shibuya City, Tokyo',
    lat: 35.6575,
    lng: 139.6965,
    photoUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80',
    description: 'Sleek, standing-only boutique espresso bar on a bustling Shibuya corner. Featuring rotating local roasters, matte steel accents, and a distinct Tokyo street-style vibe.',
    features: ['Espresso', 'On-the-go', 'Standing Corner', 'Local Roaster Guest Beans'],
    hours: '08:00 - 17:00'
  },
  {
    id: 'bear-pond-espresso',
    name: 'Bear Pond Espresso',
    neighborhood: 'Shimokitazawa',
    address: '2-36-12 Kitazawa, Setagaya City, Tokyo',
    lat: 35.6627,
    lng: 139.6675,
    photoUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80',
    description: 'Gritty, legendary retro-minimalist espresso haven in Tokyo’s indie/vintage capital. No-nonsense, pure craft, and famous for their "Angel Stain" espresso shots.',
    features: ['Famous Espresso', 'Gritty Retro', 'Indie Vibe', 'No Photo Inside (usually)'],
    hours: '11:00 - 17:00'
  },
  {
    id: 'coffee-supreme-tokyo',
    name: 'Coffee Supreme Tokyo',
    neighborhood: 'Shibuya',
    address: '42-3 Kamiyamacho, Shibuya City, Tokyo',
    lat: 35.6642,
    lng: 139.6925,
    photoUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=600&q=80',
    description: 'Bright and punchy New Zealand coffee brand. Minimalist interior with bold red accents and a gorgeous rooftop terrace for lounging with friends.',
    features: ['Rooftop Terrace', 'NZ Pies', 'Drip Bag Bar', 'AC', 'Outlets'],
    hours: '08:00 - 18:00'
  },
  {
    id: 'sarutahiko-ebisu',
    name: 'Sarutahiko Coffee Ebisu',
    neighborhood: 'Ebisu',
    address: '1-6-6 Ebisu, Shibuya City, Tokyo',
    lat: 35.6475,
    lng: 139.7103,
    photoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    description: 'Charming, small-scale flagship shop where Sarutahiko’s journey began. A welcoming wood-paneled space with outstanding geisha hand drips and incredibly polite baristas.',
    features: ['Ebisu Blend', 'Friendly Staff', 'Hand-Drip Specialist', 'Cozy Seating'],
    hours: '08:00 - 21:00'
  }
];

export interface Persona {
  name: string;
  color: string;
  avatarUrl: string;
}

/**
 * -------------------------------------------------------------
 * HOW TO REPLACE WITH YOUR OWN PEOPLE:
 * 
 * You can replace this array with your own list of persons!
 * If you uploaded photos to a GitHub repository, you can reference them 
 * directly using the raw GitHub URL format:
 * 
 * "https://raw.githubusercontent.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>/<BRANCH>/<PATH_TO_IMAGE>"
 * 
 * Example:
 *   "https://raw.githubusercontent.com/hero-aimovie/yorimichi/main/assets/person1.png"
 * -------------------------------------------------------------
 */
export const COFFEE_PERSONAS: Persona[] = [
  {
    name: 'Hero (Flat White)',
    color: '#D4A373',
    avatarUrl: '/src/assets/images/hero.png'
  },
  {
    name: 'Faustin (Cortado)',
    color: '#C68B59',
    avatarUrl: '/src/assets/images/faustin.webp'
  },
  {
    name: 'Tanapol (Espresso Tonic)',
    color: '#5B4B3E',
    avatarUrl: '/src/assets/images/tanapol.webp'
  },
  {
    name: 'Aish (Matcha Latte)',
    color: '#768959',
    avatarUrl: '/src/assets/images/aish.webp'
  }
];

export function getPersonaAvatar(personaName: string): string {
  const p = COFFEE_PERSONAS.find(x => x.name === personaName || x.name.toLowerCase().includes(personaName.toLowerCase()));
  return p?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
}

export const NEIGHBORHOODS = [
  'Shibuya',
  'Shimokitazawa',
  'Yoyogi Koen',
  'Nakameguro',
  'Ebisu',
  'Harajuku'
];
