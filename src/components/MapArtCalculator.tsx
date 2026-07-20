import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  Paintbrush, 
  Boxes, 
  Coins, 
  Clock, 
  TrendingUp, 
  Upload, 
  Download, 
  FileDown, 
  RotateCcw, 
  HelpCircle, 
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  Compass,
  LayoutGrid,
  FileDown as FileDownIcon,
  Layers,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Move,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Grid,
  Search,
  Check,
  Plus,
  Minus,
  Sliders,
  Settings,
  CheckSquare,
  Square
} from "lucide-react";
import { MapArtDetails } from "../types";
import { PRESET_MAP_ARTS } from "../mapArtPresets";
import SchematicViewer from "./SchematicViewer";

interface MapArtCalculatorProps {
  initialMapArt?: {
    name: string;
    imageSrc: string;
    gridSize: string;
  } | null;
  onClearInitial?: () => void;
}

// Minecraft standard map block palette
interface BlockColor {
  name: string;
  item: string;
  hex: string;
  r: number;
  g: number;
  b: number;
}

const CONCRETE_PALETTE: BlockColor[] = [
  { name: "White Concrete", item: "white_concrete", hex: "#EBEBEB", r: 235, g: 235, b: 235 },
  { name: "Orange Concrete", item: "orange_concrete", hex: "#E06100", r: 224, g: 97, b: 0 },
  { name: "Magenta Concrete", item: "magenta_concrete", hex: "#A9309F", r: 169, g: 48, b: 159 },
  { name: "Light Blue Concrete", item: "light_blue_concrete", hex: "#2489C7", r: 36, g: 137, b: 199 },
  { name: "Yellow Concrete", item: "yellow_concrete", hex: "#F1AF15", r: 241, g: 175, b: 21 },
  { name: "Lime Concrete", item: "lime_concrete", hex: "#5EA918", r: 94, g: 169, b: 24 },
  { name: "Pink Concrete", item: "pink_concrete", hex: "#D97594", r: 217, g: 117, b: 148 },
  { name: "Gray Concrete", item: "gray_concrete", hex: "#3A3F42", r: 58, g: 63, b: 66 },
  { name: "Light Gray Concrete", item: "light_gray_concrete", hex: "#8E8E86", r: 142, g: 142, b: 134 },
  { name: "Cyan Concrete", item: "cyan_concrete", hex: "#157788", r: 21, g: 119, b: 136 },
  { name: "Purple Concrete", item: "purple_concrete", hex: "#7A1F9C", r: 122, g: 31, b: 156 },
  { name: "Blue Concrete", item: "blue_concrete", hex: "#2C2E8F", r: 44, g: 46, b: 143 },
  { name: "Brown Concrete", item: "brown_concrete", hex: "#4E321F", r: 78, g: 50, b: 31 },
  { name: "Green Concrete", item: "green_concrete", hex: "#495B24", r: 73, g: 91, b: 36 },
  { name: "Red Concrete", item: "red_concrete", hex: "#8E1C1C", r: 142, g: 28, b: 28 },
  { name: "Black Concrete", item: "black_concrete", hex: "#080A0F", r: 8, g: 10, b: 15 },
  { name: "Netherite Block", item: "netherite_block", hex: "#2C2B2C", r: 44, g: 43, b: 44 },
  { name: "Gold Block", item: "gold_block", hex: "#F9C623", r: 249, g: 198, b: 35 },
  { name: "Emerald Block", item: "emerald_block", hex: "#1EB155", r: 30, g: 177, b: 85 },
  { name: "Lapis Block", item: "lapis_block", hex: "#163C80", r: 22, g: 60, b: 128 },
];

const CARPET_PALETTE: BlockColor[] = [
  { name: "White Carpet", item: "white_carpet", hex: "#F9FFFE", r: 249, g: 255, b: 254 },
  { name: "Orange Carpet", item: "orange_carpet", hex: "#F9801D", r: 249, g: 128, b: 29 },
  { name: "Magenta Carpet", item: "magenta_carpet", hex: "#C74EBD", r: 199, g: 78, b: 189 },
  { name: "Light Blue Carpet", item: "light_blue_carpet", hex: "#3AB3DA", r: 58, g: 179, b: 218 },
  { name: "Yellow Carpet", item: "yellow_carpet", hex: "#FED83D", r: 254, g: 216, b: 61 },
  { name: "Lime Carpet", item: "lime_carpet", hex: "#80C71F", r: 128, g: 199, b: 31 },
  { name: "Pink Carpet", item: "pink_carpet", hex: "#F38BAA", r: 243, g: 139, b: 170 },
  { name: "Gray Carpet", item: "gray_carpet", hex: "#474F52", r: 71, g: 79, b: 82 },
  { name: "Light Gray Carpet", item: "light_gray_carpet", hex: "#9D9D97", r: 157, g: 157, b: 151 },
  { name: "Cyan Carpet", item: "cyan_carpet", hex: "#169C9C", r: 22, g: 156, b: 156 },
  { name: "Purple Carpet", item: "purple_carpet", hex: "#8932B8", r: 137, g: 50, b: 184 },
  { name: "Blue Carpet", item: "blue_carpet", hex: "#3C44AA", r: 60, g: 68, b: 170 },
  { name: "Brown Carpet", item: "brown_carpet", hex: "#835432", r: 131, g: 84, b: 50 },
  { name: "Green Carpet", item: "green_carpet", hex: "#5E7C16", r: 94, g: 124, b: 22 },
  { name: "Red Carpet", item: "red_carpet", hex: "#B02E26", r: 176, g: 46, b: 38 },
  { name: "Black Carpet", item: "black_carpet", hex: "#1D1D21", r: 29, g: 29, b: 33 },
];

// Minecraft big-endian NBT file writer for structure block files (.nbt)
class NBTWriter {
  private buffer: ArrayBuffer;
  private view: DataView;
  private offset: number;

  constructor(initialCapacity = 1024 * 1024) {
    this.buffer = new ArrayBuffer(initialCapacity);
    this.view = new DataView(this.buffer);
    this.offset = 0;
  }

  private ensureCapacity(needed: number) {
    if (this.offset + needed > this.buffer.byteLength) {
      const newCapacity = Math.max(this.buffer.byteLength * 2, this.offset + needed);
      const newBuffer = new ArrayBuffer(newCapacity);
      new Uint8Array(newBuffer).set(new Uint8Array(this.buffer));
      this.buffer = newBuffer;
      this.view = new DataView(this.buffer);
    }
  }

  writeByte(val: number) {
    this.ensureCapacity(1);
    this.view.setUint8(this.offset, val);
    this.offset += 1;
  }

  writeShort(val: number) {
    this.ensureCapacity(2);
    this.view.setInt16(this.offset, val, false);
    this.offset += 2;
  }

  writeInt(val: number) {
    this.ensureCapacity(4);
    this.view.setInt32(this.offset, val, false);
    this.offset += 4;
  }

