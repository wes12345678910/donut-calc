import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization of Gemini AI SDK
let aiInstance: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiInstance = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      } catch (err) {
        console.error("Failed to initialize Gemini AI client:", err);
      }
    }
  }
  return aiInstance;
}

// Hardcoded famous DonutSMP players for high-fidelity fallback
const FAMOUS_PLAYERS: Record<string, any> = {
  drdonut: {
    username: "DrDonut",
    uuid: "f68b446a-77ff-4682-a0e2-632b69cb6e11", // Owner/Admin
    playtime: "1,450 hours",
    kills: 3421,
    deaths: 412,
    kdr: 8.3,
    balance: "$2.4B",
    faction: "Staff",
    rank: "OWNER",
    status: "Online",
    summary: "The creator and head administrator of DonutSMP. Known for setting up custom mechanics and hosting massive server-wide events.",
  },
  bionic: {
    username: "Bionic",
    uuid: "98a1a9a8-e1a5-48b0-8c29-338274ef9e11",
    playtime: "780 hours",
    kills: 4102,
    deaths: 1205,
    kdr: 3.4,
    balance: "$850M",
    faction: "BionicArmy",
    rank: "MEDIA",
    status: "Offline",
    summary: "Popular YouTuber and creator of high-stakes gameplay videos on DonutSMP. Infamous for elaborate base designs and major faction wars.",
  },
  loverfella: {
    username: "LoverFella",
    uuid: "05cb79c6-1d12-4a0b-852a-350e82eb22f2",
    playtime: "520 hours",
    kills: 1450,
    deaths: 982,
    kdr: 1.47,
    balance: "$420M",
    faction: "LoverClan",
    rank: "MEDIA",
    status: "Offline",
    summary: "Content creator known for building massive automated farm empires and testing server limits with creative engineering projects.",
  },
  preston: {
    username: "Preston",
    uuid: "08bc12a0-4ff3-4b67-9cda-621ef9a1e0fb",
    playtime: "410 hours",
    kills: 1890,
    deaths: 1104,
    kdr: 1.71,
    balance: "$310M",
    faction: "FireSquad",
    rank: "MEDIA",
    status: "Offline",
    summary: "Legendary YouTuber known for epic PVP encounters and high-stakes trade deals in the DonutSMP auction house.",
  },
};

// Realistic mock listings for fallback
const MOCK_AUCTIONS = [
  { id: "1", name: "Custom Map Art (Cute Anime Girl)", seller: "VinciArt", price: 45000000, category: "Map Art", timeRemaining: "12h 4m", description: "1x1 highly detailed custom map art. Perfect for base decoration!" },
  { id: "2", name: "Creeper Spawner (Tier 3)", seller: "FarmKing", price: 12500000, category: "Spawners", timeRemaining: "23h 15m", description: "Fully operational Tier 3 Creeper Spawner. Generates tons of gunpowder." },
  { id: "3", name: "Netherite Block (x9)", seller: "MinerPro", price: 9000000, category: "Blocks", timeRemaining: "1h 45m", description: "Freshly mined and compacted Netherite blocks. Perfect for beacon bases." },
  { id: "4", name: "Donut Key (x5)", seller: "LuckyLoot", price: 25000000, category: "Special", timeRemaining: "6h 12m", description: "Premium crate keys for the spawn chests. High chance of rare ranks!" },
  { id: "5", name: "Infinity Chest (Auto-Sell)", seller: "RichPlayer", price: 85000000, category: "Special", timeRemaining: "18h 30m", description: "Legendary item from bonker.gg. Automatically sells any items put inside at 1.1x shop rate." },
  { id: "6", name: "Iron Golem Spawner (x2)", seller: "IronWorks", price: 32000000, category: "Spawners", timeRemaining: "15h 22m", description: "High-yield Iron Golem spawners for building passive iron iron golem farms." },
  { id: "7", name: "Custom Map Art (Minecraft Sunset)", seller: "PixelPainter", price: 15000000, category: "Map Art", timeRemaining: "8h 41m", description: "Beautiful 2x2 map art of a scenic Minecraft valley sunset. Includes 4 maps." },
  { id: "8", name: "Sponge (x64)", seller: "WaterDrainer", price: 3200000, category: "Blocks", timeRemaining: "4h 10m", description: "Useful for clearing out large water zones for ocean monument farms." },
  { id: "9", name: "VIP+ Rank Voucher", seller: "DrDonut", price: 150000000, category: "Special", timeRemaining: "1d 2h", description: "Voucher for VIP+ Rank on the server. Right-click to redeem permanently!" },
  { id: "10", name: "Sharpness VI Netherite Sword", seller: "PvpLegend", price: 55000000, category: "Combat", timeRemaining: "3h 18m", description: "Overpowered custom weapon with Sharpness VI, Mending, and Unbreaking III." },
  { id: "11", name: "Blaze Spawner", seller: "NetherFarmer", price: 8500000, category: "Spawners", timeRemaining: "10h 5m", description: "Blaze spawner for xp and brewing materials." },
  { id: "12", name: "Custom Map Art (Mona Lisa)", seller: "VinciArt", price: 60000000, category: "Map Art", timeRemaining: "14h 50m", description: "A classic masterpiece translated meticulously into Minecraft pixels." }
];

