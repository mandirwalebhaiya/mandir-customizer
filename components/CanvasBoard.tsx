"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { MandirPart } from "@/lib/fabricCanvas";

interface CanvasBoardProps {
  pendingPart: MandirPart | null;
  onPartAdded: () => void;
}

export default function CanvasBoard({ pendingPart, onPartAdded }: CanvasBoardProps) {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [objectCount, setObjectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Fabric canvas
  useEffect(() => {
    let cleanupFns: (() => void)[] = [];

    const initCanvas = () => {
      // Use synchronous fabric import (already imported at top of file)
      if (!canvasEl.current) return;

      const canvas = new fabric.Canvas(canvasEl.current, {
        width: 1000,
        height: 600,
        backgroundColor: "#fdf8f0",
        preserveObjectStacking: true,
        selection: true,
        // ✅ FIX: Allow touch interactions on objects without triggering page scroll
        allowTouchScrolling: false,
      });

      fabricRef.current = canvas;

      // ✅ FIX: Disable object caching to prevent "InvalidStateError" with complex SVGs.
      fabric.Object.prototype.objectCaching = false;

      // ✅ FIX: Call calcOffset immediately so Fabric knows the canvas's exact
      // position in the page — without this, mouse/touch coordinates are offset
      // by however far the canvas is from the top-left of the viewport.
      canvas.calcOffset();

      // ✅ FIX: Re-calculate offset on any scroll event (capturing phase catches
      // scrolls inside nested containers too), since scrolling shifts the canvas
      // position and Fabric needs to know its new location.
      const handleScroll = () => {
        if (fabricRef.current) fabricRef.current.calcOffset();
      };
      window.addEventListener("scroll", handleScroll, true);
      cleanupFns.push(() => window.removeEventListener("scroll", handleScroll, true));

      // Delete key removes selected object
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          (e.key === "Delete" || e.key === "Backspace") &&
          document.activeElement?.tagName !== "INPUT"
        ) {
          const active = canvas.getActiveObject();
          if (active) {
            canvas.remove(active);
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            setObjectCount((prev) => Math.max(0, prev - 1));
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      cleanupFns.push(() => window.removeEventListener("keydown", handleKeyDown));

      // Track selection state
      canvas.on("selection:created", () => setHasSelection(true));
      canvas.on("selection:updated", () => setHasSelection(true));
      canvas.on("selection:cleared", () => setHasSelection(false));

      // Keep objects inside canvas bounds
      const CANVAS_W = 1000;
      const CANVAS_H = 600;
      canvas.on("object:moving", (e: any) => {
        const obj = e.target;
        if (!obj) return;
        const br = obj.getBoundingRect(true);

        if (br.left < 0) obj.left -= br.left;
        if (br.top < 0) obj.top -= br.top;
        if (br.left + br.width > CANVAS_W) obj.left -= br.left + br.width - CANVAS_W;
        if (br.top + br.height > CANVAS_H) obj.top -= br.top + br.height - CANVAS_H;
        obj.setCoords();
      });

      // Draw subtle grid
      drawGrid(canvas, fabric);

      // ✅ FIX: ResizeObserver re-calculates offset whenever the container or
      // body layout changes (e.g. sidebar opens/closes, window resizes).
      // We observe both the container AND document.body to catch all layout shifts.
      const observer = new ResizeObserver(() => {
        if (fabricRef.current) {
          fabricRef.current.calcOffset();
        }
      });
      if (containerRef.current) observer.observe(containerRef.current);
      observer.observe(document.body);
      cleanupFns.push(() => observer.disconnect());
    };

    initCanvas();

    return () => {
      cleanupFns.forEach((fn) => fn());
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, []);

  // Draw a subtle dot-grid pattern
  const drawGrid = (canvas: any, fabric: any) => {
    const spacing = 30;
    const w = 1000;
    const h = 600;
    const gridObjects: any[] = [];

    for (let x = spacing; x < w; x += spacing) {
      for (let y = spacing; y < h; y += spacing) {
        const dot = new fabric.Circle({
          left: x,
          top: y,
          radius: 1,
          fill: "#d4a01730",
          selectable: false,
          evented: false,
          originX: "center",
          originY: "center",
        });
        gridObjects.push(dot);
      }
    }
    gridObjects.forEach((d) => canvas.add(d));
    canvas.sendToBack(canvas.item(0));
  };

  // Load SVG when pendingPart changes
  useEffect(() => {
    if (!pendingPart || !fabricRef.current) return;

    const canvas = fabricRef.current;
    setIsLoading(true);

    const loadSVG = () => {
      fabric.loadSVGFromURL(
        pendingPart.src,
        (objects: any[], options: any) => {
          if (!objects || objects.length === 0) {
            setIsLoading(false);
            return;
          }

          // Strip SVG-native position from options so it doesn't override ours
          const cleanOptions = { ...options, left: 0, top: 0 };
          const obj = fabric.util.groupSVGElements(objects, cleanOptions);

          // Scale to a reasonable default size
          const maxDim = 150;
          const objW = obj.width || maxDim;
          const objH = obj.height || maxDim;
          const scale = Math.min(maxDim / objW, maxDim / objH);

          const CANVAS_W = 1000;
          const CANVAS_H = 600;
          const randOffset = () => (Math.random() - 0.5) * 60;

          obj.set({
            left: CANVAS_W / 2 + randOffset(),
            top: CANVAS_H / 2 + randOffset(),
            scaleX: scale,
            scaleY: scale,
            originX: "center",
            originY: "center",
            cornerStyle: "circle",
            cornerColor: "#d4a017",
            cornerStrokeColor: "#8b5e1a",
            borderColor: "#d4a017",
            borderScaleFactor: 2,
            cornerSize: 10,
            transparentCorners: false,
            hasRotatingPoint: true,
          });

          obj.setCoords();

          canvas.add(obj);
          canvas.setActiveObject(obj);
          canvas.requestRenderAll();
          setObjectCount((prev) => prev + 1);
          setHasSelection(true);
          setIsLoading(false);
          onPartAdded();
        }
      );
    };

    loadSVG();
  }, [pendingPart, onPartAdded]);

  // Delete selected object
  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      setObjectCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  // Bring forward
  const bringForward = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.bringForward(active);
      canvas.requestRenderAll();
    }
  }, []);

  // Send backward
  const sendBackward = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.sendBackwards(active);
      canvas.requestRenderAll();
    }
  }, []);

  // Clear canvas (removes all user-placed objects, keeps grid dots)
  const clearCanvas = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (!confirm("Clear all objects from canvas?")) return;
    const objects = canvas.getObjects().filter((o: any) => o.selectable !== false);
    objects.forEach((o: any) => canvas.remove(o));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    setObjectCount(0);
  }, []);

  // Export canvas as PNG
  const exportPNG = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    const dataURL = canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "mandir-design.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full">
      {/* Canvas top toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-stone-200 flex-wrap shrink-0">
        {/* Object count badge */}
        <span className="text-xs text-stone-400 mr-1 hidden sm:inline">
          Objects: <span className="font-semibold text-stone-600">{objectCount}</span>
        </span>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={bringForward}
            disabled={!hasSelection}
            title="Bring Forward"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-stone-700"
          >
            ↑ Forward
          </button>
          <button
            onClick={sendBackward}
            disabled={!hasSelection}
            title="Send Backward"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-stone-700"
          >
            ↓ Backward
          </button>
          <button
            onClick={deleteSelected}
            disabled={!hasSelection}
            title="Delete Selected (Del)"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-red-600"
          >
            🗑 Delete
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={clearCanvas}
            className="px-2.5 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors font-medium text-stone-600"
          >
            Clear All
          </button>
          <button
            onClick={exportPNG}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg transition-all font-semibold shadow-sm hover:shadow"
          >
            <span>⬇</span> Export PNG
          </button>
        </div>
      </div>

      {/* Canvas area */}
      {/*
        ✅ FIX: Changed overflow-auto → overflow-hidden.
        overflow-auto creates an internal scroll container whose scroll offset
        Fabric cannot detect, permanently breaking mouse/touch coordinate mapping.
        overflow-hidden prevents this entirely.
        Also removed the responsive justify-start/items-start classes — centering
        consistently helps calcOffset() stay accurate.
      */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-stone-200 relative flex items-center justify-center p-4 min-h-0"
      >
        {isLoading && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 border border-amber-200 rounded-full px-3 py-1.5 text-xs text-amber-700 shadow-sm">
            <span className="animate-spin inline-block">⟳</span> Loading...
          </div>
        )}

        {/* Fabric canvas wrapper */}
        <div
          className="shadow-2xl rounded-sm border-2 border-amber-200/60"
          style={{
            background: "linear-gradient(135deg, #fdf8f0 0%, #fef6e4 100%)",
          }}
        >
          <canvas
            ref={canvasEl}
            id="mandirCanvas"
            width={1000}
            height={600}
          />
        </div>

        {/* Empty state hint */}
        {objectCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-sm max-w-[240px]">
              <p className="text-3xl mb-2">🛕</p>
              <p className="text-sm font-semibold text-stone-600">Start Building Your Mandir</p>
              <p className="text-xs text-stone-400 mt-1">
                Click any part in the left panel to add it to the canvas
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import { MandirPart } from "@/lib/fabricCanvas";

// interface CanvasBoardProps {
//   pendingPart: MandirPart | null;
//   onPartAdded: () => void;
// }

// export default function CanvasBoard({ pendingPart, onPartAdded }: CanvasBoardProps) {
//   const canvasEl = useRef<HTMLCanvasElement>(null);
//   const fabricRef = useRef<any>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [hasSelection, setHasSelection] = useState(false);
//   const [objectCount, setObjectCount] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);

//   // Initialize Fabric canvas
//   useEffect(() => {
//     let canvas: any = null;

//     const initCanvas = async () => {
//       const fabric = await import("fabric").then((m) => m.fabric);

//       if (!canvasEl.current) return;

//       canvas = new fabric.Canvas(canvasEl.current, {
//         width: 1000,
//         height: 600,
//         backgroundColor: "#fdf8f0",
//         preserveObjectStacking: true,
//         selection: true,
//       });

//       fabricRef.current = canvas;

//       // Delete key removes selected object
//       const handleKeyDown = (e: KeyboardEvent) => {
//         if ((e.key === "Delete" || e.key === "Backspace") && document.activeElement?.tagName !== "INPUT") {
//           const active = canvas.getActiveObject();
//           if (active) {
//             canvas.remove(active);
//             canvas.discardActiveObject();
//             canvas.requestRenderAll();
//             setObjectCount((prev) => Math.max(0, prev - 1));
//           }
//         }
//       };

//       window.addEventListener("keydown", handleKeyDown);

//       // Track selection state
//       canvas.on("selection:created", () => setHasSelection(true));
//       canvas.on("selection:updated", () => setHasSelection(true));
//       canvas.on("selection:cleared", () => setHasSelection(false));

//       // Keep objects inside canvas bounds
//       // Use hardcoded dimensions — canvas.getWidth() can return 0 in event
//       // callbacks before the DOM has measured the element, which would
//       // snap every drag to a large negative coordinate.
//       const CANVAS_W = 1000;
//       const CANVAS_H = 600;
//       canvas.on("object:moving", (e: any) => {
//         const obj = e.target;
//         if (!obj) return;
//         const br = obj.getBoundingRect(true);

//         if (br.left < 0) obj.left -= br.left;
//         if (br.top < 0) obj.top -= br.top;
//         if (br.left + br.width > CANVAS_W) obj.left -= (br.left + br.width - CANVAS_W);
//         if (br.top + br.height > CANVAS_H) obj.top -= (br.top + br.height - CANVAS_H);
//         obj.setCoords();
//       });

//       // Draw subtle grid
//       drawGrid(canvas, fabric);

//       // Fix coordinate offsets: Flexbox centers the canvas dynamically, so Fabric
//       // needs to be told exactly where the canvas physically is to map mouse clicks.
//       const observer = new ResizeObserver(() => {
//         if (fabricRef.current) {
//           fabricRef.current.calcOffset();
//         }
//       });
//       if (containerRef.current) {
//         observer.observe(containerRef.current);
//       }

//       return () => {
//         window.removeEventListener("keydown", handleKeyDown);
//         observer.disconnect();
//       };
//     };

//     const cleanup = initCanvas();

//     return () => {
//       cleanup.then((cleanupFn) => {
//         cleanupFn?.();
//       });
//       if (fabricRef.current) {
//         fabricRef.current.dispose();
//         fabricRef.current = null;
//       }
//     };
//   }, []);

//   // Draw a subtle dot-grid pattern
//   const drawGrid = (canvas: any, fabric: any) => {
//     const spacing = 30;
//     const w = canvas.getWidth();
//     const h = canvas.getHeight();
//     const gridObjects: any[] = [];

//     for (let x = spacing; x < w; x += spacing) {
//       for (let y = spacing; y < h; y += spacing) {
//         const dot = new fabric.Circle({
//           left: x,
//           top: y,
//           radius: 1,
//           fill: "#d4a01730",
//           selectable: false,
//           evented: false,
//           originX: "center",
//           originY: "center",
//         });
//         gridObjects.push(dot);
//       }
//     }
//     gridObjects.forEach((d) => canvas.add(d));
//     canvas.sendToBack(canvas.item(0));
//   };

//   // Load SVG when pendingPart changes
//   useEffect(() => {
//     if (!pendingPart || !fabricRef.current) return;

//     const canvas = fabricRef.current;
//     setIsLoading(true);

//     const loadSVG = async () => {
//       const fabric = await import("fabric").then((m) => m.fabric);

//       fabric.loadSVGFromURL(
//         pendingPart.src,
//         (objects: any[], options: any) => {
//           if (!objects || objects.length === 0) {
//             setIsLoading(false);
//             return;
//           }

//           // Strip SVG-native position from options so it doesn't override ours
//           const cleanOptions = { ...options, left: 0, top: 0 };
//           const obj = fabric.util.groupSVGElements(objects, cleanOptions);

//           // Scale to a reasonable default size
//           const maxDim = 150;
//           const objW = obj.width || maxDim;
//           const objH = obj.height || maxDim;
//           const scale = Math.min(maxDim / objW, maxDim / objH);

//           // Use hardcoded canvas dimensions (1000×600) — getWidth() can return
//           // 0 inside async callbacks before the canvas has fully measured itself.
//           const CANVAS_W = 1000;
//           const CANVAS_H = 600;
//           const randOffset = () => (Math.random() - 0.5) * 60;

//           obj.set({
//             left: CANVAS_W / 2 + randOffset(),
//             top: CANVAS_H / 2 + randOffset(),
//             scaleX: scale,
//             scaleY: scale,
//             originX: "center",
//             originY: "center",
//             cornerStyle: "circle",
//             cornerColor: "#d4a017",
//             cornerStrokeColor: "#8b5e1a",
//             borderColor: "#d4a017",
//             borderScaleFactor: 2,
//             cornerSize: 10,
//             transparentCorners: false,
//             hasRotatingPoint: true,
//           });
//           // Recalculate bounding box after position is set
//           obj.setCoords();

//           canvas.add(obj);
//           canvas.setActiveObject(obj);
//           canvas.requestRenderAll();
//           setObjectCount((prev) => prev + 1);
//           setHasSelection(true);
//           setIsLoading(false);
//           onPartAdded();
//         }
//       );
//     };

//     loadSVG();
//   }, [pendingPart, onPartAdded]);

//   // Delete selected object
//   const deleteSelected = useCallback(() => {
//     const canvas = fabricRef.current;
//     if (!canvas) return;
//     const active = canvas.getActiveObject();
//     if (active) {
//       canvas.remove(active);
//       canvas.discardActiveObject();
//       canvas.requestRenderAll();
//       setObjectCount((prev) => Math.max(0, prev - 1));
//     }
//   }, []);

//   // Bring forward
//   const bringForward = useCallback(() => {
//     const canvas = fabricRef.current;
//     if (!canvas) return;
//     const active = canvas.getActiveObject();
//     if (active) {
//       canvas.bringForward(active);
//       canvas.requestRenderAll();
//     }
//   }, []);

//   // Send backward
//   const sendBackward = useCallback(() => {
//     const canvas = fabricRef.current;
//     if (!canvas) return;
//     const active = canvas.getActiveObject();
//     if (active) {
//       canvas.sendBackwards(active);
//       canvas.requestRenderAll();
//     }
//   }, []);

//   // Clear canvas
//   const clearCanvas = useCallback(() => {
//     const canvas = fabricRef.current;
//     if (!canvas) return;
//     if (!confirm("Clear all objects from canvas?")) return;
//     // Remove all non-grid objects (skip circles with selectable: false)
//     const objects = canvas.getObjects().filter((o: any) => o.selectable !== false);
//     objects.forEach((o: any) => canvas.remove(o));
//     canvas.discardActiveObject();
//     canvas.requestRenderAll();
//     setObjectCount(0);
//   }, []);

//   // Export canvas as PNG
//   const exportPNG = useCallback(() => {
//     const canvas = fabricRef.current;
//     if (!canvas) return;
//     canvas.discardActiveObject();
//     canvas.requestRenderAll();

//     const dataURL = canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 });
//     const link = document.createElement("a");
//     link.href = dataURL;
//     link.download = "mandir-design.png";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }, []);

//   return (
//     <div className="flex flex-col flex-1 min-w-0 h-full">
//       {/* Canvas top toolbar */}
//       <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-stone-200 flex-wrap shrink-0">
//         {/* Object count badge */}
//         <span className="text-xs text-stone-400 mr-1 hidden sm:inline">
//           Objects: <span className="font-semibold text-stone-600">{objectCount}</span>
//         </span>

//         <div className="flex items-center gap-1.5 flex-wrap">
//           {/* Selection-dependent controls */}
//           <button
//             onClick={bringForward}
//             disabled={!hasSelection}
//             title="Bring Forward"
//             className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-stone-700"
//           >
//             ↑ Forward
//           </button>
//           <button
//             onClick={sendBackward}
//             disabled={!hasSelection}
//             title="Send Backward"
//             className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-stone-700"
//           >
//             ↓ Backward
//           </button>
//           <button
//             onClick={deleteSelected}
//             disabled={!hasSelection}
//             title="Delete Selected (Del)"
//             className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-red-600"
//           >
//             🗑 Delete
//           </button>
//         </div>

//         <div className="ml-auto flex items-center gap-1.5">
//           <button
//             onClick={clearCanvas}
//             className="px-2.5 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors font-medium text-stone-600"
//           >
//             Clear All
//           </button>
//           <button
//             onClick={exportPNG}
//             className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg transition-all font-semibold shadow-sm hover:shadow"
//           >
//             <span>⬇</span> Export PNG
//           </button>
//         </div>
//       </div>

//       {/* Canvas area */}
//       <div
//         ref={containerRef}
//         className="flex-1 overflow-auto bg-stone-200 relative flex items-start justify-start md:items-center md:justify-center p-4 min-h-0"
//       >
//         {isLoading && (
//           <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 border border-amber-200 rounded-full px-3 py-1.5 text-xs text-amber-700 shadow-sm">
//             <span className="animate-spin">⟳</span> Loading...
//           </div>
//         )}

//         {/* Fabric canvas wrapper: Cleaned up HTML so upper-canvas isn't clipped by overflow-hidden */}
//         <div
//           className="shadow-2xl rounded-sm border-2 border-amber-200/60"
//           style={{
//             background: "linear-gradient(135deg, #fdf8f0 0%, #fef6e4 100%)",
//           }}
//         >
//           <canvas
//             ref={canvasEl}
//             id="mandirCanvas"
//             width={1000}
//             height={600}
//           />
//         </div>

//         {/* Empty state hint */}
//         {objectCount === 0 && (
//           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//             <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-sm max-w-[240px]">
//               <p className="text-3xl mb-2">🛕</p>
//               <p className="text-sm font-semibold text-stone-600">Start Building Your Mandir</p>
//               <p className="text-xs text-stone-400 mt-1">Click any part in the left panel to add it to the canvas</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