  writeString(str: string) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    this.writeShort(bytes.length);
    this.ensureCapacity(bytes.length);
    new Uint8Array(this.buffer).set(bytes, this.offset);
    this.offset += bytes.length;
  }

  writeTagHeader(type: number, name: string | null) {
    this.writeByte(type);
    if (name !== null) {
      this.writeString(name);
    }
  }

  writeTag(type: number, name: string | null, value: any) {
    if (name !== null) {
      this.writeByte(type);
      this.writeString(name);
    }
    this.writeValue(type, value);
  }

  private writeValue(type: number, value: any) {
    switch (type) {
      case 1: // TAG_Byte
        this.writeByte(value);
        break;
      case 2: // TAG_Short
        this.writeShort(value);
        break;
      case 3: // TAG_Int
        this.writeInt(value);
        break;
      case 8: // TAG_String
        this.writeString(value);
        break;
      case 9: // TAG_List
        const { elementType, items } = value;
        this.writeByte(elementType);
        this.writeInt(items.length);
        for (const item of items) {
          this.writeValue(elementType, item);
        }
        break;
      case 10: // TAG_Compound
        for (const [key, prop] of Object.entries(value)) {
          this.writeTag((prop as any).type, key, (prop as any).value);
        }
        this.writeByte(0); // TAG_End
        break;
      default:
        throw new Error("Unsupported type: " + type);
    }
  }

  getUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer, 0, this.offset);
  }
}

