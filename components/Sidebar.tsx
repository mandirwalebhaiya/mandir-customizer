"use client";

import { useState } from "react";
import { PARTS_DATA, CATEGORY_ICONS, MandirPart } from "@/lib/fabricCanvas";
import PartItem from "./PartItem";

interface SidebarProps {
  onAddPart: (part: MandirPart) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ onAddPart, isMobileOpen, onMobileClose }: SidebarProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Pillars");
  const categories = Object.keys(PARTS_DATA);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed md:relative z-30 md:z-auto
          top-0 left-0 md:left-auto
          h-full md:h-auto
          w-[260px] md:w-[260px]
          bg-gradient-to-b from-stone-50 to-amber-50/60
          border-r border-amber-100
          flex flex-col
          shadow-xl md:shadow-md
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-amber-100 bg-gradient-to-r from-amber-700 to-amber-600 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold tracking-wide">🛕 Parts Panel</h2>
            <p className="text-[10px] text-amber-200 mt-0.5">Click to add to canvas</p>
          </div>
          {/* Mobile close button */}
          <button
            className="md:hidden text-amber-100 hover:text-white p-1"
            onClick={onMobileClose}
          >
            ✕
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex flex-col gap-1 p-3 border-b border-amber-100 bg-white/50 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-semibold transition-all duration-150 ${
                activeCategory === cat
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-stone-600 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              <span className="text-sm">{CATEGORY_ICONS[cat]}</span>
              {cat}
              <span
                className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-normal ${
                  activeCategory === cat
                    ? "bg-amber-400/40 text-white"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {PARTS_DATA[cat].length}
              </span>
            </button>
          ))}
        </div>

        {/* Parts grid — scrollable */}
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-2 px-1">
            {activeCategory}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PARTS_DATA[activeCategory].map((part) => (
              <PartItem key={part.id} part={part} onAdd={onAddPart} />
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-4 py-3 border-t border-amber-100 bg-amber-50/60 shrink-0">
          <p className="text-[10px] text-stone-400 text-center leading-relaxed">
            🖱️ Drag • ↔ Resize • 🔄 Rotate<br/>⌫ Delete key to remove
          </p>
        </div>
      </aside>
    </>
  );
}
