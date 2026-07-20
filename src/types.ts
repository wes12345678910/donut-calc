export interface PlayerStats {
  username: string;
  uuid?: string;
  playtime: string;
  kills: number;
  deaths: number;
  kdr: number;
  balance: string;
  faction: string;
  rank: string;
  status: "Online" | "Offline" | "Inactive";
  summary: string;
}

export interface AuctionListing {
  id: string;
  name: string;
  seller: string;
  price: number;
  category: string;
  timeRemaining: string;
  description: string;
}

export interface MapArtDetails {
  gridSize: string; // "1x1" | "2x2" | "3x3" etc
  style: "flat" | "staircase" | "carpet";
  customMaterialCost: number; // Cost per stack (64 blocks)
  hourlyLaborRate: number; // Cost per hour of construction
  estimatedHours: number; // Construction hours
  blocksCount: number;
  stacksCount: number;
  shulkersCount: number;
  costEstimate: number;
  laborCost: number;
  totalCost: number;
  suggestedSellPrice: number;
  profitMargin: number;
}

export interface FarmPreset {
  name: string;
  category: "Auto-Farm" | "Spawner" | "Manual";
  description: string;
  baseMaterials: { name: string; quantity: number; costPerUnit: number }[];
  productionRate: string; // e.g. "4,200 sugarcane/hr"
  estimatedHourlyIncome: number; // In Donut Dollars
  buildingDifficulty: "Easy" | "Medium" | "Hard" | "Expert";
  spawnerCount?: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  rank: string; // "OWNER" | "MEDIA" | "VIP+" | "MVP" | "PLAYER" etc
  text: string;
  timestamp: string;
  isUser?: boolean;
}

