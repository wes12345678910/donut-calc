import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sprout, 
  HelpCircle, 
  Sparkles, 
  TrendingUp, 
  Boxes, 
  Hammer, 
  DollarSign, 
  Info,
  Clock,
  ArrowRight,
  Upload,
  FileCode,
  AlertCircle,
  FileCheck,
  CheckCircle,
  Wrench,
  Flame,
  LayoutGrid
} from "lucide-react";
import { FarmPreset } from "../types";
import { NBTReader, parseStructureNBT, SchematicBlock } from "../lib/nbt";
import SchematicViewer from "./SchematicViewer";

const FARM_PRESETS: FarmPreset[] = [
  {
    name: "Sugarcane",
    category: "Auto-Farm",
    description: "Multi-layer automated sugarcane farm using pistons and observers. Crops are automatically swept into water channels on growth.",
    baseMaterials: [
      { name: "Pistons", quantity: 128, costPerUnit: 1500 },
      { name: "Observers", quantity: 128, costPerUnit: 2500 },
      { name: "Redstone Dust", quantity: 256, costPerUnit: 200 },
      { name: "Hoppers", quantity: 24, costPerUnit: 15000 },
      { name: "Water Buckets / Ice Blocks", quantity: 64, costPerUnit: 500 },
      { name: "Building Blocks (Glass/Stone)", quantity: 512, costPerUnit: 100 },
    ],
    productionRate: "3,200 sugarcane/hr",
    estimatedHourlyIncome: 120000, // in Donut Dollars
    buildingDifficulty: "Medium",
  },
  {
    name: "Cactus",
    category: "Auto-Farm",
    description: "Super cheap, highly scalable zero-redstone cactus farm. Fences automatically snap grown cactus items directly into central ice water streams.",
    baseMaterials: [
      { name: "Cactus Green", quantity: 256, costPerUnit: 300 },
      { name: "Sand Blocks", quantity: 256, costPerUnit: 150 },
      { name: "Oak Fences (Slicers)", quantity: 256, costPerUnit: 100 },
      { name: "Packed Ice Blocks", quantity: 64, costPerUnit: 4000 },
      { name: "Hoppers", quantity: 16, costPerUnit: 15000 },
      { name: "Building Blocks", quantity: 1024, costPerUnit: 80 },
    ],
    productionRate: "5,800 cactus/hr",
    estimatedHourlyIncome: 180000,
    buildingDifficulty: "Easy",
  },
  {
    name: "Iron Golem Spawner",
    category: "Spawner",
    description: "Premium spawner farm placing Iron Golem Spawners over lava death grids. Yields high-value iron blocks automatically.",
    baseMaterials: [
      { name: "Iron Golem Spawner", quantity: 4, costPerUnit: 15000000 }, // Expensive
      { name: "Lava Buckets", quantity: 16, costPerUnit: 1000 },
      { name: "Oak Signs (Lava holding)", quantity: 64, costPerUnit: 100 },
      { name: "Hoppers", quantity: 32, costPerUnit: 15000 },
      { name: "Glass block containment", quantity: 256, costPerUnit: 150 },
      { name: "Infinity Sell Chest (Upgrade)", quantity: 1, costPerUnit: 85000000 }
    ],
    productionRate: "1,200 iron blocks/hr",
    estimatedHourlyIncome: 2400000,
    buildingDifficulty: "Hard",
    spawnerCount: 4
  },
  {
    name: "Creeper Spawner",
    category: "Spawner",
    description: "Highly sought-after spawner array for Gunpowder. Essential for craftable Firework Rockets to fuel Elytra flying on DonutSMP.",
    baseMaterials: [
      { name: "Creeper Spawner", quantity: 4, costPerUnit: 12500000 },
      { name: "Water Buckets", quantity: 8, costPerUnit: 500 },
      { name: "Campfires (Kill Grid)", quantity: 16, costPerUnit: 300 },
      { name: "Hoppers", quantity: 12, costPerUnit: 15000 },
      { name: "Building Blocks", quantity: 128, costPerUnit: 100 }
    ],
    productionRate: "1,800 gunpowder/hr",
    estimatedHourlyIncome: 950000,
    buildingDifficulty: "Easy",
    spawnerCount: 4
  },
  {
    name: "Blaze Spawner",
    category: "Spawner",
    description: "Nether Blaze spawner funnel farm. Collects high-value Blaze Rods and provides safe player experience funneling.",
    baseMaterials: [
      { name: "Blaze Spawner", quantity: 2, costPerUnit: 8500000 },
      { name: "Iron Bars (Funneling)", quantity: 64, costPerUnit: 200 },
      { name: "Hoppers", quantity: 8, costPerUnit: 15000 },
      { name: "Stone Slabs", quantity: 128, costPerUnit: 80 }
    ],
    productionRate: "900 rods/hr",
    estimatedHourlyIncome: 450000,
    buildingDifficulty: "Medium",
    spawnerCount: 2
  },
  {
    name: "Melon & Pumpkin",
    category: "Auto-Farm",
    description: "Piston-automated pumpkin and melon farm. Observers scan growth rings, prompting rapid piston destruction.",
    baseMaterials: [
      { name: "Pistons", quantity: 64, costPerUnit: 1500 },
      { name: "Observers", quantity: 64, costPerUnit: 2500 },
      { name: "Melon/Pumpkin Seeds", quantity: 64, costPerUnit: 200 },
      { name: "Water Buckets", quantity: 16, costPerUnit: 500 },
      { name: "Hoppers", quantity: 8, costPerUnit: 15000 },
      { name: "Building Blocks", quantity: 256, costPerUnit: 80 }
    ],
    productionRate: "2,100 drops/hr",
    estimatedHourlyIncome: 80000,
    buildingDifficulty: "Medium"
  }
];