export default function MapArtCalculator({ initialMapArt, onClearInitial }: MapArtCalculatorProps) {
  const [gridSize, setGridSize] = useState<string>("1x1");
  const [style, setStyle] = useState<"flat" | "staircase" | "carpet">("flat");
  const [materialBase, setMaterialBase] = useState<"concrete" | "carpet">("concrete");
  const [customMaterialCost, setCustomMaterialCost] = useState<number>(35000); // per stack of 64
  const [hourlyLaborRate, setHourlyLaborRate] = useState<number>(150000); // DonutSMP hourly rate
  const [estimatedHours, setEstimatedHours] = useState<number>(4);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [blockCounts, setBlockCounts] = useState<{ block: BlockColor; count: number }[]>([]);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string>("");
  const [blockGrid, setBlockGrid] = useState<string[]>([]);
  const [downloadingNbt, setDownloadingNbt] = useState<boolean>(false);

  const currentPalette = materialBase === "concrete" ? CONCRETE_PALETTE : CARPET_PALETTE;

  // Customizable Active Palette State (All blocks enabled by default)
  const [activePalette, setActivePalette] = useState<string[]>(CONCRETE_PALETTE.map(p => p.item));

  // Reset active palette when material base changes
  useEffect(() => {
    setActivePalette(currentPalette.map(p => p.item));
  }, [materialBase]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const viewerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Bonker.gg Style Interactive Viewer States
  const [activeViewerTab, setActiveViewerTab] = useState<"viewer" | "inventory" | "schematic">("viewer");
  const [zoom, setZoom] = useState<number>(3.5);
  const [panX, setPanX] = useState<number>(35);
  const [panY, setPanY] = useState<number>(35);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeRow, setActiveRow] = useState<number>(0);
  const [activeCol, setActiveCol] = useState<number>(-1);
  const [hoveredBlock, setHoveredBlock] = useState<{ x: number; z: number; block: BlockColor | null } | null>(null);
  const [highlightedBlockItem, setHighlightedBlockItem] = useState<string | null>(null);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [completedRows, setCompletedRows] = useState<number[]>([]);
  const [builderOrientation, setBuilderOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [materialsSearch, setMaterialsSearch] = useState<string>("");
  const [dimInactiveRows, setDimInactiveRows] = useState<boolean>(false);
  const [completedSegments, setCompletedSegments] = useState<Record<string, boolean>>({});

  // Reset panning and zoom when gridSize changes
  useEffect(() => {
    setZoom(3.5);
    setPanX(35);
    setPanY(35);
    setActiveRow(0);
    setActiveCol(-1);
    setCompletedRows([]);
    setCompletedSegments({});
  }, [gridSize]);

  // Handle keyboard event listeners for row-by-row navigation when viewer canvas has focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing events if the user is typing in input fields
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (builderOrientation === "horizontal") {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          e.preventDefault();
          setActiveRow((prev) => Math.max(0, prev - 1));
        } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          e.preventDefault();
          setActiveRow((prev) => Math.min(127, prev + 1));
        }
      } else {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
          e.preventDefault();
          setActiveCol((prev) => Math.max(0, prev - 1));
        } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
          e.preventDefault();
          setActiveCol((prev) => Math.min(127, prev + 1));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [builderOrientation]);

  // Interactive Viewer Canvas drawing loop
  useEffect(() => {
    const canvas = viewerCanvasRef.current;
    if (!canvas || !imageLoaded || blockGrid.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get current container bounds
    const container = canvas.parentElement;
    const w = container?.clientWidth || 512;
    const h = 480; // Keep fixed height for the workspace
    
    // Set high pixel density or keep standard with devicePixelRatio
    canvas.width = w;
    canvas.height = h;

    // Clear with ultra-polished deep slate space-cadet background
    ctx.fillStyle = "#090611";
    ctx.fillRect(0, 0, w, h);

    // Draw blocks grid
    for (let r = 0; r < 128; r++) {
      const isRowDone = completedRows.includes(r);
      const isInactiveRow = dimInactiveRows && builderOrientation === "horizontal" && activeRow !== r;

      for (let c = 0; c < 128; c++) {
        const idx = r * 128 + c;
        const blockItem = blockGrid[idx];
        if (!blockItem) continue;

        const blockColor = currentPalette.find((p) => p.item === blockItem);
        if (!blockColor) continue;

        let hex = blockColor.hex;

        // Block Isolation and custom styling
        const isIsolated = highlightedBlockItem !== null && blockItem === highlightedBlockItem;
        const hasIsolationActive = highlightedBlockItem !== null;

        if (hasIsolationActive) {
          if (!isIsolated) {
            // Faded/darkened out non-isolated blocks
            hex = "rgba(25, 20, 32, 0.12)";
          }
        } else if (isRowDone) {
          // Dim completed rows with subtle transparent green tint
          hex = "rgba(40, 100, 50, 0.2)";
        } else if (isInactiveRow) {
          // Dim inactive rows
          hex = "rgba(20, 15, 28, 0.22)";
        }

        const x = c * zoom + panX;
        const y = r * zoom + panY;
        const size = zoom;

        // Skip render if out of canvas viewport bounds (Culling)
        if (x + size < 0 || x > w || y + size < 0 || y > h) continue;

        ctx.fillStyle = hex;
        ctx.fillRect(x, y, size, size);

        // Draw grid boundaries
        if (showGridLines && zoom >= 4) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, size, size);
        }

        // Selected cell focus
        if (hoveredBlock && hoveredBlock.x === c && hoveredBlock.z === r) {
          ctx.strokeStyle = "#00d5ff";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, size, size);
        }
      }
    }

    // Draw glowing Active Row indicator strip
    if (builderOrientation === "horizontal" && activeRow >= 0 && activeRow < 128) {
      const rowY = activeRow * zoom + panY;
      const rowHeight = zoom;
      ctx.strokeStyle = "#ff0055";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#ff0055";
      ctx.shadowBlur = 6;
      ctx.strokeRect(panX, rowY, 128 * zoom, rowHeight);
      ctx.shadowBlur = 0; // reset shadow

      // Draw red row anchor tag
      ctx.fillStyle = "#ff0055";
      ctx.fillRect(panX - 45, rowY, 40, Math.max(12, rowHeight));
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 8px monospace";
      ctx.fillText(`ROW ${activeRow}`, panX - 42, rowY + Math.max(9, rowHeight - 2));
    } else if (builderOrientation === "vertical" && activeCol >= 0 && activeCol < 128) {
      const colX = activeCol * zoom + panX;
      const colWidth = zoom;
      ctx.strokeStyle = "#ffb300";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#ffb300";
      ctx.shadowBlur = 6;
      ctx.strokeRect(colX, panY, colWidth, 128 * zoom);
      ctx.shadowBlur = 0; // reset

      // Draw yellow col anchor tag
      ctx.fillStyle = "#ffb300";
      ctx.fillRect(colX, panY - 15, Math.max(35, colWidth), 12);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 8px monospace";
      ctx.fillText(`COL ${activeCol}`, colX + 2, panY - 6);
    }

    // Coordinates Ruler axes
    if (showGridLines) {
      // Horizontal top axis ruler
      ctx.fillStyle = "rgba(9, 6, 17, 0.88)";
      ctx.fillRect(0, 0, w, 16);
      ctx.fillStyle = "#71717a";
      ctx.font = "bold 8px monospace";
      
      for (let c = 0; c < 128; c += 10) {
        const x = c * zoom + panX;
        if (x >= 24 && x <= w) {
          ctx.fillText(c.toString(), x, 12);
          ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
          ctx.fillRect(x, 16, 1, h);
          ctx.fillStyle = "#71717a";
        }
      }

      // Vertical left axis ruler
      ctx.fillStyle = "rgba(9, 6, 17, 0.88)";
      ctx.fillRect(0, 0, 24, h);
      ctx.fillStyle = "#71717a";
      for (let r = 0; r < 128; r += 10) {
        const y = r * zoom + panY;
        if (y >= 16 && y <= h) {
          ctx.fillText(r.toString(), 2, y + 4);
          ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
          ctx.fillRect(24, y, w, 1);
          ctx.fillStyle = "#71717a";
        }
      }
    }
  }, [
    imageLoaded,
    blockGrid,
    zoom,
    panX,
    panY,
    activeRow,
    activeCol,
    hoveredBlock,
    highlightedBlockItem,
    showGridLines,
    completedRows,
    builderOrientation,
    currentPalette,
    dimInactiveRows
  ]);

  // Mouse interaction event handlers for viewer canvas
  const handleViewerMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPanning(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleViewerMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = viewerCanvasRef.current;
    if (!canvas) return;

    if (isPanning) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const col = Math.floor((mouseX - panX) / zoom);
    const row = Math.floor((mouseY - panY) / zoom);

    if (col >= 0 && col < 128 && row >= 0 && row < 128) {
      const idx = row * 128 + col;
      const item = blockGrid[idx];
      if (item) {
        const blockColor = currentPalette.find((p) => p.item === item);
        setHoveredBlock({
          x: col,
          z: row,
          block: blockColor || null
        });
      }
    } else {
      setHoveredBlock(null);
    }
  };

  const handleViewerMouseUp = () => {
    setIsPanning(false);
  };

  const handleViewerClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = viewerCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const col = Math.floor((mouseX - panX) / zoom);
    const row = Math.floor((mouseY - panY) / zoom);

    if (col >= 0 && col < 128 && row >= 0 && row < 128) {
      if (builderOrientation === "horizontal") {
        setActiveRow(row);
      } else {
        setActiveCol(col);
      }
    }
  };

  const handleViewerWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = viewerCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = 1.15;
    let nextZoom = zoom;
    if (e.deltaY < 0) {
      nextZoom = Math.min(zoom * zoomFactor, 40);
    } else {
      nextZoom = Math.max(zoom / zoomFactor, 1.2);
    }

    const nextPanX = mouseX - (mouseX - panX) * (nextZoom / zoom);
    const nextPanY = mouseY - (mouseY - panY) * (nextZoom / zoom);

    setZoom(nextZoom);
    setPanX(nextPanX);
    setPanY(nextPanY);
  };

  // Parse grid dimension
  const getGridMultiplier = () => {
    if (gridSize === "1x1") return 1;
    if (gridSize === "2x2") return 4;
    if (gridSize === "3x3") return 9;
    if (gridSize === "4x4") return 16;
    return 1;
  };

  const getStyleMultiplier = () => {
    if (style === "staircase") return 2.5;
    if (style === "carpet") return 1.2;
    return 1.0;
  };

  const calculateBlocks = () => {
    const singleMapBlocks = 128 * 128; // 16,384
    return Math.round(singleMapBlocks * getGridMultiplier() * getStyleMultiplier());
  };

  const getRowSegments = () => {
    if (blockGrid.length === 0) return [];
    
    interface Segment {
      blockItem: string;
      color: BlockColor;
      count: number;
      startCol: number;
      endCol: number;
    }
    const segments: Segment[] = [];

    if (builderOrientation === "horizontal") {
      const r = activeRow;
      let startCol = 0;
      let currentItem = blockGrid[r * 128];
      let currentCount = 0;

      for (let c = 0; c < 128; c++) {
        const item = blockGrid[r * 128 + c];
        if (item === currentItem) {
          currentCount++;
        } else {
          const color = currentPalette.find((p) => p.item === currentItem);
          if (color) {
            segments.push({
              blockItem: currentItem,
              color,
              count: currentCount,
              startCol,
              endCol: c - 1
            });
          }
          currentItem = item;
          currentCount = 1;
          startCol = c;
        }
      }
      
      // final segment
      const color = currentPalette.find((p) => p.item === currentItem);
      if (color) {
        segments.push({
          blockItem: currentItem,
          color,
          count: currentCount,
          startCol,
          endCol: 127
        });
      }
    } else {
      const c = activeCol >= 0 ? activeCol : 0;
      let startRow = 0;
      let currentItem = blockGrid[c];
      let currentCount = 0;

      for (let r = 0; r < 128; r++) {
        const item = blockGrid[r * 128 + c];
        if (item === currentItem) {
          currentCount++;
        } else {
          const color = currentPalette.find((p) => p.item === currentItem);
          if (color) {
            segments.push({
              blockItem: currentItem,
              color,
              count: currentCount,
              startCol: startRow,
              endCol: r - 1
            });
          }
          currentItem = item;
          currentCount = 1;
          startRow = r;
        }
      }

      // final segment
      const color = currentPalette.find((p) => p.item === currentItem);
      if (color) {
        segments.push({
          blockItem: currentItem,
          color,
          count: currentCount,
          startCol: startRow,
          endCol: 127
        });
      }
    }

    return segments;
  };

  const blocksCount = calculateBlocks();
  const stacksCount = Math.ceil(blocksCount / 64);
  const shulkersCount = parseFloat((stacksCount / 27).toFixed(1));

  // Cost estimates
  const materialCost = stacksCount * customMaterialCost;
  const laborCost = estimatedHours * hourlyLaborRate;
  const totalCost = materialCost + laborCost;

  // Pricing analysis
  const suggestedSellPrice = Math.round(totalCost * 1.35); // 35% margin
  const profitMargin = suggestedSellPrice - totalCost;

  // Handle local user file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImageSrc(event.target.result as string);
          if (onClearInitial) {
            onClearInitial();
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset sample image loader
  const loadSampleImage = () => {
    // Standard Neon Donut Logo Base64 or online secure assets
    setUploadedImageSrc("https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=128&auto=format&fit=crop&q=60");
    if (onClearInitial) {
      onClearInitial();
    }
  };

  const downloadNBT = async () => {
    if (blockGrid.length === 0) return;
    setDownloadingNbt(true);

    try {
      const uniqueBlocks = Array.from(new Set(blockGrid));
      const paletteItems = uniqueBlocks.map(item => ({
        Name: {
          type: 8,
          value: `minecraft:${item}`
        }
      }));

      const blockItems = [];
      for (let i = 0; i < blockGrid.length; i++) {
        const item = blockGrid[i];
        const paletteIndex = uniqueBlocks.indexOf(item);
        const x = i % 128;
        const z = Math.floor(i / 128);
        blockItems.push({
          pos: {
            type: 9,
            value: {
              elementType: 3,
              items: [x, 0, z]
            }
          },
          state: {
            type: 3,
            value: paletteIndex
          }
        });
      }

      // Root compound structure
      const rootCompound: any = {
        DataVersion: {
          type: 3,
          value: 3437 // 1.20+
        },
        size: {
          type: 9,
          value: {
            elementType: 3,
            items: [128, 1, 128]
          }
        },
        palette: {
          type: 9,
          value: {
            elementType: 10,
            items: paletteItems
          }
        },
        blocks: {
          type: 9,
          value: {
            elementType: 10,
            items: blockItems
          }
        },
        entities: {
          type: 9,
          value: {
            elementType: 10,
            items: []
          }
        }
      };

      const writer = new NBTWriter();
      writer.writeByte(10);
      writer.writeString("");
      
      for (const [key, prop] of Object.entries(rootCompound)) {
        writer.writeTag((prop as any).type, key, (prop as any).value);
      }
      writer.writeByte(0);

      const rawBytes = writer.getUint8Array();
      const responseStream = new Response(rawBytes).body?.pipeThrough(new CompressionStream("gzip"));
      if (!responseStream) {
        throw new Error("Gzip compression not supported by browser");
      }
      const blob = await new Response(responseStream).blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donutcalc_map_art.nbt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate NBT schematic:", err);
      alert("Error generating NBT schematic. Please try again.");
    } finally {
      setDownloadingNbt(false);
    }
  };

  // Sync state with initialMapArt props if passed from external tabs (like Auctions)
  useEffect(() => {
    if (initialMapArt) {
      setGridSize(initialMapArt.gridSize);
      setUploadedImageSrc(initialMapArt.imageSrc);
    }
  }, [initialMapArt]);

  // Fully reactive image rendering & color analysis pipeline
  useEffect(() => {
    if (!uploadedImageSrc) {
      setImageLoaded(false);
      setBlockCounts([]);
      setBlockGrid([]);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = uploadedImageSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = 128;
      const height = 128;
      
      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Filter palette to only allowed/active blocks
      const allowedPalette = currentPalette.filter(p => activePalette.includes(p.item));
      const activeSearchPalette = allowedPalette.length > 0 ? allowedPalette : currentPalette; // fallback

      const counts: Record<string, number> = {};
      activeSearchPalette.forEach(p => counts[p.item] = 0);
      const grid: string[] = [];

      // Perform color quantization using ONLY active blocks
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        let minDistance = Infinity;
        let nearestBlock = activeSearchPalette[0];

        for (const p of activeSearchPalette) {
          const dist = Math.sqrt((r - p.r) ** 2 + (g - p.g) ** 2 + (b - p.b) ** 2);
          if (dist < minDistance) {
            minDistance = dist;
            nearestBlock = p;
          }
        }

        data[i] = nearestBlock.r;
        data[i + 1] = nearestBlock.g;
        data[i + 2] = nearestBlock.b;

        counts[nearestBlock.item] = (counts[nearestBlock.item] || 0) + 1;
        grid.push(nearestBlock.item);
      }

      ctx.putImageData(imgData, 0, 0);

      const multiplier = getGridMultiplier();
      const finalCounts = activeSearchPalette.map(p => ({
        block: p,
        count: Math.round((counts[p.item] || 0) * multiplier * getStyleMultiplier())
      })).filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count);

      setBlockCounts(finalCounts);
      setBlockGrid(grid);
      setImageLoaded(true);
    };
  }, [uploadedImageSrc, gridSize, style, activePalette, currentPalette]);

  // Construct 3D voxel grid array for the interactive spectator map art preview
  const mapArt3DBlocks = blockGrid.map((item, idx) => {
    const x = idx % 128;
    const z = Math.floor(idx / 128);
    // staircase style raises height dynamically for beautiful axonometric blueprint display!
    let y = 0;
    if (style === "staircase") {
      y = Math.floor((x + z) / 8) % 3;
    }
    return {
      x,
      y,
      z,
      blockName: item
    };
  }); // Provide full 128x128 plane of blocks for continuous 3D spectator view

  return (
    <div id="map-art-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Parameters Panel */}
      <div id="map-art-params" className="lg:col-span-4 bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex items-center gap-3 border-b-2 border-[#221733] pb-4">
          <Paintbrush className="w-6 h-6 text-[#0055ff] animate-pulse" />
          <h2 className="text-lg font-black text-white tracking-wide uppercase font-pixel">Map Setup</h2>
        </div>

        {initialMapArt && (
          <div className="bg-[#0055ff]/10 border border-[#0055ff]/30 rounded-xl p-3.5 flex items-center justify-between text-xs text-sky-400">
            <span className="truncate font-semibold">
              📍 Synced Auction: <strong className="text-white font-bold">{initialMapArt.name}</strong>
            </span>
            <button
              onClick={onClearInitial}
              className="px-2 py-1 bg-[#0055ff]/20 hover:bg-[#0055ff] hover:text-zinc-950 font-bold rounded-lg font-mono text-[10px] transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}

        {/* Grid Size Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Canvas Dimensions</label>
          <div className="grid grid-cols-4 gap-2">
            {["1x1", "2x2", "3x3", "4x4"].map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size)}
                className={`py-2 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                  gridSize === size
                    ? "bg-[#0055ff]/15 border-[#0055ff] text-sky-400 font-pixel"
                    : "bg-[#07040b]/60 border-[#1a1126] text-zinc-400 hover:border-[#0055ff]/35 hover:text-zinc-200"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-zinc-500 block leading-tight font-semibold">
            {gridSize === "1x1" && "1 Map = 128 x 128 blocks (16,384 total)"}
            {gridSize === "2x2" && "4 Maps = 256 x 256 blocks (65,536 total)"}
            {gridSize === "3x3" && "9 Maps = 384 x 384 blocks (147,456 total)"}
            {gridSize === "4x4" && "16 Maps = 512 x 512 blocks (262,144 total)"}
          </span>
        </div>

        {/* Material Block Type Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Material Base</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMaterialBase("concrete")}
              className={`py-2 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                materialBase === "concrete"
                  ? "bg-[#0055ff]/15 border-[#0055ff] text-sky-400 font-pixel"
                  : "bg-[#07040b]/60 border-[#1a1126] text-zinc-400 hover:border-[#0055ff]/35 hover:text-zinc-200"
              }`}
            >
              🧱 Concrete
            </button>
            <button
              onClick={() => setMaterialBase("carpet")}
              className={`py-2 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                materialBase === "carpet"
                  ? "bg-[#0055ff]/15 border-[#0055ff] text-sky-400 font-pixel"
                  : "bg-[#07040b]/60 border-[#1a1126] text-zinc-400 hover:border-[#0055ff]/35 hover:text-zinc-200"
              }`}
            >
              🧶 Carpets
            </button>
          </div>
          <span className="text-[11px] text-zinc-500 block leading-tight font-semibold">
            {materialBase === "concrete"
              ? "Solid concrete blocks. Perfect for flat or shaded 3D staircase map art."
              : "Lightweight carpets. The cheapest and fastest flat map art option!"}
          </span>
        </div>

        {/* Build Style */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Construction Style</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "flat", name: "Flat 2D", desc: "1x height" },
              { id: "staircase", name: "3D Stair", desc: "Shading" },
              { id: "carpet", name: "Carpet", desc: "Double layer" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setStyle(item.id as any)}
                className={`p-2 text-left rounded-xl border-2 transition-all flex flex-col cursor-pointer ${
                  style === item.id
                    ? "bg-[#ff6b00]/15 border-[#ff6b00] text-[#ff6b00] font-bold"
                    : "bg-[#07040b]/60 border-[#1a1126] text-zinc-400 hover:border-[#ff6b00]/35 hover:text-zinc-200"
                }`}
              >
                <span className="text-xs font-bold">{item.name}</span>
                <span className="text-[9px] opacity-70 font-mono">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Sliders */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
              <span className="text-zinc-400">Bulk Stack Price</span>
              <span className="text-emerald-400 font-mono">
                ${customMaterialCost.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="150000"
              step="5000"
              value={customMaterialCost}
              onChange={(e) => setCustomMaterialCost(Number(e.target.value))}
              className="w-full accent-[#0055ff] cursor-pointer h-1 bg-[#1a1126] rounded-lg appearance-none"
            />
            <span className="text-[9px] text-zinc-500 block font-semibold">Average DonutSMP cost per 64 {materialBase === "concrete" ? "concrete" : "carpet"} block stack</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
              <span className="text-zinc-400">Construction Time</span>
              <span className="text-sky-400 font-mono">{estimatedHours} hrs</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              className="w-full accent-[#0055ff] cursor-pointer h-1 bg-[#1a1126] rounded-lg appearance-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
              <span className="text-zinc-400">Your Labor Rate / Hr</span>
              <span className="text-amber-400 font-mono">
                ${hourlyLaborRate.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="20000"
              max="500000"
              step="10000"
              value={hourlyLaborRate}
              onChange={(e) => setHourlyLaborRate(Number(e.target.value))}
              className="w-full accent-[#0055ff] cursor-pointer h-1 bg-[#1a1126] rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* Allowed block materials selector */}
        <div className="space-y-3 pt-4 border-t border-[#1a1126]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Allowed Palette Blocks</label>
            <div className="flex gap-1">
              <button
                onClick={() => setActivePalette(currentPalette.map(p => p.item))}
                className="text-[8px] font-pixel px-1.5 py-0.5 bg-[#171221] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded cursor-pointer"
              >
                ALL
              </button>
              <button
                onClick={() => setActivePalette(currentPalette.filter(p => !p.item.includes("gold") && !p.item.includes("emerald") && !p.item.includes("lapis") && !p.item.includes("netherite")).map(p => p.item))}
                className="text-[8px] font-pixel px-1.5 py-0.5 bg-[#171221] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded cursor-pointer"
              >
                BUDGET
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1 max-h-[110px] overflow-y-auto pr-1 custom-scrollbar border border-zinc-900 p-2 rounded-xl bg-[#07040b]/60">
            {currentPalette.map(p => {
              const isActive = activePalette.includes(p.item);
              return (
                <button
                  key={p.item}
                  onClick={() => {
                    if (isActive) {
                      setActivePalette(prev => prev.filter(it => it !== p.item));
                    } else {
                      setActivePalette(prev => [...prev, p.item]);
                    }
                  }}
                  className={`p-1 rounded-lg border-2 flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                    isActive 
                      ? "border-[#0055ff] bg-[#0055ff]/10" 
                      : "border-zinc-950 bg-transparent opacity-40 hover:opacity-75"
                  }`}
                  title={p.name}
                >
                  <div className="w-4.5 h-4.5 rounded border border-white/5" style={{ backgroundColor: p.hex }} />
                  <span className="text-[7.5px] font-bold truncate w-full text-zinc-400 leading-none">{p.name.replace(" Concrete", "").replace(" Carpet", "").replace(" Block", "")}</span>
                </button>
              );
            })}
          </div>
          <span className="text-[9px] text-zinc-500 block leading-tight font-semibold">
            Excluded blocks will not be matched for quantization! Recalculates instantly.
          </span>
        </div>
      </div>

      {/* Main Results and Interactive Simulator */}
      <div id="map-art-simulator" className="lg:col-span-8 space-y-8">
        
        {/* Statistics Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-4 flex flex-col justify-between shadow-xl">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide flex items-center gap-1">
              <Boxes className="w-3.5 h-3.5 text-[#0055ff]" /> Blocks Count
            </span>
            <span className="text-xl font-black text-white mt-2 font-mono">
              {blocksCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 mt-1 font-semibold">
              {stacksCount} stacks | {shulkersCount} shulkers
            </span>
          </div>

          <div className="bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-4 flex flex-col justify-between shadow-xl">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" /> Material Cost
            </span>
            <span className="text-xl font-black text-[#ff6b00] mt-2 font-mono">
              ${materialCost.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 mt-1 font-semibold">
              Estimated shop bulk rate
            </span>
          </div>

          <div className="bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-4 flex flex-col justify-between shadow-xl">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0055ff]" /> Labor Estimate
            </span>
            <span className="text-xl font-black text-sky-400 mt-2 font-mono">
              ${laborCost.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 mt-1 font-semibold">
              {estimatedHours} hours active building
            </span>
          </div>

          <div className="bg-[#0e0a16] border-4 border-[#0055ff]/30 rounded-3xl p-4 flex flex-col justify-between shadow-xl bg-gradient-to-br from-[#0e0a16] to-[#0055ff]/5 relative overflow-hidden">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wide flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Sell Target
            </span>
            <span className="text-xl font-black text-amber-400 mt-2 font-mono">
              ${suggestedSellPrice.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 mt-1 font-semibold">
              Profit: +${profitMargin.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Dynamic Bonker.gg-Style Interactive Workspace Panel */}
        <div className="bg-[#0e0a16] border-4 border-[#221733] rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Workspace Hub Tabs Header */}
          <div className="bg-[#07040b] border-b-4 border-[#1a1126] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0055ff]" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-pixel">
                Map Art Viewer Workspace
              </h3>
            </div>

            {imageLoaded && (
              <div className="flex items-center bg-[#0e0a16] p-1 rounded-xl border-2 border-[#221733] gap-1 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setActiveViewerTab("viewer")}
                  className={`px-3 py-1.5 text-[10px] font-pixel font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeViewerTab === "viewer"
                      ? "bg-[#0055ff] text-white shadow-md shadow-[#0055ff]/30"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <Grid className="w-3 h-3" />
                  Grid Viewer
                </button>
                <button
                  onClick={() => setActiveViewerTab("inventory")}
                  className={`px-3 py-1.5 text-[10px] font-pixel font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeViewerTab === "inventory"
                      ? "bg-[#0055ff] text-white shadow-md shadow-[#0055ff]/30"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <Boxes className="w-3 h-3" />
                  Inventory
                </button>
                <button
                  onClick={() => setActiveViewerTab("schematic")}
                  className={`px-3 py-1.5 text-[10px] font-pixel font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeViewerTab === "schematic"
                      ? "bg-[#0055ff] text-white shadow-md shadow-[#0055ff]/30"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <LayoutGrid className="w-3 h-3" />
                  3D View
                </button>
              </div>
            )}
          </div>

          {/* Workspace Core Area */}
          <div className="p-6">
            {!imageLoaded ? (
              /* No Image State: Upload and Preset Hub */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: Upload card */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-pixel">
                      Import Custom Blueprint
                    </span>
                    <div 
                      className="border-4 border-dashed border-[#221733] hover:border-[#0055ff]/50 rounded-2xl p-8 flex flex-col items-center justify-center bg-[#07040b]/40 hover:bg-[#07040b]/80 transition-all cursor-pointer text-center group min-h-[180px]"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-10 h-10 text-[#0055ff] mb-3 group-hover:scale-110 transition-transform animate-pulse" />
                      <p className="text-sm text-zinc-200 font-bold font-pixel">Upload Custom Image</p>
                      <p className="text-[10px] text-zinc-500 mt-1 font-mono">PNG, JPG, or WEBP. Max size 8MB.</p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={loadSampleImage}
                        className="flex-1 py-3 px-4 bg-[#1a1126] hover:bg-[#221733] border-2 border-[#221733] text-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer font-pixel"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Quick Test (Neon Donut)
                      </button>
                    </div>
                  </div>

                  {/* Right: Presets picker */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-pixel">
                      Or Select DonutSMP Preset Map Art
                    </span>
                    <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                      {PRESET_MAP_ARTS.map((preset) => {
                        const isSelected = uploadedImageSrc === preset.imageSrc;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setGridSize(preset.gridSize);
                              setUploadedImageSrc(preset.imageSrc);
                              if (onClearInitial) {
                                onClearInitial();
                              }
                            }}
                            className={`p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#0055ff]/15 border-[#0055ff] text-sky-400"
                                : "bg-[#07040b]/60 border-[#1a1126] text-zinc-400 hover:border-[#0055ff]/25 hover:text-zinc-200"
                            }`}
                          >
                            <img
                              src={preset.imageSrc}
                              alt={preset.name}
                              className="w-10 h-10 rounded object-cover border border-[#1a1126] flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-extrabold truncate leading-tight text-white">{preset.name}</p>
                              <p className="text-[10px] text-zinc-500 font-mono mt-1">
                                {preset.gridSize} map • Built by {preset.author}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-[#07040b] border-2 border-[#1a1126] rounded-2xl p-4 flex items-center gap-4 text-zinc-400 text-xs leading-normal">
                  <HelpCircle className="w-8 h-8 text-[#0055ff] flex-shrink-0" />
                  <p>
                    DonutSMP map art generators read any standard picture file, quantize it using an authentic Minecraft dye block palette (Concrete or Carpets), and generate interactive block-by-block blueprint placement guides matching the legendary <strong>bonker.gg viewer</strong>!
                  </p>
                </div>
              </div>
            ) : (
              /* Image Loaded: Tab Switched Workspaces */
              <div className="space-y-6">
                
                {/* TAB 1: GRID VIEWER (THE MAIN BONKER SPECTATOR & BUILDER) */}
                {activeViewerTab === "viewer" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Column: Interactive Zoomable Canvas Workspace (Col 8) */}
                    <div className="lg:col-span-8 flex flex-col space-y-4">
                      
                      {/* Viewer HUD Controls Bar */}
                      <div className="bg-[#07040b] border-2 border-[#1c122e] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
                        {/* Zoom controls */}
                        <div className="flex items-center gap-1.5 bg-[#0e0a16] p-1 rounded-lg border border-zinc-800">
                          <button
                            onClick={() => {
                              setZoom(prev => Math.min(prev * 1.25, 40));
                            }}
                            className="p-1 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            title="Zoom In"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setZoom(prev => Math.max(prev / 1.25, 1.2));
                            }}
                            className="p-1 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            title="Zoom Out"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setZoom(3.5);
                              setPanX(35);
                              setPanY(35);
                            }}
                            className="px-2 py-0.5 text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded font-mono transition-colors cursor-pointer"
                            title="Reset Viewport"
                          >
                            RESET
                          </button>
                        </div>

                        {/* View Overlays */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowGridLines(!showGridLines)}
                            className={`px-2 py-1 text-[9px] font-bold rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                              showGridLines
                                ? "bg-[#0055ff]/15 border-[#0055ff] text-sky-400"
                                : "bg-[#0e0a16] border-zinc-800 text-zinc-400"
                            }`}
                            title="Toggle Ruler and Coordinates Grid"
                          >
                            <Grid className="w-3.5 h-3.5" />
                            {showGridLines ? "GRID ON" : "GRID OFF"}
                          </button>

                          <button
                            onClick={() => setDimInactiveRows(!dimInactiveRows)}
                            className={`px-2 py-1 text-[9px] font-bold rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                              dimInactiveRows
                                ? "bg-[#ff0055]/15 border-[#ff0055] text-pink-400"
                                : "bg-[#0e0a16] border-zinc-800 text-zinc-400"
                            }`}
                            title="Focus purely on the current row and dim others"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {dimInactiveRows ? "FOCUS ROW" : "SHOW ALL"}
                          </button>

                          <button
                            onClick={() => {
                              setBuilderOrientation(prev => prev === "horizontal" ? "vertical" : "horizontal");
                              setActiveCol(0);
                            }}
                            className="px-2.5 py-1 text-[9px] font-pixel bg-[#141126] hover:bg-[#221733] border-2 border-[#221733] text-zinc-200 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Move className="w-3 h-3 text-[#ff6b00]" />
                            {builderOrientation === "horizontal" ? "ROW MODE" : "COL MODE"}
                          </button>
                        </div>

                        {/* Active Row Navigation input */}
                        <div className="flex items-center gap-1 bg-[#0e0a16] px-2 py-1 rounded-lg border border-zinc-800">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                            {builderOrientation === "horizontal" ? "Row" : "Col"}
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="127"
                            value={builderOrientation === "horizontal" ? activeRow : activeCol >= 0 ? activeCol : 0}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(127, Number(e.target.value)));
                              if (builderOrientation === "horizontal") {
                                setActiveRow(val);
                              } else {
                                setActiveCol(val);
                              }
                            }}
                            className="w-10 bg-black/50 border border-zinc-800 rounded px-1.5 py-0.5 text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-[#0055ff]"
                          />
                        </div>
                      </div>

                      {/* Canvas Container Viewport */}
                      <div className="bg-[#07040b] rounded-2xl border-2 border-[#1c122e] relative overflow-hidden group shadow-inner">
                        
                        <canvas
                          ref={viewerCanvasRef}
                          onMouseDown={handleViewerMouseDown}
                          onMouseMove={handleViewerMouseMove}
                          onMouseUp={handleViewerMouseUp}
                          onMouseLeave={handleViewerMouseUp}
                          onClick={handleViewerClick}
                          onWheel={handleViewerWheel}
                          className="w-full h-[480px] rounded-2xl cursor-grab active:cursor-grabbing shadow-inner block"
                        />

                        {/* Floating HUD info widget (bottom-left) */}
                        <div className="absolute bottom-4 left-4 bg-zinc-950/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-zinc-800/80 max-w-[280px] shadow-2xl space-y-1.5 pointer-events-none">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                            <span className="text-[10px] font-black text-zinc-300 font-pixel uppercase tracking-wide">
                              Spectator Blueprint HUD
                            </span>
                          </div>
                          
                          {hoveredBlock ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3.5 h-3.5 rounded-md border border-white/10 flex-shrink-0" 
                                  style={{ backgroundColor: hoveredBlock.block?.hex || "#000" }} 
                                />
                                <span className="text-xs font-bold text-white truncate max-w-[180px]">
                                  {hoveredBlock.block?.name || "Air"}
                                </span>
                              </div>
                              <div className="text-[9px] text-zinc-400 font-mono flex items-center justify-between gap-4">
                                <span> minecraft:{hoveredBlock.block?.item} </span>
                                <span className="text-sky-400 font-bold">
                                  X: {hoveredBlock.x}, Z: {hoveredBlock.z}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-zinc-500 font-mono leading-tight">
                              Hover over blocks to see exact pixel coordinates & ID
                            </div>
                          )}

                          <div className="text-[8px] text-zinc-600 font-mono border-t border-zinc-900 pt-1.5">
                            Drag: Pan | Scroll: Zoom | Click: Focus Row | W/S: Nav Row
                          </div>
                        </div>

                        {/* Isolated Block Alert Badge */}
                        {highlightedBlockItem && (
                          <div className="absolute top-4 right-4 bg-pink-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-pink-500/30 text-pink-300 flex items-center gap-2 text-[10px] font-pixel animate-pulse shadow-lg">
                            <span>Isolated: {currentPalette.find(p => p.item === highlightedBlockItem)?.name}</span>
                            <button
                              onClick={() => setHighlightedBlockItem(null)}
                              className="text-pink-400 hover:text-white font-mono font-bold pointer-events-auto bg-pink-900/50 hover:bg-pink-900 px-1.5 py-0.5 rounded ml-1 transition-all"
                            >
                              CLEAR
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Row Builders Step controls */}
                      <div className="bg-[#07040b] border-2 border-[#1c122e] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#ff0055]/10 p-2.5 rounded-xl border border-[#ff0055]/30">
                            <Layers className="w-5 h-5 text-[#ff0055]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                              Active Row Navigation
                            </p>
                            <h4 className="text-sm font-black text-white font-mono">
                              Row {activeRow} of 127 ({completedRows.length} checked done)
                            </h4>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => setActiveRow(prev => Math.max(0, prev - 1))}
                            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" /> Prev Row
                          </button>

                          <button
                            onClick={() => {
                              const isDone = completedRows.includes(activeRow);
                              if (isDone) {
                                setCompletedRows(prev => prev.filter(r => r !== activeRow));
                              } else {
                                setCompletedRows(prev => [...prev, activeRow]);
                                // Auto-advance to next row!
                                setActiveRow(prev => Math.min(127, prev + 1));
                              }
                            }}
                            className={`px-4 py-2 text-xs font-pixel rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border-b-4 border-r-4 border-zinc-950 active:border-b-0 active:border-r-0 active:translate-y-1 ${
                              completedRows.includes(activeRow)
                                ? "bg-[#ff0055] hover:bg-pink-600 text-white"
                                : "bg-[#0055ff] hover:bg-[#3377ff] text-white"
                            }`}
                          >
                            <Check className="w-4 h-4" />
                            {completedRows.includes(activeRow) ? "MARKED DONE" : "CHECK ROW DONE"}
                          </button>

                          <button
                            onClick={() => setActiveRow(prev => Math.min(127, prev + 1))}
                            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            Next Row <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Right Column: Active Row Placement List (RLE Segments) & Material Isolator (Col 4) */}
                    <div className="lg:col-span-4 flex flex-col space-y-6">
                      
                      {/* Section: Row placement segments */}
                      <div className="bg-[#07040b] rounded-2xl border-2 border-[#1c122e] p-4 flex flex-col space-y-3">
                        <div className="flex items-center justify-between border-b border-[#1c122e] pb-2">
                          <h4 className="text-xs font-pixel font-bold text-white tracking-wide uppercase flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#ff0055]" />
                            Row {activeRow} Segments
                          </h4>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {getRowSegments().length} steps
                          </span>
                        </div>

                        <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                          {getRowSegments().length === 0 ? (
                            <div className="text-zinc-500 text-center py-6 text-xs">
                              No segments. Scan an image first.
                            </div>
                          ) : (
                            getRowSegments().map((seg, idx) => {
                              const segKey = `${activeRow}-${seg.startCol}-${seg.endCol}`;
                              const isChecked = completedSegments[segKey] || false;
                              return (
                                <div
                                  key={idx}
                                  className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                                    isChecked
                                      ? "bg-[#286432]/10 border-[#286432]/35 opacity-60"
                                      : "bg-[#0e0a16]/60 border-zinc-800/60 hover:border-zinc-700"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <button
                                      onClick={() => {
                                        setCompletedSegments(prev => ({
                                          ...prev,
                                          [segKey]: !isChecked
                                        }));
                                      }}
                                      className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                      {isChecked ? (
                                        <CheckSquare className="w-4 h-4 text-[#286432]" />
                                      ) : (
                                        <Square className="w-4 h-4 text-zinc-700" />
                                      )}
                                    </button>

                                    <div 
                                      className="w-3.5 h-3.5 rounded border border-white/5 flex-shrink-0" 
                                      style={{ backgroundColor: seg.color.hex }}
                                    />
                                    
                                    <div className="min-w-0">
                                      <span className="text-[11px] font-black text-white truncate block">
                                        {seg.color.name.replace(" Concrete", "").replace(" Carpet", "")}
                                      </span>
                                      <span className="text-[8.5px] text-zinc-500 font-mono block">
                                        Columns {seg.startCol} - {seg.endCol}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="text-right flex-shrink-0 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
                                    <span className="text-xs font-black text-[#00ff55] font-mono">
                                      {seg.count}×
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        <span className="text-[8.5px] text-zinc-500 leading-normal block pt-1">
                          Minecraft map art builders place materials in linear rows. Follow column ranges from left (Col 0) to right (Col 127).
                        </span>
                      </div>

                      {/* Section: Material Quick Blocks Isolator */}
                      <div className="bg-[#07040b] rounded-2xl border-2 border-[#1c122e] p-4 flex flex-col space-y-3">
                        <div className="space-y-2 border-b border-[#1c122e] pb-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-pixel font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5 text-[#0055ff]" />
                              Material Isolator
                            </h4>
                            <span className="text-[9px] font-mono text-zinc-500 lowercase">
                              {blockCounts.length} colors
                            </span>
                          </div>

                          <div className="relative">
                            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
                            <input
                              type="text"
                              placeholder="Search blocks..."
                              value={materialsSearch}
                              onChange={(e) => setMaterialsSearch(e.target.value)}
                              className="w-full bg-zinc-950/75 border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-[#0055ff] font-mono placeholder:text-zinc-600"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
                          {blockCounts
                            .filter(item => item.block.name.toLowerCase().includes(materialsSearch.toLowerCase()))
                            .map((item, index) => {
                              const isIsolated = highlightedBlockItem === item.block.item;
                              return (
                                <button
                                  key={index}
                                  onClick={() => {
                                    if (isIsolated) {
                                      setHighlightedBlockItem(null);
                                    } else {
                                      setHighlightedBlockItem(item.block.item);
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                                    isIsolated
                                      ? "bg-[#0055ff]/10 border-[#0055ff]"
                                      : "bg-[#0e0a16]/40 border-zinc-950 hover:bg-zinc-900 hover:border-zinc-800"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div 
                                      className="w-4 h-4 rounded border border-white/10 flex-shrink-0"
                                      style={{ backgroundColor: item.block.hex }}
                                    />
                                    <span className="text-[10px] font-bold text-zinc-200 truncate">
                                      {item.block.name.replace(" Concrete", "").replace(" Carpet", "")}
                                    </span>
                                  </div>
                                  
                                  <div className="text-right flex items-center gap-1.5 flex-shrink-0">
                                    <span className="text-[10px] font-mono text-zinc-500">
                                      {item.count.toLocaleString()}
                                    </span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isIsolated ? "bg-[#00ff55] animate-pulse" : "bg-zinc-800"}`} />
                                  </div>
                                </button>
                              );
                            })}
                        </div>

                        <span className="text-[8px] text-zinc-500 leading-normal text-center block pt-1">
                          Click any block in this list to **isolate it** on the map grid canvas. Perfect for building single colors!
                        </span>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 2: INVENTORY & MATERIALS BREAKDOWN */}
                {activeViewerTab === "inventory" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-pixel font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-amber-500" />
                        Minecraft Blocks Material List
                      </h4>
                      <button
                        onClick={downloadNBT}
                        disabled={downloadingNbt}
                        className="py-1.5 px-3 bg-[#0055ff] hover:bg-[#3377ff] disabled:opacity-50 text-white font-pixel text-[9px] font-black rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        {downloadingNbt ? "BUILDING..." : "NBT SCHEMATIC"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {blockCounts.map((item, index) => {
                        const blockStacks = Math.ceil(item.count / 64);
                        const shulkerFraction = parseFloat((blockStacks / 27).toFixed(2));
                        return (
                          <div 
                            key={index} 
                            onClick={() => {
                              setHighlightedBlockItem(item.block.item);
                              setActiveViewerTab("viewer");
                            }}
                            className="flex items-center justify-between bg-[#07040b] p-3 rounded-xl border-2 border-[#1c122e] hover:border-[#0055ff]/45 cursor-pointer transition-all hover:scale-[1.02]"
                            title="Click to locate on grid view"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div 
                                className="w-8 h-8 rounded-lg border border-white/10 shadow-sm flex-shrink-0"
                                style={{ backgroundColor: item.block.hex }}
                              />
                              <div className="min-w-0">
                                <span className="text-xs font-black text-zinc-100 truncate block">
                                  {item.block.name}
                                </span>
                                <span className="text-[9px] text-zinc-500 font-mono truncate block">
                                  minecraft:{item.block.item}
                                </span>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className="text-xs font-black text-white font-mono block">
                                {item.count.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-zinc-400 font-mono block">
                                {blockStacks} {blockStacks === 1 ? "stack" : "stacks"}
                              </span>
                              {shulkerFraction >= 0.1 && (
                                <span className="text-[8px] text-amber-500 font-mono block">
                                  {shulkerFraction} shulkers
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 3: 3D SPECTATOR SCHEMATIC VIEW */}
                {activeViewerTab === "schematic" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-pixel font-bold text-[#ffb300] uppercase tracking-wider flex items-center gap-2 animate-pulse">
                        <LayoutGrid className="w-4 h-4" />
                        Interactive 3D Flight Camera Spectator Preview
                      </h4>
                      <span className="text-[8px] text-zinc-500 font-mono">
                        RENDERING {mapArt3DBlocks.length} REZ VOXELS (60 FPS FLIGHT MODE)
                      </span>
                    </div>

                    <SchematicViewer
                      blocks={mapArt3DBlocks}
                      width={128}
                      height={4}
                      length={128}
                      title="Minecraft Map Art Voxel Simulator"
                    />

                    <div className="bg-[#07040b] border-2 border-[#1c122e] rounded-2xl p-4 text-xs text-zinc-400 leading-normal flex items-start gap-3">
                      <Sparkles className="w-6 h-6 text-[#ffb300] flex-shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <strong className="text-white">Active Flight Mode Controls:</strong> Use your mouse inside the 3D grid viewport to rotate, pan, and hover over individual blocks. Standard staircase shading offsets are rendered dynamically to preview actual depth maps!
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Utilities (NBT download, Reset image) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-[#1a1126] mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setImageLoaded(false);
                        setBlockCounts([]);
                        setUploadedImageSrc("");
                        if (onClearInitial) {
                          onClearInitial();
                        }
                      }}
                      className="py-2 px-4 bg-[#1a1126] hover:bg-red-950/20 hover:text-red-400 hover:border-red-500/20 border-2 border-[#221733] text-zinc-400 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-pixel"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      UNLOAD MAP ART
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadNBT}
                      disabled={downloadingNbt}
                      className="py-2.5 px-5 bg-[#0055ff] hover:bg-[#3377ff] disabled:opacity-50 text-white font-pixel text-[10px] font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-b-4 border-r-4 border-zinc-950 active:border-b-0 active:border-r-0 active:translate-y-1"
                    >
                      <FileDown className="w-4 h-4" />
                      {downloadingNbt ? "GENERATING SCHEMATIC..." : "DOWNLOAD NBT SCHEMATIC FILE"}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
