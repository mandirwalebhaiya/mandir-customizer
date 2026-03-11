"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { MandirPart } from "@/lib/fabricCanvas";

// Dynamically import CanvasBoard (client-side only, avoids SSR issues)
const CanvasBoard = dynamic(() => import("@/components/CanvasBoard"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-stone-100">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-bounce">🛕</div>
        <p className="text-stone-500 text-sm font-medium">Loading canvas…</p>
      </div>
    </div>
  ),
});

export default function BuilderPage() {
  const [pendingPart, setPendingPart] = useState<MandirPart | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAddPart = useCallback((part: MandirPart) => {
    setPendingPart({ ...part, id: `${part.id}_${Date.now()}` });
    // Close sidebar on mobile after adding
    setIsSidebarOpen(false);
  }, []);

  const handlePartAdded = useCallback(() => {
    setPendingPart(null);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-stone-100 overflow-hidden">
      {/* Top Header Bar */}
      <header className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600 text-white shadow-lg shrink-0">
        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1 p-1.5 rounded-lg hover:bg-amber-600/50 transition"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open Parts Panel"
        >
          <span className="block w-5 h-0.5 bg-white rounded" />
          <span className="block w-5 h-0.5 bg-white rounded" />
          <span className="block w-5 h-0.5 bg-white rounded" />
        </button>

        {/* Logo + title */}
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🛕</span>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-wide">Mandir Builder</h1>
            <p className="text-[10px] text-amber-200 leading-tight">2D Layout Designer</p>
          </div>
        </div>

        {/* Badge */}
        <span className="ml-2 hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/40 border border-amber-400/40 text-amber-100">
          MVP v1.0
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Navigation Toggle */}
        <div className="flex items-center bg-black/20 rounded-lg p-1 mr-2 relative z-50">
          <div className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-amber-800 shadow-sm cursor-default inline-block pointer-events-auto">
            Freeform
          </div>
          <Link 
            href="/"
            className="px-3 py-1.5 text-xs font-medium rounded-md text-amber-100 hover:text-white transition-colors pointer-events-auto inline-block relative z-50"
          >
            Template
          </Link>
        </div>

        {/* Tips */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-amber-200">
          <span>⌫ Delete</span>
          <span className="opacity-40">|</span>
          <span>↔ Resize</span>
          <span className="opacity-40">|</span>
          <span>🔄 Rotate</span>
        </div>
      </header>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          onAddPart={handleAddPart}
          isMobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
        />

        {/* Canvas */}
        <CanvasBoard
          pendingPart={pendingPart}
          onPartAdded={handlePartAdded}
        />
      </div>
    </div>
  );
}
