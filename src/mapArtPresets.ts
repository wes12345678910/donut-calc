export interface MapArtPreset {
  id: string;
  name: string;
  imageSrc: string;
  gridSize: string;
  author: string;
  typicalPrice: number;
}

export const PRESET_MAP_ARTS: MapArtPreset[] = [
  {
    id: "anime",
    name: "Cute Anime Girl",
    imageSrc: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=256&auto=format&fit=crop&q=80",
    gridSize: "1x1",
    author: "VinciArt",
    typicalPrice: 45000000
  },
  {
    id: "donut",
    name: "Donut SMP Logo",
    imageSrc: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=256&auto=format&fit=crop&q=80",
    gridSize: "1x1",
    author: "DrDonut",
    typicalPrice: 35000000
  },
  {
    id: "monalisa",
    name: "Mona Lisa",
    imageSrc: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=256&auto=format&fit=crop&q=80",
    gridSize: "1x1",
    author: "VinciArt",
    typicalPrice: 60000000
  },
  {
    id: "sunset",
    name: "Minecraft Sunset",
    imageSrc: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=256&auto=format&fit=crop&q=80",
    gridSize: "2x2",
    author: "PixelPainter",
    typicalPrice: 15000000
  },
  {
    id: "gigachad",
    name: "Giga Chad Meme",
    imageSrc: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=256&auto=format&fit=crop&q=80",
    gridSize: "1x1",
    author: "MemeKing",
    typicalPrice: 20000000
  }
];
