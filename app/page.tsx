"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import FixedBoard from "@/components/FixedBoard";
import { MandirPart } from "@/lib/fabricCanvas";

export default function HomePage() {
  const [pendingPart, setPendingPart] = useState<MandirPart | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAddPart = useCallback((part: MandirPart) => {
    // In template mode, we just need the pristine part data to swap it
    setPendingPart(part);
    setIsSidebarOpen(false);
  }, []);

  const handlePartAdded = useCallback(() => {
    setPendingPart(null);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-stone-100 overflow-hidden">
      {/* Top Header Bar */}
      <header className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600 text-white shadow-lg shrink-0">
        <button
          className="md:hidden flex flex-col gap-1 p-1.5 rounded-lg hover:bg-amber-600/50 transition"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open Parts Panel"
        >
          <span className="block w-5 h-0.5 bg-white rounded" />
          <span className="block w-5 h-0.5 bg-white rounded" />
          <span className="block w-5 h-0.5 bg-white rounded" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🛕</span>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-wide">Mandir Customizer</h1>
            <p className="text-[10px] text-amber-200 leading-tight">Fixed Template Mode</p>
          </div>
        </div>

        <div className="flex-1" />

        {/* Navigation Toggle */}
        <div className="flex items-center bg-black/20 rounded-lg p-1">
          <Link
            href="/builder"
            className="px-3 py-1.5 text-xs font-medium rounded-md text-amber-100 hover:text-white transition-colors"
          >
            Freeform
          </Link>
          <div className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-amber-800 shadow-sm cursor-default">
            Template
          </div>
        </div>
      </header>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          onAddPart={handleAddPart}
          isMobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
        />

        <FixedBoard
          pendingPart={pendingPart}
          onPartAdded={handlePartAdded}
        />
      </div>
    </div>
  );
}