// Procedural schematic block pattern generator for pre-built farms
function generatePresetBlocks(farmName: string): { width: number; height: number; length: number; blocks: SchematicBlock[] } {
  const blocks: SchematicBlock[] = [];
  const lower = farmName.toLowerCase();
  
  if (lower.includes("sugarcane")) {
    const w = 12, h = 4, l = 8;
    for (let x = 0; x < w; x++) {
      for (let z = 0; z < l; z++) {
        // Base structure
        blocks.push({ x, y: 0, z, blockName: "stone" });
        
        if (z === 2 || z === 5) {
          // Water streams
          blocks.push({ x, y: 1, z, blockName: "water" });
        } else if (z === 3 || z === 4) {
          // Sand & sugarcane layers
          blocks.push({ x, y: 1, z, blockName: "sand" });
          blocks.push({ x, y: 2, z, blockName: "sugarcane" });
          blocks.push({ x, y: 3, z, blockName: "sugarcane" });
        } else if (z === 1 || z === 6) {
          // Pistons & Observers
          blocks.push({ x, y: 1, z, blockName: "stone" });
          blocks.push({ x, y: 2, z, blockName: "piston" });
          blocks.push({ x, y: 3, z, blockName: "observer" });
        }
        
        // Glass outer walls
        if (x === 0 || x === w - 1 || z === 0 || z === l - 1) {
          blocks.push({ x, y: 1, z, blockName: "glass" });
          blocks.push({ x, y: 2, z, blockName: "glass" });
          blocks.push({ x, y: 3, z, blockName: "glass" });
        }
      }
    }
    return { width: w, height: h, length: l, blocks };
  }
  
  if (lower.includes("cactus")) {
    const w = 10, h = 5, l = 10;
    for (let x = 0; x < w; x++) {
      for (let z = 0; z < l; z++) {
        // Base outline
        if (x === 0 || x === w - 1 || z === 0 || z === l - 1) {
          blocks.push({ x, y: 0, z, blockName: "glass" });
          blocks.push({ x, y: 1, z, blockName: "glass" });
        } else {
          blocks.push({ x, y: 0, z, blockName: "water" });
        }

        // Sandy cactus grid
        if (x > 0 && x < w - 1 && z > 0 && z < l - 1) {
          if (x % 3 === 0 && z % 3 === 0) {
            blocks.push({ x, y: 1, z, blockName: "sand" });
            blocks.push({ x, y: 2, z, blockName: "cactus" });
            blocks.push({ x, y: 3, z, blockName: "cactus" });
          }
          // floating fences to snap grown cacti
          if ((x + 1) % 3 === 0 && z % 3 === 0) {
            blocks.push({ x, y: 2, z, blockName: "oak_fence" });
          }
        }
      }
    }
    return { width: w, height: h, length: l, blocks };
  }

  if (lower.includes("iron")) {
    const w = 11, h = 7, l = 11;
    // Central lava pit chamber
    for (let x = 0; x < w; x++) {
      for (let z = 0; z < l; z++) {
        if (x === 0 || x === w - 1 || z === 0 || z === l - 1) {
          for (let y = 0; y < 6; y++) {
            blocks.push({ x, y, z, blockName: "glass" });
          }
        } else {
          // Bottom hoppers & water stream
          blocks.push({ x, y: 0, z, blockName: "hopper" });
          if (x > 2 && x < 8 && z > 2 && z < 8) {
            blocks.push({ x, y: 1, z, blockName: "lava" });
          } else {
            blocks.push({ x, y: 1, z, blockName: "water" });
          }
        }
      }
    }
    // High-tier spawners suspended in the middle
    blocks.push({ x: 5, y: 4, z: 5, blockName: "spawner" });
    return { width: w, height: h, length: l, blocks };
  }

  if (lower.includes("creeper")) {
    const w = 9, h = 6, l = 9;
    for (let x = 0; x < w; x++) {
      for (let z = 0; z < l; z++) {
        // stone perimeter
        if (x === 0 || x === w - 1 || z === 0 || z === l - 1) {
          for (let y = 0; y < 5; y++) {
            blocks.push({ x, y, z, blockName: "stone" });
          }
        } else {
          blocks.push({ x, y: 0, z, blockName: "stone" });
        }
      }
    }
    // Campfires and spawners
    blocks.push({ x: 4, y: 1, z: 4, blockName: "campfire" });
    blocks.push({ x: 4, y: 3, z: 4, blockName: "spawner" });
    return { width: w, height: h, length: l, blocks };
  }

  if (lower.includes("blaze")) {
    const w = 9, h = 7, l = 9;
    for (let x = 0; x < w; x++) {
      for (let z = 0; z < l; z++) {
        if (x === 0 || x === w - 1 || z === 0 || z === l - 1) {
          for (let y = 0; y < 6; y++) {
            blocks.push({ x, y, z, blockName: "nether_bricks" });
          }
        }
      }
    }
    blocks.push({ x: 4, y: 3, z: 4, blockName: "spawner" });
    return { width: w, height: h, length: l, blocks };
  }

  // Default: Melon & Pumpkin
  const width = 10, height = 4, length = 10;
  for (let x = 0; x < width; x++) {
    for (let z = 0; z < length; z++) {
      blocks.push({ x, y: 0, z, blockName: "stone" });
      if (z === 2 || z === 7) {
        blocks.push({ x, y: 1, z, blockName: "water" });
      } else if (z === 3 || z === 6) {
        blocks.push({ x, y: 1, z, blockName: "grass" });
        blocks.push({ x, y: 2, z, blockName: "pumpkin" });
      } else if (z === 4 || z === 5) {
        blocks.push({ x, y: 1, z, blockName: "stone" });
        blocks.push({ x, y: 2, z, blockName: "piston" });
        blocks.push({ x, y: 3, z, blockName: "observer" });
      }
    }
  }
  return { width, height, length, blocks };
}