// 1. API: Player Stats lookup with beautiful local procedurally generated data
app.get("/api/donut/player/:username", async (req, res) => {
  const username = req.params.username.trim();
  const lowerName = username.toLowerCase();

  // If they looked up one of our famous presets, serve it immediately for maximum speed
  if (FAMOUS_PLAYERS[lowerName]) {
    return res.json({ success: true, ...FAMOUS_PLAYERS[lowerName] });
  }

  // Generate highly realistic procedural mock data based on the username string hash!
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const posHash = Math.abs(hash);
  const playTimeHrs = (posHash % 400) + 12;
  const kills = (posHash % 850) + 5;
  const deaths = (posHash % 600) + 5;
  const kdr = parseFloat((kills / Math.max(1, deaths)).toFixed(2));
  
  const balances = ["$1.2M", "$8.5M", "$45.2M", "$115K", "$340M", "$18.5M", "$920K"];
  const bal = balances[posHash % balances.length];
  
  const factions = ["Syndicate", "Warlords", "Apex", "DonutEaters", "Glitchers", "Solo", "Shadows"];
  const fac = factions[posHash % factions.length];
  
  const ranks = ["Member", "VIP", "VIP+", "MVP", "Champion", "Sponsor", "Overlord"];
  const rk = ranks[posHash % ranks.length];
  
  const statuses = ["Online", "Offline", "Offline"];
  const st = statuses[posHash % statuses.length];

  return res.json({
    success: true,
    username: username,
    playtime: `${playTimeHrs} hours`,
    kills: kills,
    deaths: deaths,
    kdr: kdr,
    balance: bal,
    faction: fac,
    rank: rk,
    status: st,
    summary: `An active fighter and trader in DonutSMP. Known for expanding automated farms in the outer wilderness and frequently listing high-tier loot on the auction house.`,
  });
});

// 2. API: Auction House listings
app.get("/api/donut/auctions", async (req, res) => {
  const query = req.query.search ? String(req.query.search).toLowerCase() : "";
  const category = req.query.category ? String(req.query.category) : "";

  let listings = [...MOCK_AUCTIONS];

  // Filter listings based on search query and category
  if (query) {
    listings = listings.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.seller.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }

  if (category && category !== "All") {
    listings = listings.filter((item) => item.category === category);
  }

  res.json({ success: true, listings });
});

// 3. API: Offline builder estimate fallback
app.post("/api/donut/ai-estimate", async (req, res) => {
  const { type, details } = req.body;

  let staticAnalysis = "";
  if (type === "mapart") {
    staticAnalysis = `### 🎨 DonutSMP Custom Map Art Analysis
We analyzed your requested map art dimensions of **${details.gridSize || "1x1"}** using **${details.style || "Flat 2D"}** rendering.

#### 1. Material Requirements & Logistics
- **Total Blocks Needed**: ${details.blocksCount || 16384} blocks (${details.stacksCount || 256} stacks).
- **Transport Volume**: ~${details.shulkersCount || 10} Shulker Boxes.
- **Color Palette suggestions**: For optimal color representation on maps, use **Concrete**, **Wool**, and **Terracotta**. If using 3D Staircase mode, use matching steps or slabs of the same colors to create elegant shadows and highlights!

#### 2. Economy & Selling Strategies on DonutSMP
- **Material Cost Estimate**: Approximately **$${((details.blocksCount || 16384) * 50).toLocaleString()}** Donut Dollars (at average shop/AH bulk rates).
- **Recommended Auction Price**: **$${((details.blocksCount || 16384) * 200).toLocaleString()}**.
- **Net Profit Margin**: **~75%** after material and construction labor costs.
- **Target Audience**: Large Factions looking to brand their base, or wealthy collectors at spawn trading centers.

#### 3. Pro-Tips for Map Art Creators
- **Locking Maps**: Always lock your map art using a Glass Pane in a Cartography Table once built! This prevents accidental map overwrites when modifying or dismantling the original art canvas.
- **Safety**: Build your map canvas in the outer wilderness (beyond 15k blocks) and claim the chunks using server claims to prevent griefing during your construction phases.`;
  } else {
    staticAnalysis = `### 🌾 Automated DonutSMP Farm Engineering Blueprint
We analyzed your **${details.farmType || "Sugarcane"}** Farm proposal scaled to **${details.scaleInput || 1} level(s)**.

#### 1. Production Output & Economics
- **Estimated Material Cost**: **$${(details.costEstimate || 500000).toLocaleString()}** (for spawners, pistons, observers, and hopper collection networks).
- **Projected Income**: **$${(details.hourlyIncome || 25000).toLocaleString()} per hour** of active chunk loading.
- **Time to Break Even**: Fully repaid in approximately **${details.roiHours || 20} hours** of continuous server activity.

#### 2. DonutSMP Server Optimization Checklist
- **Hopper Limits**: Remember DonutSMP limits the number of hoppers per chunk! Use **Water Streams** to transport drops to a centralized collection point to minimize hopper usage.
- **Chunk Loading**: Make sure to hang out within 4 chunks of your farm, or invest in an **Auto-Clicker or Alt Account** to keep the chunks loaded while you sleep.
- **Auto-Sell Integration**: Place a bonker.gg Auto-Sell Chest or Infinity Chest at your main collection chest. This sells the drops directly to the server shop at a bonus rate, bypassing auction inventory clutter!`;
  }

  res.json({ success: true, analysis: staticAnalysis });
});

// Integrate Vite as middleware for development, and handle production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
