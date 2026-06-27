export interface CoffeeShop {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  lat: number; // relative map y coordinate (0 to 100) or genuine coordinate
  lng: number; // relative map x coordinate (0 to 100) or genuine coordinate
  photoUrl: string;
  description: string;
  features: string[];
  hours: string;
}

export interface UserStatus {
  id: string;
  personaName: string; // e.g., "Flat White", "Cortado", "Espresso Tonic", "Matcha Latte", "Cold Brew", "Macchiato"
  personaColor: string; // hex code for styling avatar accent
  activity: 'Coffee' | 'Drink' | 'Walk';
  neighborhood: string;
  locationName: string;
  coffeeShopId?: string; // linked to a curated CoffeeShop
  duration: 30 | 60 | 120; // 30m, 1h, 2h
  createdAt: string; // ISO string
  expiresAt: string; // ISO string
  note?: string;
  clientId: string; // to track who created it
  lat: number;
  lng: number;
}

export interface ChatMessage {
  id: string;
  senderClientId: string;
  senderPersona: string;
  text: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  statusId: string;
  statusOwnerClientId: string;
  statusOwnerPersona: string;
  pingerClientId: string;
  pingerPersona: string;
  locationName: string;
  expiresAt: string;
  messages: ChatMessage[];
}