// Map a custom NBT block name to a standard friendly material list & pricing
function compileNBTMaterials(nbtBlocks: SchematicBlock[]): { name: string; quantity: number; costPerUnit: number; totalCost: number }[] {
  const counts: Record<string, number> = {};
  nbtBlocks.forEach(b => {
    const name = b.blockName.replace("minecraft:", "").replace(/_/g, " ");
    counts[name] = (counts[name] || 0) + 1;
  });

  return Object.entries(counts).map(([name, qty]) => {
    // Standard server pricing dictionary
    let cost = 100; // default building block
    const lower = name.toLowerCase();

    if (lower.includes("spawner")) {
      if (lower.includes("iron")) cost = 15000000;
      else if (lower.includes("creeper")) cost = 12500000;
      else if (lower.includes("blaze")) cost = 8500000;
      else cost = 10000000; // general spawner average
    } else if (lower.includes("observer")) {
      cost = 2500;
    } else if (lower.includes("piston")) {
      cost = 1500;
    } else if (lower.includes("hopper")) {
      cost = 15000;
    } else if (lower.includes("redstone")) {
      cost = 200;
    } else if (lower.includes("lava")) {
      cost = 1000;
    } else if (lower.includes("water") || lower.includes("ice")) {
      cost = 500;
    } else if (lower.includes("sand")) {
      cost = 150;
    } else if (lower.includes("glass")) {
      cost = 150;
    } else if (lower.includes("chest") || lower.includes("sell")) {
      cost = 85000000; // sell box
    }

    // Capitalize friendly block names
    const friendlyName = name
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      name: friendlyName,
      quantity: qty,
      costPerUnit: cost,
      totalCost: qty * cost
    };
  }).sort((a, b) => b.totalCost - a.totalCost);
}

