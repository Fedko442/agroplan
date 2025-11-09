import { useRef, useEffect, useCallback, useState } from "react";
import type { LeafletMapHandle } from "./LeafletMap";

type LLPoint = { 
  lat: number; 
  lng: number; 
  name?: string; 
  id?: string;
};

interface Props {
  mapRef: React.MutableRefObject<LeafletMapHandle | null>;
  drawingMode: boolean;
  currentPoints: LLPoint[];
  setCurrentPoints: (points: LLPoint[]) => void;
  shapes: LLPoint[][];
  setShapes: (shapes: LLPoint[][]) => void;
  mouseCanvasPos: { x: number; y: number } | null;
  setMouseCanvasPos: (pos: { x: number; y: number } | null) => void;
  onSave?: () => void;
}

export default function CanvasDrawOverlay({ 
  mapRef, 
  drawingMode, 
  currentPoints, 
  setCurrentPoints,
  shapes,
  setShapes,
  mouseCanvasPos,
  setMouseCanvasPos 
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const llToCanvas = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    return mapRef.current.latLngToContainerPoint(lat, lng);
  }, [mapRef]);

  const pointRadius = 5;
  const hitRadius = 10;
  
  const getPointName = useCallback((index: number): string => {
    const letters = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ";
    return letters[index % letters.length];
  }, []);
  
  const lineColor = "#8B4513";
  const fillColor = "#A0522D"; 
  const pointColor = "#654321"; 

  const getNearestPoint = useCallback((x: number, y: number): LLPoint | null => {
    const allPoints = [...currentPoints, ...shapes.flat()];
    
    for (const p of allPoints) {
      const pt = llToCanvas(p.lat, p.lng);
      const dx = pt.x - x;
      const dy = pt.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < hitRadius) {
        return p;
      }
    }
    
    return null;
  }, [currentPoints, shapes, llToCanvas, hitRadius]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    requestAnimationFrame(() => {
      if (!canvasRef.current) return;
 
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      
      if (shapes.length === 0 && currentPoints.length === 0) return;

      ctx.lineWidth = 3;
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      shapes.forEach((shape) => {
        if (shape.length < 2) return;
        
        const centeredShape = shape.map(p => llToCanvas(p.lat, p.lng));

        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.moveTo(centeredShape[0].x, centeredShape[0].y);
        for (let i = 1; i < centeredShape.length; i++) {
          ctx.lineTo(centeredShape[i].x, centeredShape[i].y);
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(centeredShape[0].x, centeredShape[0].y);
        for (let i = 1; i < centeredShape.length; i++) {
          ctx.lineTo(centeredShape[i].x, centeredShape[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        shape.forEach((point, index) => {
          const pt = centeredShape[index];
          const name = point.name || getPointName(index);

          ctx.fillStyle = pointColor;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pointRadius, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = "white";
          ctx.fillText(name, pt.x, pt.y);
        });
      });

      if (currentPoints.length > 0) {
        const centeredCurrent = currentPoints.map(p => llToCanvas(p.lat, p.lng));
        
        ctx.strokeStyle = lineColor;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(centeredCurrent[0].x, centeredCurrent[0].y);
        for (let i = 1; i < centeredCurrent.length; i++) {
          ctx.lineTo(centeredCurrent[i].x, centeredCurrent[i].y);
        }
        
        if (mouseCanvasPos) {
          ctx.lineTo(mouseCanvasPos.x, mouseCanvasPos.y);
          ctx.setLineDash([5, 5]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        currentPoints.forEach((point, index) => {
          const pt = centeredCurrent[index];
          const name = point.name || getPointName(index);
          
          ctx.fillStyle = pointColor;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pointRadius, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = "white";
          ctx.fillText(name, pt.x, pt.y);
        });
      }
    });
  }, [currentPoints, shapes, mouseCanvasPos, llToCanvas, pointRadius, lineColor, fillColor, pointColor, getPointName]);

  useEffect(() => {
    draw();
  }, [currentPoints, shapes, mouseCanvasPos, draw]);

  const [currentZoom, setCurrentZoom] = useState(4);
  const markersRef = useRef<any[]>([]);
  useEffect(() => {
    if (!mapRef.current?.mapRef?.current) return;
    
    const map = mapRef.current.mapRef.current;
    
    const redraw = () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      
      requestAnimationFrame(() => {
        if (canvasRef.current) {
          draw();
        }
      });
    };
    
    map.on("zoomstart movestart", () => {
    });
    
    map.on("zoom move", () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      requestAnimationFrame(() => {
        if (canvasRef.current) {
          draw();
        }
      });
    });
    
    map.on("moveend zoomend", redraw);
    
    setCurrentZoom(map.getZoom());
    
    return () => {
      map.off("zoomstart movestart zoom move moveend zoomend", redraw);
    };
  }, [draw]);
  
 
  useEffect(() => {
    if (!mapRef.current?.mapRef?.current) return;
    
    const map = mapRef.current.mapRef.current;
    
    markersRef.current.forEach(marker => {
      try {
        map.removeLayer(marker);
      } catch (e) {
      }
    });
    markersRef.current = [];
    
    if (currentZoom < 6 && shapes.length > 0) {

      import("leaflet").then((L) => {
        shapes.forEach((shape, shapeIndex) => {
          shape.forEach((point, pointIndex) => {
            if (!mapRef.current?.mapRef?.current) return;
            
            const blueIcon = L.icon({
              iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });
            
            const marker = L.marker([point.lat, point.lng], { icon: blueIcon })
              .addTo(map)
              .bindPopup(`Точка ${point.name || getPointName(pointIndex)}<br>Фигура ${shapeIndex + 1}`);
            
            markersRef.current.push(marker);
          });
        });
      }).catch(err => {
        console.error("Error loading Leaflet for markers:", err);
      });
    }
    
    return () => {
      markersRef.current.forEach(marker => {
        try {
          if (mapRef.current?.mapRef?.current) {
            mapRef.current.mapRef.current.removeLayer(marker);
          }
        } catch (e) {
        }
      });
      markersRef.current = [];
    };
  }, [currentZoom, shapes, mapRef, getPointName]);
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawingMode || !mapRef.current) return;
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const hit = getNearestPoint(x, y);
    
    if (currentPoints.length === 0) {
      if (hit) {
        setCurrentPoints([{ lat: hit.lat, lng: hit.lng, name: hit.name }]);
      } else {
        const ll = mapRef.current.containerPointToLatLng(x, y);
        if (mapRef.current.isPointInRussia && !mapRef.current.isPointInRussia(ll.lat, ll.lng)) {
          alert("Поля можно размещать только на территории России");
          return;
        }
        setCurrentPoints([{ lat: ll.lat, lng: ll.lng }]);
      }
      return;
    }

    if (hit) {
      const newShape: LLPoint[] = [...currentPoints, { lat: hit.lat, lng: hit.lng, name: hit.name }];
      setShapes([...shapes, newShape]);
      setCurrentPoints([]);
      setMouseCanvasPos(null);
      return;
    }
    
    const ll = mapRef.current.containerPointToLatLng(x, y);
    if (mapRef.current.isPointInRussia && !mapRef.current.isPointInRussia(ll.lat, ll.lng)) {
      alert("Поля можно размещать только на территории России");
      return;
    }
    setCurrentPoints([...currentPoints, { lat: ll.lat, lng: ll.lng }]);
  };

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawingMode) {
      setMouseCanvasPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseCanvasPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    setMouseCanvasPos(null);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ 
          position: "absolute", 
          inset: 0, 
          pointerEvents: "none", 
          zIndex: 10 
        }}
      />
      {drawingMode && (
        <div
          style={{ 
            position: "absolute", 
            inset: 0, 
            cursor: "crosshair",
            zIndex: 11,
            pointerEvents: "auto"
          }}
          onClick={handleClick}
          onMouseMove={handleMove}
          onMouseLeave={handleMouseLeave}
        />
      )}
    </>
  );
}