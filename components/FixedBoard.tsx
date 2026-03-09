import { useState, useEffect } from "react";
import Image from "next/image";
import { MandirPart, PARTS_DATA } from "@/lib/fabricCanvas";

interface FixedBoardProps {
  pendingPart: MandirPart | null;
  onPartAdded: () => void;
}

export default function FixedBoard({ pendingPart, onPartAdded }: FixedBoardProps) {
  // Default selected parts to create an initial look (Dummy Mandir)
  const [selectedParts, setSelectedParts] = useState<Record<string, MandirPart>>({
    "Back Panel": PARTS_DATA["Back Panel"][2], // Default Arch Panel
    "Vanity": PARTS_DATA["Vanity"][6],         // Default Gold Shelf
    "Pillars": PARTS_DATA["Pillars"][6],       // Default Gold Pillar
    "Top": PARTS_DATA["Top"][7],               // Default Gold Shikhara
  });

  useEffect(() => {
    if (pendingPart) {
      setSelectedParts(prev => ({
        ...prev,
        [pendingPart.category]: pendingPart
      }));
      onPartAdded();
    }
  }, [pendingPart, onPartAdded]);

  // Handle removing a part
  const removePart = (category: string) => {
    setSelectedParts(prev => {
      const newState = { ...prev };
      delete newState[category];
      return newState;
    });
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full relative bg-stone-200">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-stone-200 shrink-0">
        <span className="text-sm font-semibold text-stone-700">Template Mode</span>
        <span className="text-xs text-stone-400 ml-2">Click sidebar items to replace parts</span>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setSelectedParts({})}
            className="px-2.5 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors font-medium text-stone-600"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative flex items-center justify-center p-4 min-h-0">
        {/* The 600x600 fixed builder container */}
        <div
          className="relative shadow-2xl rounded-sm border-2 border-amber-200/60 overflow-hidden bg-white shrink-0"
          style={{ width: '600px', height: '600px', background: "linear-gradient(135deg, #fdf8f0 0%, #fef6e4 100%)" }}
        >
          {/* Back Panel - Center/Background */}
          {selectedParts["Back Panel"] && (
            <div className="absolute top-[145px] left-[116px] w-[365px] h-[365px] z-[1] group">
              <Image
                src={selectedParts["Back Panel"].src}
                alt={selectedParts["Back Panel"].name}
                fill
                className="object-fill drop-shadow-sm"
              />
              <button
                onClick={() => removePart("Back Panel")}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:flex"
              >✕</button>
            </div>
          )}

          {/* Vanity - Bottom */}
          {selectedParts["Vanity"] && (
            <div className="absolute top-[430px] left-[55px] w-[490px] h-[150px] z-[2] group">
              <Image
                src={selectedParts["Vanity"].src}
                alt={selectedParts["Vanity"].name}
                fill
                className="object-fill drop-shadow-lg"
              />
              <button
                onClick={() => removePart("Vanity")}
                className="absolute -bottom-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:flex"
              >✕</button>
            </div>
          )}

          {/* Pillars - Sides (Standing on Vanity) */}
          {selectedParts["Pillars"] && (
            <>
              {/* Left Pillar */}
              <div className="absolute top-[140px] left-[80px] w-[80px] h-[360px] z-[3] group">
                <Image
                  src={selectedParts["Pillars"].src}
                  alt={selectedParts["Pillars"].name}
                  fill
                  className="object-fill drop-shadow-md"
                />
                <button
                  onClick={() => removePart("Pillars")}
                  className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-6 h-6 items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:flex"
                >✕</button>
              </div>

              {/* Right Pillar */}
              <div className="absolute top-[140px] right-[80px] w-[80px] h-[360px] z-[3] group">
                <Image
                  src={selectedParts["Pillars"].src}
                  alt={selectedParts["Pillars"].name}
                  fill
                  className="object-fill drop-shadow-md"
                />
              </div>
            </>
          )}

          {/* Top - Spanning above pillars */}
          {selectedParts["Top"] && (
            <div className="absolute top-[65px] left-[60px] w-[480px] h-[145px] z-[4] group">
              <Image
                src={selectedParts["Top"].src}
                alt={selectedParts["Top"].name}
                fill
                className="object-fill drop-shadow-xl"
              />
              <button
                onClick={() => removePart("Top")}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:flex"
              >✕</button>
            </div>
          )}

          {/* Empty state hint */}
          {Object.keys(selectedParts).length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-sm max-w-[240px]">
                <p className="text-3xl mb-2">🛕</p>
                <p className="text-sm font-semibold text-stone-600">Fixed Mandir Template</p>
                <p className="text-xs text-stone-400 mt-1">
                  Click parts in the left panel to snap them into position
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