export default function FarmCalculator() {
  const [selectedFarm, setSelectedFarm] = useState<FarmPreset>(FARM_PRESETS[0]);
  const [scale, setScale] = useState<number>(2);
  const [hasAutoSellChest, setHasAutoSellChest] = useState<boolean>(false);
  
  // Custom uploaded schematic states
  const [activeTab, setActiveTab] = useState<"presets" | "uploaded">("presets");
  const [uploadedBlocks, setUploadedBlocks] = useState<SchematicBlock[] | null>(null);
  const [uploadedDims, setUploadedDims] = useState<{ width: number; height: number; length: number } | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "text-sky-400 bg-[#0055ff]/10 border-[#0055ff]/20";
      case "Medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Hard": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default: return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  // Perform scale math for presets
  const getScaledMaterials = () => {
    return selectedFarm.baseMaterials.map(m => {
      let q = m.quantity * scale;
      if (m.name.includes("Infinity") || m.name.includes("Auto-Sell")) {
        q = scale >= 5 ? 2 : 1;
      }
      return {
        ...m,
        quantity: q,
        totalCost: q * m.costPerUnit
      };
    });
  };

  // Upload handler for .nbt files
  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    try {
      const unzippedBuffer = await NBTReader.decompress(file);
      const reader = new NBTReader(unzippedBuffer);
      const rootCompound = reader.parse();
      const result = parseStructureNBT(rootCompound);
      
      setUploadedBlocks(result.blocks);
      setUploadedDims({
        width: result.width,
        height: result.height,
        length: result.length
      });
      setUploadedFilename(file.name);
      setActiveTab("uploaded");
    } catch (err: any) {
      console.error("NBT parsing error:", err);
      setUploadError("Invalid or unsupported Minecraft schematic NBT file. Make sure it's a valid structure block .nbt schematic.");
    }
  };

  // Demo file generator (so people can test schematic parsing without real files)
  const loadDemoSchematic = () => {
    // Generate a beautiful, complex procedural farm model (e.g. automatic cactus-redstone machine)
    const blocks: SchematicBlock[] = [];
    const w = 12, h = 6, l = 12;
    for (let x = 0; x < w; x++) {
      for (let z = 0; z < l; z++) {
        // floor
        blocks.push({ x, y: 0, z, blockName: "stone" });
        if (x === 0 || x === w - 1 || z === 0 || z === l - 1) {
          blocks.push({ x, y: 1, z, blockName: "glass" });
          blocks.push({ x, y: 2, z, blockName: "glass" });
          blocks.push({ x, y: 3, z, blockName: "glass" });
        } else {
          // hopper rows
          if (x === 2) {
            blocks.push({ x, y: 0, z, blockName: "hopper" });
          } else if (z === 5) {
            blocks.push({ x, y: 1, z, blockName: "water" });
          }
        }

        // piston + sugarcane layers
        if (x > 1 && x < w - 2 && z > 1 && z < l - 2) {
          if (x % 3 === 0) {
            blocks.push({ x, y: 1, z, blockName: "sand" });
            blocks.push({ x, y: 2, z, blockName: "sugarcane" });
            blocks.push({ x, y: 3, z, blockName: "sugarcane" });
            
            blocks.push({ x: x - 1, y: 2, z, blockName: "piston" });
            blocks.push({ x: x - 1, y: 3, z, blockName: "observer" });
          }
        }
      }
    }

    setUploadedBlocks(blocks);
    setUploadedDims({ width: w, height: h, length: l });
    setUploadedFilename("donut_mega_sugarcane.nbt");
    setActiveTab("uploaded");
    setUploadError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Cost and ROI calculations
  let finalMaterials = [];
  let totalBuildingCost = 0;
  let hourlyIncome = 0;
  let roiHours = 0;

  if (activeTab === "presets") {
    finalMaterials = getScaledMaterials();
    totalBuildingCost = finalMaterials.reduce((sum, item) => sum + item.totalCost, 0) + (hasAutoSellChest ? 85000000 : 0);
    hourlyIncome = Math.round(selectedFarm.estimatedHourlyIncome * scale * (hasAutoSellChest ? 1.25 : 1));
    roiHours = parseFloat((totalBuildingCost / Math.max(1, hourlyIncome)).toFixed(1));
  } else {
    // Custom uploaded file cost mapping
    const rawMaterials = uploadedBlocks ? compileNBTMaterials(uploadedBlocks) : [];
    finalMaterials = rawMaterials;
    totalBuildingCost = finalMaterials.reduce((sum, item) => sum + item.totalCost, 0);
    // Auto-detect revenue if spawners exist
    let spawnerQty = 0;
    rawMaterials.forEach(m => {
      if (m.name.toLowerCase().includes("spawner")) {
        spawnerQty += m.quantity;
      }
    });
    // Multi-million spawner income calculation
    hourlyIncome = spawnerQty > 0 ? spawnerQty * 600000 : 120000; 
    roiHours = parseFloat((totalBuildingCost / Math.max(1, hourlyIncome)).toFixed(1));
  }

  // Get active 3D blocks for viewer
  const activePresetBlocks = generatePresetBlocks(selectedFarm.name);
  const viewerBlocks = activeTab === "presets" 
    ? activePresetBlocks.blocks 
    : (uploadedBlocks || []);
  const viewerDims = activeTab === "presets"
    ? activePresetBlocks
    : (uploadedDims || { width: 10, height: 5, length: 10 });

  return (
    <div id="farm-calculator" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar: Presets & NBT Upload Form */}
      <div id="farm-sidebar" className="lg:col-span-4 space-y-4">
        
        {/* Navigation Tabs */}
        <div className="bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-1.5 flex gap-1.5 shadow-md">
          <button
            onClick={() => setActiveTab("presets")}
            className={`flex-1 py-3 text-[9px] font-pixel rounded-2xl border transition-all cursor-pointer ${
              activeTab === "presets"
                ? "bg-[#0055ff] border-zinc-950 text-white shadow-inner font-black"
                : "bg-transparent border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            FARM PRESETS
          </button>
          <button
            onClick={() => setActiveTab("uploaded")}
            className={`flex-1 py-3 text-[9px] font-pixel rounded-2xl border transition-all cursor-pointer ${
              activeTab === "uploaded"
                ? "bg-[#0055ff] border-zinc-950 text-white shadow-inner font-black"
                : "bg-transparent border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            NBT SCHEMATIC
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "presets" ? (
            <motion.div
              key="presets-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-5 shadow-2xl">
                <div className="flex items-center gap-3 border-b-2 border-[#221733] pb-4 mb-4">
                  <Sprout className="w-6 h-6 text-[#0055ff]" />
                  <h2 className="text-base font-black text-white font-pixel uppercase tracking-wide">Select Farm</h2>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                  {FARM_PRESETS.map((farm) => (
                    <button
                      key={farm.name}
                      onClick={() => setSelectedFarm(farm)}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex flex-col gap-1.5 cursor-pointer ${
                        selectedFarm.name === farm.name
                          ? "bg-[#0055ff]/15 border-[#0055ff] text-white"
                          : "bg-[#07040b]/60 border-[#1a1126] hover:border-[#0055ff]/20 text-zinc-300 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-extrabold font-mono tracking-wide px-2 py-0.5 bg-[#07040b] rounded border border-[#1a1126] text-zinc-400">
                          {farm.category}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getDifficultyColor(farm.buildingDifficulty)}`}>
                          {farm.buildingDifficulty}
                        </span>
                      </div>
                      <h3 className="text-xs font-black tracking-wide mt-1 uppercase font-pixel leading-tight">{farm.name}</h3>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-semibold">{farm.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Scaling Controls */}
              <div className="bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-5 shadow-2xl space-y-4">
                <h3 className="text-xs font-black text-white font-pixel uppercase tracking-wide">Scaling & Upgrades</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
                    <span className="text-zinc-400">
                      {selectedFarm.category === "Spawner" ? "Spawner Scale" : "Layers / Size Scale"}
                    </span>
                    <span className="text-[#0055ff] font-mono font-bold">x{scale}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    step="1"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full accent-[#0055ff] cursor-pointer h-1 bg-[#1a1126] rounded-lg appearance-none"
                  />
                  <span className="text-[9px] text-zinc-500 block leading-tight font-semibold">
                    Multiplies building materials and estimated drop production rates accordingly.
                  </span>
                </div>

                <div className="border-t border-[#1a1126] pt-4">
                  <label className="flex items-center justify-between bg-[#07040b]/60 p-3 rounded-2xl border-2 border-[#1a1126] hover:border-[#0055ff]/25 cursor-pointer transition-all">
                    <div className="flex flex-col gap-0.5 pr-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-[#ff6b00]" />
                        Auto-Sell Chest
                      </span>
                      <span className="text-[9px] text-zinc-500 font-semibold">Adds bonker.gg Sell Box (+25% yield)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasAutoSellChest}
                      onChange={(e) => setHasAutoSellChest(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0055ff] focus:ring-[#0055ff] bg-[#07040b] border-[#1a1126] cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="uploaded-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* File Drag Box */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`bg-[#0e0a16] border-4 border-dashed rounded-3xl p-6 shadow-2xl transition-all text-center flex flex-col items-center justify-center min-h-[220px] ${
                  isDraggingFile 
                    ? "border-[#0055ff] bg-[#0055ff]/10" 
                    : "border-[#221733] hover:border-[#0055ff]/40 bg-transparent"
                }`}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  accept=".nbt,.schematic"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleFileUpload(files[0]);
                    }
                  }}
                  className="hidden"
                />

                <Upload className={`w-10 h-10 mb-3 transition-transform duration-300 ${isDraggingFile ? "scale-125 text-[#0055ff]" : "text-zinc-500"}`} />
                
                <h3 className="text-xs font-black text-white font-pixel uppercase tracking-wide mb-1.5">
                  Upload Farm Schematic
                </h3>
                <p className="text-[10px] text-zinc-400 font-semibold max-w-[200px] leading-relaxed mb-4">
                  Drag and drop your <code className="text-[#0055ff]">.nbt</code> structure file here or click to browse.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-1.5 px-3.5 bg-[#1a1126] hover:bg-[#2c1a42] text-white border border-zinc-800 text-[9px] font-pixel rounded-xl transition-all cursor-pointer"
                  >
                    SELECT FILE
                  </button>
                  <button
                    onClick={loadDemoSchematic}
                    className="py-1.5 px-3.5 bg-[#0055ff] hover:bg-[#3377ff] text-white text-[9px] font-pixel rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 animate-spin" />
                    LOAD DEMO
                  </button>
                </div>
              </div>

              {/* Status or Details box */}
              {uploadedFilename && (
                <div className="bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-5 shadow-2xl space-y-3">
                  <div className="flex items-center gap-2.5 border-b border-[#221733] pb-3">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block leading-none">ACTIVE SCHEMATIC</span>
                      <span className="text-xs font-pixel text-white uppercase truncate max-w-[180px] block mt-0.5">{uploadedFilename}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                    <div className="bg-[#07040b] p-2 rounded-xl border border-zinc-900">
                      <span className="text-zinc-500 block text-[9px] uppercase">WIDTH</span>
                      <span className="text-[#0055ff]">{uploadedDims?.width}</span>
                    </div>
                    <div className="bg-[#07040b] p-2 rounded-xl border border-zinc-900">
                      <span className="text-zinc-500 block text-[9px] uppercase">HEIGHT</span>
                      <span className="text-[#0055ff]">{uploadedDims?.height}</span>
                    </div>
                    <div className="bg-[#07040b] p-2 rounded-xl border border-zinc-900">
                      <span className="text-zinc-500 block text-[9px] uppercase">LENGTH</span>
                      <span className="text-[#0055ff]">{uploadedDims?.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-2xl flex items-start gap-2 text-[10px] font-semibold leading-relaxed">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Results Board & 3D Interactive Spectator Preview */}
      <div id="farm-results" className="lg:col-span-8 space-y-6">
        
        {/* Cost & ROI Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-5 flex flex-col justify-between shadow-xl">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
              <Hammer className="w-3.5 h-3.5 text-blue-500" /> Total Cost
            </span>
            <div className="mt-4">
              <span className="text-2xl font-black text-white font-mono">$</span>
              <span className="text-2xl font-black text-white font-mono">{totalBuildingCost.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-2 block font-semibold">
              Cost of all building blocks and spawners
            </span>
          </div>

          <div className="bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-5 flex flex-col justify-between shadow-xl">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#0055ff]" /> Earnings
            </span>
            <div className="mt-4">
              <span className="text-2xl font-black text-[#0055ff] font-mono">$</span>
              <span className="text-2xl font-black text-[#0055ff] font-mono">{hourlyIncome.toLocaleString()}</span>
              <span className="text-xs text-zinc-400 font-semibold font-sans">/hr</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-2 block font-semibold">
              Estimated passive income at standard /shop rates
            </span>
          </div>

          <div className="bg-[#0e0a16] border-4 border-[#0055ff]/30 rounded-3xl p-5 flex flex-col justify-between shadow-xl bg-gradient-to-b from-[#0e0a16] to-[#0055ff]/5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Break Even
            </span>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">{roiHours}</span>
              <span className="text-xs text-zinc-300 font-bold font-sans">hours farming</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-2 block font-semibold">
              Active hours to fully break even
            </span>
          </div>
        </div>

        {/* Dynamic Voxel Schematic Preview Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-pixel flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-[#0055ff]" />
              3D SPECTATOR SCHEMATIC PREVIEW
            </h3>
            <span className="text-[8px] font-pixel text-zinc-500">
              {activeTab === "presets" ? `PRESET: ${selectedFarm.name.toUpperCase()}` : `FILE: ${uploadedFilename?.toUpperCase()}`}
            </span>
          </div>
          
          <SchematicViewer
            blocks={viewerBlocks}
            width={viewerDims.width}
            height={viewerDims.height}
            length={viewerDims.length}
            title={activeTab === "presets" ? `${selectedFarm.name} Layout` : uploadedFilename || "NBT Schematic"}
          />
        </div>

        {/* Shopping List Table */}
        <div className="bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-wide font-pixel">
              <Boxes className="w-5 h-5 text-amber-500" />
              Blueprint Materials
            </h3>
            {activeTab === "presets" ? (
              <span className="text-[10px] text-zinc-400 font-mono px-2.5 py-1 bg-[#07040b] rounded-lg border border-[#1a1126] font-bold">
                x{scale} SIZE
              </span>
            ) : (
              <span className="text-[9px] text-[#0055ff] bg-[#0055ff]/10 border border-[#0055ff]/20 px-2.5 py-1 rounded-lg font-pixel font-bold">
                NBT ANALYSIS
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-[#221733] text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Material Block</th>
                  <th className="pb-3 font-semibold text-right">Qty (Stacks)</th>
                  <th className="pb-3 font-semibold text-right">Unit Cost</th>
                  <th className="pb-3 font-semibold text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1126]">
                {finalMaterials.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#07040b]/30 transition-all">
                    <td className="py-3 text-zinc-300 font-bold text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                      {item.name}
                    </td>
                    <td className="py-3 text-right text-white font-mono text-xs">
                      {item.quantity.toLocaleString()} 
                      <span className="text-zinc-500 text-[10px] ml-1 font-bold">
                        ({Math.ceil(item.quantity / 64)} stacks)
                      </span>
                    </td>
                    <td className="py-3 text-right text-zinc-400 font-mono text-xs">${item.costPerUnit.toLocaleString()}</td>
                    <td className="py-3 text-right text-[#0055ff] font-mono font-bold text-xs">${item.totalCost.toLocaleString()}</td>
                  </tr>
                ))}
                {activeTab === "presets" && hasAutoSellChest && (
                  <tr className="bg-[#ff6b00]/5 text-[#ff6b00]">
                    <td className="py-3 font-black text-xs">★ bonker.gg Auto-Sell Chest</td>
                    <td className="py-3 text-right font-mono font-semibold text-xs">1 unit</td>
                    <td className="py-3 text-right font-mono text-xs">$85,000,000</td>
                    <td className="py-3 text-right font-mono font-black text-xs">$85,000,000</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between p-4 bg-[#07040b]/60 rounded-2xl border-2 border-[#1a1126] gap-4">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 text-center sm:text-left font-semibold">
              <Info className="w-4 h-4 text-[#0055ff] flex-shrink-0" />
              Shopping list scales dynamically. Spawners are obtainable through /shop or player auction house.
            </span>
            <span className="text-[9px] font-bold text-[#0055ff] bg-[#0055ff]/10 border-2 border-[#0055ff]/20 px-3 py-1.5 rounded-lg font-pixel animate-pulse">
              DonutSMP APPROVED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
