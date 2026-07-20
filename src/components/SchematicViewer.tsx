import React, { useState, useEffect, useRef } from "react";
import { SchematicBlock } from "../lib/nbt";
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  Pause,
  Compass,
  Sparkles
} from "lucide-react";

interface SchematicViewerProps {
  blocks: SchematicBlock[];
  width: number;
  height: number;
  length: number;
  title?: string;
  onClose?: () => void;
}

export default function SchematicViewer({
  blocks,
  width,
  height,
  length,
  title = "Schematic Blueprint",
  onClose
}: SchematicViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Orbital Camera state
  const [cam, setCam] = useState({
    yaw: 0.78,     // 45 degrees angle on load to look beautiful
    pitch: 0.45,   // angled slightly down to show depth
    zoom: 30       // comfortable zoom level
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 600, height: 520 });

  const dragStart = useRef({ x: 0, y: 0, yaw: 0, pitch: 0 });

  // Reset camera to default orbital showcase position
  const resetCamera = () => {
    setCam({
      yaw: 0.78,
      pitch: 0.45,
      zoom: 30
    });
  };

  useEffect(() => {
    resetCamera();
  }, [blocks, width, height, length]);

  // Handle window and container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    const t = setTimeout(handleResize, 150);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(t);
    };
  }, [isFullscreen]);

  // Native wheel handler to zoom smoothly and prevent document scroll chaining
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCam(prev => ({
        ...prev,
        zoom: Math.max(5, Math.min(95, prev.zoom - e.deltaY * 0.05))
      }));
    };

    canvas.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleNativeWheel);
    };
  }, []);

  // Drag interaction events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: cam.yaw,
      pitch: cam.pitch
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    setCam(prev => ({
      ...prev,
      yaw: dragStart.current.yaw - deltaX * 0.006, // minus to make dragging grab and rotate model intuitively
      pitch: Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, dragStart.current.pitch + deltaY * 0.006))
    }));
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Slow automated orbital rotation loop when user is idle
  useEffect(() => {
    if (!autoRotate || isDragging) return;

    let animId: number;
    const rotate = () => {
      setCam(prev => ({
        ...prev,
        yaw: prev.yaw + 0.0025 // slow gentle orbit
      }));
      animId = requestAnimationFrame(rotate);
    };

    animId = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate, isDragging]);

  // Convert block materials into exact hex palette matches
  const getBlockColorHex = (name: string): string => {
    const lower = name.toLowerCase();
    
    // Concrete color palette
    if (lower.includes("white")) return "#EBEBEB";
    if (lower.includes("orange")) return "#E06100";
    if (lower.includes("magenta")) return "#A9309F";
    if (lower.includes("light_blue") || lower.includes("light blue")) return "#2489C7";
    if (lower.includes("yellow")) return "#F1AF15";
    if (lower.includes("lime")) return "#5EA918";
    if (lower.includes("pink")) return "#D97594";
    if (lower.includes("gray") && !lower.includes("light")) return "#3A3F42";
    if (lower.includes("light_gray") || lower.includes("light gray")) return "#8E8E86";
    if (lower.includes("cyan")) return "#157788";
    if (lower.includes("purple")) return "#7A1F9C";
    if (lower.includes("blue")) return "#2C2E8F";
    if (lower.includes("brown")) return "#4E321F";
    if (lower.includes("green")) return "#495B24";
    if (lower.includes("red")) return "#8E1C1C";
    if (lower.includes("black")) return "#080A0F";

    // Rare & Decorative structures
    if (lower.includes("gold")) return "#F9C623";
    if (lower.includes("emerald")) return "#1EB155";
    if (lower.includes("lapis")) return "#163C80";
    if (lower.includes("netherite")) return "#2C2B2C";
    if (lower.includes("slime")) return "#7AC656";
    if (lower.includes("honey")) return "#F7B500";
    if (lower.includes("glass")) return "#FFFFFF";

    // Farm & Natural materials
    if (lower.includes("grass")) return "#5EA918";
    if (lower.includes("dirt")) return "#866043";
    if (lower.includes("stone")) return "#7A7A7A";
    if (lower.includes("water")) return "#3F76E4";
    if (lower.includes("sand")) return "#DBD3A0";
    if (lower.includes("sugarcane")) return "#78C33A";
    if (lower.includes("piston")) return "#777777";
    if (lower.includes("observer")) return "#4C4C4C";
    if (lower.includes("cactus")) return "#557F3B";
    if (lower.includes("oak_fence") || lower.includes("fence")) return "#A0764C";
    if (lower.includes("hopper")) return "#3C3C3C";
    if (lower.includes("lava")) return "#D85812";
    if (lower.includes("spawner")) return "#1A222A";
    if (lower.includes("campfire")) return "#5C4A3C";
    if (lower.includes("nether_bricks") || lower.includes("nether_brick")) return "#2C161A";
    if (lower.includes("pumpkin")) return "#E38A1D";
    if (lower.includes("obsidian")) return "#100C1A";
    if (lower.includes("chest") || lower.includes("sell")) return "#82542A";

    return "#7A7A7A"; // Default Stone Gray
  };

  const adjustColor = (hex: string, percent: number): string => {
    if (!hex || !hex.startsWith("#")) return hex;
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = ((num >> 8) & 0x00FF) + amt;
    let B = (num & 0x0000FF) + amt;
    
    R = Math.max(0, Math.min(255, R));
    G = Math.max(0, Math.min(255, G));
    B = Math.max(0, Math.min(255, B));
    
    return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
  };

  // High performance perspective rendering engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = dimensions.width;
    const h = dimensions.height;
    canvas.width = w;
    canvas.height = h;

    // Trig lookups for camera angles
    const cosY = Math.cos(cam.yaw);
    const sinY = Math.sin(cam.yaw);
    const cosP = Math.cos(cam.pitch);
    const sinP = Math.sin(cam.pitch);
    const fov = 350; // Focal scale

    // Draw full starry 3D infinite skybox void background
    const skyGrad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, Math.max(w, h));
    skyGrad.addColorStop(0, "#08060d");
    skyGrad.addColorStop(1, "#020104");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Orbital camera center point calculations (anchor to exact layout center)
    const centerX = width / 2;
    const centerY = height / 3;
    const centerZ = length / 2;

    const modelSize = Math.max(width, length, 8);
    // Comfortably frame model size based on current zoom setting
    const distance = modelSize * 1.6 + (100 - cam.zoom) * 0.45;

    // Perspective point projection helper (translates and rotates coordinates around model center)
    const project = (px: number, py: number, pz: number) => {
      // 1. Center coordinates relative to model middle point
      const tx = px - centerX;
      const ty = py - centerY;
      const tz = pz - centerZ;

      // 2. Rotate around Y-axis (Yaw)
      const rx = tx * cosY - tz * sinY;
      const rz1 = tx * sinY + tz * cosY;

      // 3. Rotate around X-axis (Pitch)
      const ry = ty * cosP - rz1 * sinP;
      const rz = ty * sinP + rz1 * cosP;

      // 4. Translate backward along Z view axis by camera distance
      const rzFinal = rz + distance;

      if (rzFinal <= 1.0) return null; // Clip near plane to prevent infinite scale / divide-by-zero

      const scale = (fov / rzFinal);
      return {
        x: rx * scale + w / 2,
        y: ry * scale + h / 2,
        z: rzFinal
      };
    };

    // Render stars rotating on coordinate sphere with orbital camera angles
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    const starCount = 55;
    for (let i = 0; i < starCount; i++) {
      const theta = (i * 187.3) % (Math.PI * 2);
      const phi = ((i * 93.1) % Math.PI) - Math.PI / 2;

      const sx = Math.sin(theta) * Math.cos(phi);
      const sy = Math.sin(phi);
      const sz = Math.cos(theta) * Math.cos(phi);

      const rx = sx * cosY - sz * sinY;
      const rz1 = sx * sinY + sz * cosY;
      const ry = sy * cosP - rz1 * sinP;
      const rz = sy * sinP + rz1 * cosP;

      if (rz > 0.1) {
        const starX = (rx / rz) * 450 + w / 2;
        const starY = (ry / rz) * 450 + h / 2;
        if (starX >= 0 && starX <= w && starY >= 0 && starY <= h) {
          ctx.fillRect(starX, starY, 1.2, 1.2);
        }
      }
    }

    // Render ground grid lines centered under the structure base
    ctx.strokeStyle = "rgba(40, 20, 80, 0.22)";
    ctx.lineWidth = 1;
    const halfGrid = Math.max(width, length, 12) * 1.5;
    const gridStep = 4;
    for (let g = -halfGrid; g <= halfGrid; g += gridStep) {
      // Parallel to Z-axis
      const p1 = project(centerX + g, 0, centerZ - halfGrid);
      const p2 = project(centerX + g, 0, centerZ + halfGrid);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Parallel to X-axis
      const p3 = project(centerX - halfGrid, 0, centerZ + g);
      const p4 = project(centerX + halfGrid, 0, centerZ + g);
      if (p3 && p4) {
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
      }
    }

    // Fast O(1) block occupancy lookup for ambient occlusion & hidden face removal
    const blockMap = new Map<string, number>();
    blocks.forEach(b => {
      blockMap.set(`${b.x},${b.z}`, b.y);
    });

    // Prune blocks behind camera and project coordinates
    const renderedList: any[] = [];
    blocks.forEach(b => {
      const tx = b.x - centerX;
      const ty = b.y - centerY;
      const tz = b.z - centerZ;

      const rx = tx * cosY - tz * sinY;
      const rz1 = tx * sinY + tz * cosY;
      const ry = ty * cosP - rz1 * sinP;
      const rz = ty * sinP + rz1 * cosP;

      const rzFinal = rz + distance;

      if (rzFinal <= 1.0) return; // clip behind camera

      const scale = (fov / rzFinal);
      const screenX = rx * scale + w / 2;
      const screenY = ry * scale + h / 2;

      // Screen border culling margin
      const margin = scale * 1.8;
      if (screenX < -margin || screenX > w + margin || screenY < -margin || screenY > h + margin) {
        return;
      }

      renderedList.push({
        b,
        depth: rzFinal,
        screenX,
        screenY
      });
    });

    // Sort: Painter's algorithm (Farthest blocks first) to render voxel transparency and occlusion perfectly
    renderedList.sort((a, b) => b.depth - a.depth);

    // Vector procedural pixel-art block face painter
    const drawFace = (
      faceType: string,
      blockName: string,
      p0: { x: number; y: number },
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      p3: { x: number; y: number },
      baseColor: string
    ) => {
      const lower = blockName.toLowerCase();

      // 1. Fill base solid/transparent polygon
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();

      let fillStyle = baseColor;
      if (lower.includes("water")) {
        fillStyle = faceType === "top" ? "rgba(63, 118, 228, 0.7)" : "rgba(43, 98, 208, 0.75)";
      } else if (lower.includes("glass")) {
        fillStyle = "rgba(255, 255, 255, 0.15)";
      } else if (lower.includes("grass")) {
        fillStyle = faceType === "top" ? "#5EA918" : "#866043"; // top green, sides dirt base
      }
      
      ctx.fillStyle = fillStyle;
      ctx.fill();

      // Apply detailed vector texture overlays

      // Grass fringe overlay for side faces
      if (lower.includes("grass") && faceType !== "top") {
        ctx.fillStyle = "#5EA918";
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        // Green fringe drops down 30% of side block face
        ctx.lineTo(p1.x * 0.7 + p2.x * 0.3, p1.y * 0.7 + p2.y * 0.3);
        ctx.lineTo(p0.x * 0.7 + p3.x * 0.3, p0.y * 0.7 + p3.y * 0.3);
        ctx.closePath();
        ctx.fill();
        return;
      }

      // Sugarcane textured reed stalks
      if (lower.includes("sugarcane")) {
        // Transparent light green leaf base
        ctx.fillStyle = "rgba(120, 195, 58, 0.35)";
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
        ctx.fill();
        
        // Vertical bamboo reed stalks
        ctx.strokeStyle = "#5EA918";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(p0.x * 0.3 + p1.x * 0.7, p0.y * 0.3 + p1.y * 0.7);
        ctx.lineTo(p3.x * 0.3 + p2.x * 0.7, p3.y * 0.3 + p2.y * 0.7);
        ctx.moveTo(p0.x * 0.7 + p1.x * 0.3, p0.y * 0.7 + p1.y * 0.3);
        ctx.lineTo(p3.x * 0.7 + p2.x * 0.3, p3.y * 0.7 + p2.y * 0.3);
        ctx.stroke();
        return;
      }

      // Water ripple lines
      if (lower.includes("water")) {
        ctx.strokeStyle = "rgba(174, 219, 255, 0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p0.x * 0.8 + p1.x * 0.2, p0.y * 0.8 + p1.y * 0.2);
        ctx.lineTo(p3.x * 0.2 + p2.x * 0.8, p3.y * 0.2 + p2.y * 0.8);
        ctx.stroke();
        return;
      }

      // Lava glowing patterns
      if (lower.includes("lava")) {
        ctx.strokeStyle = "#FFD000";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p0.x * 0.4 + p2.x * 0.6, p0.y * 0.4 + p2.y * 0.6);
        ctx.lineTo(p1.x * 0.8 + p3.x * 0.2, p1.y * 0.8 + p3.y * 0.2);
        ctx.stroke();
        return;
      }

      // Cactus prickly needles
      if (lower.includes("cactus")) {
        // Draw vertical cactus ridge lines
        ctx.strokeStyle = "#2E4C1C";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p0.x * 0.5 + p1.x * 0.5, p0.y * 0.5 + p1.y * 0.5);
        ctx.lineTo(p3.x * 0.5 + p2.x * 0.5, p3.y * 0.5 + p2.y * 0.5);
        ctx.stroke();

        // White spine needles
        ctx.fillStyle = "#FFFFFF";
        const cx = (p0.x + p1.x + p2.x + p3.x) / 4;
        const cy = (p0.y + p1.y + p2.y + p3.y) / 4;
        ctx.fillRect(cx - 2, cy, 4, 1);
        ctx.fillRect(cx, cy - 2, 1, 4);
        return;
      }

      // Spawner steel cage with rotating core glow
      if (lower.includes("spawner")) {
        // Wireframe steel borders
        ctx.strokeStyle = "#4D5B66";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
        ctx.stroke();

        // Diagonal inner cage lattice
        ctx.strokeStyle = "#27313A";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p2.x, p2.y);
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p3.x, p3.y);
        ctx.stroke();

        // Concentric cage cross-lines
        ctx.strokeRect((p0.x + p1.x)/2 - 1.5, (p0.y + p3.y)/2 - 1.5, 3, 3);

        // Rotating central fiery spark
        const cx = (p0.x + p1.x + p2.x + p3.x) / 4;
        const cy = (p0.y + p1.y + p2.y + p3.y) / 4;
        const fireRad = Math.abs(p0.x - p2.x) * 0.15;
        const fireGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, Math.max(3, fireRad));
        fireGrad.addColorStop(0, "#FFFFFF");
        fireGrad.addColorStop(0.3, "#FFAA00");
        fireGrad.addColorStop(1, "rgba(255, 0, 0, 0)");
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(3, fireRad), 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      // Piston wooden head slab and shaft
      if (lower.includes("piston")) {
        if (faceType === "top") {
          ctx.fillStyle = "#968160"; // wood plank
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
          ctx.fill();

          // Concentric oak stripes
          ctx.strokeStyle = "#6D5D44";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p0.x * 0.8 + p2.x * 0.2, p0.y * 0.8 + p2.y * 0.2);
          ctx.lineTo(p1.x * 0.8 + p3.x * 0.2, p1.y * 0.8 + p3.y * 0.2);
          ctx.lineTo(p2.x * 0.8 + p0.x * 0.2, p2.y * 0.8 + p0.y * 0.2);
          ctx.lineTo(p3.x * 0.8 + p1.x * 0.2, p3.y * 0.8 + p1.y * 0.2);
          ctx.closePath();
          ctx.stroke();
        } else {
          // Steel side belt
          ctx.fillStyle = "#9A9A9A";
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p1.x * 0.85 + p2.x * 0.15, p1.y * 0.85 + p2.y * 0.15);
          ctx.lineTo(p0.x * 0.85 + p3.x * 0.15, p0.y * 0.85 + p3.y * 0.15);
          ctx.closePath();
          ctx.fill();
        }
        return;
      }

      // Observer angry robot face
      if (lower.includes("observer")) {
        if (faceType === "top") {
          // Redstone indicator wire
          ctx.strokeStyle = "#9E2A2A";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo((p0.x + p1.x)/2, (p0.y + p1.y)/2);
          ctx.lineTo((p2.x + p3.x)/2, (p2.y + p3.y)/2);
          ctx.stroke();
        } else if (faceType === "south" || faceType === "east") {
          // Observer face mask
          ctx.fillStyle = "#3A3A3A";
          ctx.beginPath();
          const cx = (p0.x + p1.x + p2.x + p3.x) / 4;
          const cy = (p0.y + p1.y + p2.y + p3.y) / 4;
          ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Angry redstone glowing eye
          ctx.fillStyle = "#E61C1C";
          ctx.fillRect(cx - 1, cy - 1, 2, 2);
        }
        return;
      }

      // Campfire burning logs
      if (lower.includes("campfire")) {
        // Reddish flame vectors
        ctx.fillStyle = "#FF5500";
        ctx.beginPath();
        const cx = (p0.x + p1.x + p2.x + p3.x) / 4;
        const cy = (p0.y + p1.y + p2.y + p3.y) / 4;
        ctx.moveTo(cx - 3.5, cy + 2.5);
        ctx.lineTo(cx, cy - 6.5);
        ctx.lineTo(cx + 3.5, cy + 2.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#FFAA00";
        ctx.beginPath();
        ctx.moveTo(cx - 1.8, cy + 2);
        ctx.lineTo(cx, cy - 3.5);
        ctx.lineTo(cx + 1.8, cy + 2);
        ctx.closePath();
        ctx.fill();
        return;
      }

      // Pumpkin stripes and scary carved face
      if (lower.includes("pumpkin")) {
        // Ribbed lines
        ctx.strokeStyle = "#A9540C";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p0.x * 0.5 + p1.x * 0.5, p0.y * 0.5 + p1.y * 0.5);
        ctx.lineTo(p3.x * 0.5 + p2.x * 0.5, p3.y * 0.5 + p2.y * 0.5);
        ctx.stroke();

        if (faceType !== "top") {
          // Jack-O-Lantern carved face outline
          ctx.fillStyle = "#2C1605";
          const cx = (p0.x + p1.x + p2.x + p3.x) / 4;
          const cy = (p0.y + p1.y + p2.y + p3.y) / 4;
          
          // Left eye triangle
          ctx.beginPath();
          ctx.moveTo(cx - 2.8, cy - 1.8);
          ctx.lineTo(cx - 0.8, cy - 1.8);
          ctx.lineTo(cx - 1.8, cy - 0.8);
          ctx.closePath();
          ctx.fill();

          // Right eye triangle
          ctx.beginPath();
          ctx.moveTo(cx + 0.8, cy - 1.8);
          ctx.lineTo(cx + 2.8, cy - 1.8);
          ctx.lineTo(cx + 1.8, cy - 0.8);
          ctx.closePath();
          ctx.fill();

          // Jagged toothy mouth
          ctx.beginPath();
          ctx.moveTo(cx - 2.8, cy + 0.8);
          ctx.lineTo(cx - 1.8, cy + 1.8);
          ctx.lineTo(cx, cy + 1.3);
          ctx.lineTo(cx + 1.8, cy + 1.8);
          ctx.lineTo(cx + 2.8, cy + 0.8);
          ctx.lineTo(cx, cy + 2.8);
          ctx.closePath();
          ctx.fill();
        }
        return;
      }

      // Nether Brick layout pattern
      if (lower.includes("nether_bricks") || lower.includes("nether_brick")) {
        ctx.strokeStyle = "#160B0D";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        // Draw brick row guides
        ctx.moveTo(p0.x * 0.66 + p3.x * 0.34, p0.y * 0.66 + p3.y * 0.34);
        ctx.lineTo(p1.x * 0.66 + p2.x * 0.34, p1.y * 0.66 + p2.y * 0.34);
        ctx.moveTo(p0.x * 0.33 + p3.x * 0.67, p0.y * 0.33 + p3.y * 0.67);
        ctx.lineTo(p1.x * 0.33 + p2.x * 0.67, p1.y * 0.33 + p2.y * 0.67);
        ctx.stroke();
        return;
      }

      // Oak Fence wooden post rails
      if (lower.includes("oak_fence") || lower.includes("fence")) {
        ctx.strokeStyle = "#6D4E32";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p0.x * 0.75 + p3.x * 0.25, p0.y * 0.75 + p3.y * 0.25);
        ctx.lineTo(p1.x * 0.75 + p2.x * 0.25, p1.y * 0.75 + p2.y * 0.25);
        ctx.moveTo(p0.x * 0.25 + p3.x * 0.75, p0.y * 0.25 + p3.y * 0.75);
        ctx.lineTo(p1.x * 0.25 + p2.x * 0.75, p1.y * 0.25 + p2.y * 0.75);
        ctx.stroke();
        return;
      }

      // Metallic Hopper beveled rim
      if (lower.includes("hopper")) {
        ctx.strokeStyle = "#5A5A5A";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
        ctx.stroke();
        
        // Inner charcoal funnel hole
        ctx.fillStyle = "#222222";
        ctx.beginPath();
        const k = 0.25;
        ctx.moveTo(p0.x * (1 - k) + p2.x * k, p0.y * (1 - k) + p2.y * k);
        ctx.lineTo(p1.x * (1 - k) + p3.x * k, p1.y * (1 - k) + p3.y * k);
        ctx.lineTo(p2.x * (1 - k) + p0.x * k, p2.y * (1 - k) + p0.y * k);
        ctx.lineTo(p3.x * (1 - k) + p1.x * k, p3.y * (1 - k) + p1.y * k);
        ctx.closePath();
        ctx.fill();
        return;
      }

      // Chest / Sell boxes
      if (lower.includes("chest") || lower.includes("sell")) {
        ctx.strokeStyle = "#402613";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
        ctx.stroke();

        if (faceType !== "top") {
          // Metal latch lock center side
          ctx.fillStyle = "#C39314"; // Gold padlock latch
          const cx = (p0.x + p1.x + p2.x + p3.x) / 4;
          const cy = (p0.y + p1.y + p2.y + p3.y) / 4;
          ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
        }
        return;
      }

      // Cobblestone stone pattern overlay
      if (lower.includes("stone")) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p3.x, p3.y);
        ctx.stroke();
        return;
      }

      // Sand / Dirt granular speckles
      if (lower.includes("sand") || lower.includes("dirt")) {
        ctx.fillStyle = lower.includes("sand") ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.12)";
        const cx = (p0.x + p1.x + p2.x + p3.x) / 4;
        const cy = (p0.y + p1.y + p2.y + p3.y) / 4;
        ctx.fillRect(cx - 2, cy - 1, 1.5, 1.5);
        ctx.fillRect(cx + 2, cy + 2, 1, 1);
        ctx.fillRect(cx - 3, cy + 3, 1, 1);
        return;
      }

      // Slime & Honey Transparency
      if (lower.includes("slime") || lower.includes("honey")) {
        ctx.strokeStyle = lower.includes("slime") ? "rgba(90, 210, 70, 0.9)" : "rgba(240, 160, 0, 0.9)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
        ctx.stroke();

        // Inner nucleus block core
        ctx.fillStyle = lower.includes("slime") ? "rgba(110, 225, 90, 0.75)" : "rgba(255, 195, 20, 0.75)";
        ctx.beginPath();
        const k = 0.22;
        const c0 = { x: p0.x * (1 - k) + p2.x * k, y: p0.y * (1 - k) + p2.y * k };
        const c1 = { x: p1.x * (1 - k) + p3.x * k, y: p1.y * (1 - k) + p3.y * k };
        const c2 = { x: p2.x * (1 - k) + p0.x * k, y: p2.y * (1 - k) + p0.y * k };
        const c3 = { x: p3.x * (1 - k) + p1.x * k, y: p3.y * (1 - k) + p1.y * k };
        ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(c3.x, c3.y); ctx.closePath();
        ctx.fill();
        return;
      }

      // Gold, Emerald, Lapis, Netherite Beveled Frames
      if (lower.includes("gold") || lower.includes("emerald") || lower.includes("lapis") || lower.includes("netherite")) {
        ctx.strokeStyle = lower.includes("gold") ? "#c39314" : lower.includes("emerald") ? "#0f7d34" : lower.includes("lapis") ? "#0f2c61" : "#1a181a";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = lower.includes("gold") ? "#fff3a5" : lower.includes("emerald") ? "#6bff9d" : lower.includes("lapis") ? "#4a83f1" : "#3c383c";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        const k = 0.12;
        const c0 = { x: p0.x * (1 - k) + p2.x * k, y: p0.y * (1 - k) + p2.y * k };
        const c1 = { x: p1.x * (1 - k) + p3.x * k, y: p1.y * (1 - k) + p3.y * k };
        const c2 = { x: p2.x * (1 - k) + p0.x * k, y: p2.y * (1 - k) + p0.y * k };
        const c3 = { x: p3.x * (1 - k) + p1.x * k, y: p3.y * (1 - k) + p1.y * k };
        ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(c3.x, c3.y); ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = lower.includes("gold") ? "#ffe245" : lower.includes("emerald") ? "#22f16e" : lower.includes("lapis") ? "#fff" : "#222022";
        if (lower.includes("lapis")) {
          ctx.fillRect(c0.x * 0.65 + c2.x * 0.35, c0.y * 0.65 + c2.y * 0.35, 1.8, 1.8);
          ctx.fillRect(c1.x * 0.7 + c3.x * 0.3, c1.y * 0.7 + c3.y * 0.3, 1.8, 1.8);
        } else {
          ctx.beginPath();
          ctx.arc(c0.x * 0.5 + c2.x * 0.5, c0.y * 0.5 + c2.y * 0.5, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        return;
      }

      // Wool fuzzy weaves
      if (lower.includes("carpet") || lower.includes("wool")) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p2.x, p2.y);
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p3.x, p3.y);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
        ctx.beginPath();
        ctx.moveTo((p0.x + p1.x)/2, (p0.y + p1.y)/2);
        ctx.lineTo((p2.x + p3.x)/2, (p2.y + p3.y)/2);
        ctx.stroke();
        return;
      }

      // Concrete smooth borders
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      const k = 0.06;
      const c0 = { x: p0.x * (1 - k) + p2.x * k, y: p0.y * (1 - k) + p2.y * k };
      const c1 = { x: p1.x * (1 - k) + p3.x * k, y: p1.y * (1 - k) + p3.y * k };
      const c2 = { x: p2.x * (1 - k) + p0.x * k, y: p2.y * (1 - k) + p0.y * k };
      const c3 = { x: p3.x * (1 - k) + p1.x * k, y: p3.y * (1 - k) + p1.y * k };
      ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(c3.x, c3.y); ctx.closePath();
      ctx.stroke();

      // Shadow border
      ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
      ctx.stroke();
    };

    // Draw sorted visible block volumes
    renderedList.forEach(rBlock => {
      const b = rBlock.b;
      const x = b.x;
      const y = b.y;
      const z = b.z;

      // Project vertices
      const v000 = project(x, y, z);
      const v100 = project(x + 1, y, z);
      const v101 = project(x + 1, y, z + 1);
      const v001 = project(x, y, z + 1);
      const v010 = project(x, y + 1, z);
      const v110 = project(x + 1, y + 1, z);
      const v111 = project(x + 1, y + 1, z + 1);
      const v011 = project(x, y + 1, z + 1);

      const baseHex = getBlockColorHex(b.blockName);

      // Color shading adjustments based on face alignment
      const topColor = baseHex;
      const eastColor = adjustColor(baseHex, -12);
      const westColor = adjustColor(baseHex, -14);
      const southColor = adjustColor(baseHex, -22);
      const northColor = adjustColor(baseHex, -24);

      // Hidden Face Culling Logic (Adjacent voxel checks)
      const hRight = blockMap.get(`${x + 1},${z}`) ?? -1;
      const hLeft = blockMap.get(`${x - 1},${z}`) ?? -1;
      const hFront = blockMap.get(`${x},${z + 1}`) ?? -1;
      const hBack = blockMap.get(`${x},${z - 1}`) ?? -1;

      // Draw EAST face
      if (hRight < y && v111 && v110 && v100 && v101) {
        drawFace("east", b.blockName, v111, v110, v100, v101, eastColor);
      }

      // Draw WEST face
      if (hLeft < y && v010 && v011 && v001 && v000) {
        drawFace("west", b.blockName, v010, v011, v001, v000, westColor);
      }

      // Draw SOUTH face
      if (hFront < y && v011 && v111 && v101 && v001) {
        drawFace("south", b.blockName, v011, v111, v101, v001, southColor);
      }

      // Draw NORTH face
      if (hBack < y && v110 && v010 && v000 && v100) {
        drawFace("north", b.blockName, v110, v010, v000, v100, northColor);
      }

      // Draw TOP face (always visible unless completely covered directly above)
      if (v010 && v110 && v111 && v011) {
        drawFace("top", b.blockName, v010, v110, v111, v011, topColor);
      }
    });

  }, [blocks, cam, dimensions]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.warn("Fullscreen error:", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.warn("Exit fullscreen error:", err));
    }
  };

  const handleZoomIn = () => {
    setCam(prev => ({ ...prev, zoom: Math.min(95, prev.zoom + 10) }));
  };

  const handleZoomOut = () => {
    setCam(prev => ({ ...prev, zoom: Math.max(5, prev.zoom - 10) }));
  };

  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-[#050308] border-4 border-purple-950/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative group select-none ${
        isFullscreen ? "w-full h-full rounded-none border-none" : "h-[540px] md:h-[600px]"
      }`}
    >
      {/* Title Header with live status orb */}
      <div className="absolute top-4 left-6 z-10 font-mono text-[10px] md:text-xs text-purple-400 tracking-wider flex items-center gap-2 pointer-events-none uppercase bg-[#050208]/75 px-3 py-1.5 rounded-xl border border-purple-900/30 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0055ff] animate-pulse shadow-[0_0_8px_#0055ff]" />
        {title} · 3D Orbital Showpiece
      </div>

      {/* Floating Action Button Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={toggleAutoRotate}
          title={autoRotate ? "Pause Auto-Rotation" : "Enable Auto-Rotation"}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-md backdrop-blur-md flex items-center justify-center ${
            autoRotate 
              ? "bg-[#0055ff]/10 border-[#0055ff]/40 text-sky-400 hover:bg-[#0055ff]/20" 
              : "bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/90"
          }`}
        >
          {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition-all cursor-pointer shadow-md backdrop-blur-md"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition-all cursor-pointer shadow-md backdrop-blur-md"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={resetCamera}
          title="Reset Viewpoint"
          className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition-all cursor-pointer shadow-md backdrop-blur-md"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
          className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition-all cursor-pointer shadow-md backdrop-blur-md"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Canvas Viewport container */}
      <div className="flex-1 relative overflow-hidden select-none">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="w-full h-full block cursor-grab active:cursor-grabbing"
        />

        {/* HUD Overlay instructions tailored to drag-and-rotate */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#050208]/90 border border-purple-900/40 px-6 py-3 rounded-full text-zinc-300 font-mono text-[10px] md:text-xs tracking-wide shadow-2xl backdrop-blur-md pointer-events-none flex items-center justify-center gap-2 whitespace-nowrap">
          <Compass className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>
            Drag anywhere to rotate model · Scroll to zoom
          </span>
          {autoRotate && (
            <span className="text-[9px] text-[#0055ff] ml-1 px-1.5 py-0.5 bg-[#0055ff]/10 border border-[#0055ff]/20 rounded font-pixel uppercase font-bold animate-pulse">
              orbit active
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
