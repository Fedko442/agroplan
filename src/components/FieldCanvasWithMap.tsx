"use client";
import { useRef, useState, useEffect, useCallback } from "react";

type LLPoint = { lat: number; lng: number };

export default function FieldCanvasWithMap({
  onSave,
}: {
  onSave?: () => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [drawingMode, setDrawingMode] = useState(false);
  const [hasActiveDrawing, setHasActiveDrawing] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const [shapes, setShapes] = useState<LLPoint[][]>([]);
  const [currentPoints, setCurrentPoints] = useState<LLPoint[]>([]);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number } | null>(null);

  const llHitRadius = 0.003;

  console.log("=== RENDER ===", {
    drawingMode,
    hasActiveDrawing,
    mapReady,
    mapRef: !!mapRef.current,
    containerSize
  });

  useEffect(() => {
    console.log("🔄 Loading Leaflet...");
    
    const initMap = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (!mapContainerRef.current) {
          console.log(" No map container");
          return;
        }

        console.log("🗺️ Creating Leaflet map...");
        const map = L.map(mapContainerRef.current, {
          center: [55.7558, 37.6173],
          zoom: 4,
          zoomControl: true,
          dragging: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true
        });

        tileLayerRef.current = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        ).addTo(map);

        mapRef.current = map;
        console.log("🗺️ Leaflet map created!");

        map.on('move zoom moveend resize', () => {
          if (mapReady) {
            draw();
          }
        });

        const forceResize = () => {
          console.log("Force resizing map...");
          setTimeout(() => {
            map.invalidateSize();
            console.log("Map size invalidated");
            
            setTimeout(() => {
              console.log("MAP READY!");
              setMapReady(true);
              draw();
            }, 100);
          }, 100);
        };

        forceResize();
        setTimeout(forceResize, 300);

      } catch (error) {
        console.error("Leaflet initialization error:", error);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        console.log("Removing map");
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Принудительное обновление размера карты когда контейнер готов
  useEffect(() => {
    if (mapRef.current && containerSize.width > 0 && containerSize.height > 0) {
      console.log("Container ready - forcing map resize");
      
      const resizeMap = () => {
        if (mapRef.current) {
          console.log("Invalidating map size...");
          mapRef.current.invalidateSize();
          
          setTimeout(() => {
            const mapContainer = mapContainerRef.current;
            if (mapContainer) {
              const mapRect = mapContainer.getBoundingClientRect();
              console.log("Map container size:", mapRect.width, "x", mapRect.height);
              
              if (mapRect.width > 0 && mapRect.height > 0 && !mapReady) {
                console.log("Map has valid size");
                setMapReady(true);
                draw();
              }
            }
          }, 100);
        }
      };
      
      resizeMap();
    }
  }, [containerSize, mapReady]);

  useEffect(() => {
    console.log("Setup container observer");
    
    const updateSize = () => {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        console.log("Container size:", width, "x", height);
        
        if (width > 0 && height > 0 && (containerSize.width !== width || containerSize.height !== height)) {
          setContainerSize({ width, height });
          
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = width;
            canvas.height = height;
            console.log(" Canvas updated to:", width, "x", height);
          }
        }
      }
    };

    updateSize();
    const timeout1 = setTimeout(updateSize, 100);
    const timeout2 = setTimeout(updateSize, 500);

    window.addEventListener("resize", updateSize);
    
    return () => {
      window.removeEventListener("resize", updateSize);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [containerSize]);

  const llToCanvas = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    try {
      const pt = mapRef.current.latLngToContainerPoint([lat, lng]);
      return { x: pt.x, y: pt.y };
    } catch (error) {
      console.error("llToCanvas error:", error);
      return { x: 0, y: 0 };
    }
  }, []);

  const canvasToLL = useCallback((canvasX: number, canvasY: number) => {
    if (!mapRef.current) return { lat: 0, lng: 0 };
    try {
      const ll = mapRef.current.containerPointToLatLng([canvasX, canvasY]);
      return { lat: ll.lat, lng: ll.lng };
    } catch (error) {
      console.error("canvasToLL error:", error);
      return { lat: 0, lng: 0 };
    }
  }, []);

  const getNearestPoint = useCallback((lat: number, lng: number): LLPoint | null => {
    const all = [...currentPoints, ...shapes.flat()];
    return all.find((p) => Math.hypot(p.lat - lat, p.lng - lng) < llHitRadius) ?? null;
  }, [currentPoints, shapes]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !mapRef.current || canvas.width === 0 || canvas.height === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 10;
    ctx.strokeStyle = "#FF0000";
    ctx.fillStyle = "#FF0000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    shapes.forEach((shape) => {
      if (shape.length < 2) return;
      const points = shape.map(pt => llToCanvas(pt.lat, pt.lng));
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach((p, i) => i > 0 && ctx.lineTo(p.x, p.y));
      ctx.stroke();

      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 10;
      });
    });

    if (currentPoints.length > 0) {
      const points = currentPoints.map(pt => llToCanvas(pt.lat, pt.lng));
      if (points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach((p, i) => i > 0 && ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }

      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 10;
      });

      if (mouseCanvasPos && points.length > 0) {
        const last = points[points.length - 1];
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(mouseCanvasPos.x, mouseCanvasPos.y);
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [shapes, currentPoints, mouseCanvasPos, llToCanvas]);

  useEffect(() => {
    if (mapReady) draw();
  }, [shapes, currentPoints, mouseCanvasPos, draw, mapReady]);

  useEffect(() => {
    setHasActiveDrawing(currentPoints.length > 0);
  }, [currentPoints.length]);

  const saveCurrentShape = () => {
    if (currentPoints.length >= 2) {
      setShapes(prev => [...prev, [...currentPoints]]);
      setCurrentPoints([]);
      setMouseCanvasPos(null);
      setDrawingMode(false);
      onSave?.();
    }
  };

  const clearAllShapes = () => {
    setShapes([]);
    setCurrentPoints([]);
    setMouseCanvasPos(null);
    setHasActiveDrawing(false);
  };

  const handleDrawingButtonClick = () => {
    if (drawingMode && hasActiveDrawing) {
      saveCurrentShape();
    } else {
      const newDrawingMode = !drawingMode;
      setDrawingMode(newDrawingMode);
      if (!drawingMode) {
        setCurrentPoints([]);
        setMouseCanvasPos(null);
      }
    }
  };

  const getEventCoordinates = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawingMode || !mapRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();

    const coords = getEventCoordinates(e);
    const ll = canvasToLL(coords.x, coords.y);
    const hit = getNearestPoint(ll.lat, ll.lng);

    if (currentPoints.length === 0) {
      setCurrentPoints([hit || ll]);
    } else if (hit) {
      setShapes(prev => [...prev, [...currentPoints, hit]]);
      setCurrentPoints([]);
      setMouseCanvasPos(null);
      setDrawingMode(false);
    } else {
      setCurrentPoints(prev => [...prev, ll]);
    }
  };

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawingMode) return;
    setMouseCanvasPos(getEventCoordinates(e));
  };

  const handleContainerMouseLeave = () => {
    if (drawingMode) setMouseCanvasPos(null);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-[400px] bg-gray-100"
      style={{ height: '100%', minHeight: '400px' }}
      onClick={handleContainerClick}
      onMouseMove={handleContainerMouseMove}
      onMouseLeave={handleContainerMouseLeave}
    >
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
          <div className="text-lg">
            {mapRef.current ? "Настройка карты..." : "Загрузка карты..."}
          </div>
        </div>
      )}

      <div 
        ref={mapContainerRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ zIndex: 1, pointerEvents: "auto" }}
      />

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ zIndex: 2, pointerEvents: "none" }}
      />

      {drawingMode && (
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: 3, cursor: "crosshair", backgroundColor: "rgba(0,0,0,0.01)" }}
          onClick={(e) => {
            handleContainerClick(e as any);
          }}
        />
      )}

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-1001">
        <button
          onClick={handleDrawingButtonClick}
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors shadow-lg ${
            drawingMode && hasActiveDrawing
              ? "bg-green-600 hover:bg-green-700 text-white"
              : drawingMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-white hover:bg-gray-100 text-gray-800"
          }`}
          title={drawingMode && hasActiveDrawing ? "Сохранить" : drawingMode ? "Рисование" : "Начать рисование"}
        >
          <span className="text-xl">
            {drawingMode && hasActiveDrawing ? "✓" : "✎"}
          </span>
        </button>

        <button
          onClick={clearAllShapes}
          className="w-12 h-12 bg-white hover:bg-gray-100 text-gray-800 rounded-lg flex items-center justify-center shadow-lg"
          title="Очистить"
        >
          <span className="text-xl">🗑</span>
        </button>
      </div>
    </div>
  );
}
