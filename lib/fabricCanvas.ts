// lib/fabricCanvas.ts
// Fabric.js canvas utility functions (client-side only)

export interface MandirPart {
  id: string;
  name: string;
  src: string;
  category: string;
}

export const PARTS_DATA: Record<string, MandirPart[]> = {
  Pillars: [
    { id: "pillar1", name: "Gold Pillar", src: "/assets/pillars/pillar1.svg", category: "Pillars" },
    { id: "pillar2", name: "Marble Pillar", src: "/assets/pillars/pillar2.svg", category: "Pillars" },
    { id: "pillar3", name: "Gold Trim Pillar", src: "/assets/pillars/pillar3.svg", category: "Pillars" },
    { id: "pillar4", name: "Stone Pillar", src: "/assets/pillars/pillar4.svg", category: "Pillars" },
    { id: "pillar5", name: "White Pillar", src: "/assets/pillars/pillar5.svg", category: "Pillars" },
    { id: "pillar6", name: "Corian Pillar", src: "/assets/pillars/pillar6.svg", category: "Pillars" },
    { id: "pillar7", name: "Ornate White", src: "/assets/pillars/pillar7.svg", category: "Pillars" },
    { id: "pillar8", name: "Roman Fluted", src: "/assets/pillars/pillar8.svg", category: "Pillars" },
  ],
  Top: [
    { id: "top1", name: "Gayatri Mantra", src: "/assets/top/top1.svg", category: "Top" },
    { id: "top2", name: "White Om Top", src: "/assets/top/top2.svg", category: "Top" },
    { id: "top3", name: "Imperial White Arch", src: "/assets/top/top3.svg", category: "Top" },
    { id: "top4", name: "Om Top", src: "/assets/top/top4.svg", category: "Top" },
    { id: "top5", name: "Five Peak", src: "/assets/top/top5.svg", category: "Top" },
    { id: "top6", name: "Corian Top", src: "/assets/top/top6.svg", category: "Top" },
    { id: "top7", name: "Golden Carved Top", src: "/assets/top/top7.svg", category: "Top" },
    { id: "top8", name: "3-Dome Arch", src: "/assets/top/top8.svg", category: "Top" },
  ],
  "Back Panel": [
    { id: "backpanel1", name: "Imperial Mandala", src: "/assets/backpanel/backpanel1.svg", category: "Back Panel" },
    { id: "backpanel2", name: "Marble Panel", src: "/assets/backpanel/backpanel2.svg", category: "Back Panel" },
    { id: "backpanel3", name: "Om & deepaks", src: "/assets/backpanel/backpanel3.svg", category: "Back Panel" },
    { id: "backpanel4", name: "Glowing Mandala", src: "/assets/backpanel/backpanel4.svg", category: "Back Panel" },
    { id: "backpanel5", name: "Floral Panel", src: "/assets/backpanel/backpanel5.svg", category: "Back Panel" },
    { id: "backpanel6", name: "Corian Panel", src: "/assets/backpanel/backpanel6.svg", category: "Back Panel" },
    { id: "backpanel7", name: "Lotus Glow", src: "/assets/backpanel/backpanel7.svg", category: "Back Panel" },
    { id: "backpanel8", name: "Sunburst Aura", src: "/assets/backpanel/backpanel8.svg", category: "Back Panel" },
  ],
  Vanity: [
    { id: "vanity1", name: "Gold Shelf", src: "/assets/vanity/vanity1.svg", category: "Vanity" },
    { id: "vanity2", name: "White Carved Vanity", src: "/assets/vanity/vanity2.svg", category: "Vanity" },
    { id: "vanity3", name: "Wood Cabinet", src: "/assets/vanity/vanity3.svg", category: "Vanity" },
    { id: "vanity4", name: "Open Shelf", src: "/assets/vanity/vanity4.svg", category: "Vanity" },
    { id: "vanity5", name: "Carved Platform", src: "/assets/vanity/vanity5.svg", category: "Vanity" },
    { id: "vanity6", name: "Corian Vanity", src: "/assets/vanity/vanity6.svg", category: "Vanity" },
    { id: "vanity7", name: "White Cabinet", src: "/assets/vanity/vanity7.svg", category: "Vanity" },
    { id: "vanity8", name: "Drawer Cabinet", src: "/assets/vanity/vanity8.svg", category: "Vanity" },
  ],
};

export const CATEGORY_ICONS: Record<string, string> = {
  Pillars: "🏛️",
  Top: "🔺",
  "Back Panel": "🖼️",
  Vanity: "🪔",
};
