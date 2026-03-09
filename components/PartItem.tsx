"use client";

import { MandirPart } from "@/lib/fabricCanvas";
import Image from "next/image";

interface PartItemProps {
  part: MandirPart;
  onAdd: (part: MandirPart) => void;
}

export default function PartItem({ part, onAdd }: PartItemProps) {
  return (
    <button
      onClick={() => onAdd(part)}
      title={`Add ${part.name}`}
      className="group relative w-full flex flex-col items-center gap-1.5 p-2 rounded-xl border border-amber-200/60 bg-white/70 hover:bg-amber-50 hover:border-amber-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="relative w-full h-14 overflow-hidden rounded-lg bg-amber-50/80 flex items-center justify-center">
        <Image
          src={part.src}
          alt={part.name}
          fill
          className="object-contain p-1"
          unoptimized
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <span className="text-amber-700 text-xs font-semibold bg-white/90 px-1.5 py-0.5 rounded">
            + Add
          </span>
        </div>
      </div>
      <span className="text-[11px] font-medium text-stone-600 text-center leading-tight line-clamp-2">
        {part.name}
      </span>
    </button>
  );
}
