"use client";
import { useRef, useState, useEffect } from "react";
import LeafletMap, { LeafletMapHandle } from "./LeafletMap";
import CanvasDrawOverlay from "./CanvasDrawOverlay";

type LLPoint = { 
  lat: number; 
  lng: number; 
  name?: string;
  id?: string; // идентификатор
};


const getNextPointName = (index: number): string => {
  const letters = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ";
  return letters[index % letters.length];
};

export default function FieldCanvasWithMap({ onSave }: { onSave?: () => void }) {
  const mapRef = useRef<LeafletMapHandle | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [shapes, setShapes] = useState<LLPoint[][]>([]);
  const [currentPoints, setCurrentPoints] = useState<LLPoint[]>([]);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number } | null>(null);

  const findFieldRegion = (shape: LLPoint[]): { name: string; id: string } | null => {
    if (!mapRef.current && shape.length === 0) return null;
    
    const centerLat = shape.reduce((sum, p) => sum + p.lat, 0) / shape.length;
    const centerLng = shape.reduce((sum, p) => sum + p.lng, 0) / shape.length;
    
    return mapRef.current.findRegionForPoint(centerLat, centerLng);
  };

  const sendToBackend = (shape: LLPoint[]) => {
    const region = findFieldRegion(shape);
    
const shapeData = {
  points: shape.map((point, index) => ({
    lat: point.lat,
    lng: point.lng,
    name: point.name || getNextPointName(index),
    id: point.id || `point-${Date.now()}-${index}`
  })),
  region: region ? {
    name: region.name,
    id: region.id
  } : null,
  createdAt: new Date().toISOString()
};
    
    console.log("[FieldCanvasWithMap] Sending to backend:", shapeData);
    // на войну
    // fetch('/api/fields', { method: 'POST', body: JSON.stringify(shapeData) })
    
    return shapeData;
  };

  const handleSaveClick = () => {
    if (currentPoints.length >= 2) {
      const shapeWithNames = currentPoints.map((point, index) => ({
        ...point,
        name: point.name || getNextPointName(index),
  id: point.id || `point-${Date.now()}-${index}`
      }));
      setShapes([...shapes, shapeWithNames]);
      
      const region = findFieldRegion(shapeWithNames);
      if (region && mapRef.current) {
        mapRef.current.highlightRegion(region.id);
        console.log("[FieldCanvasWithMap] Field in region:", region.name);
      }
      
      sendToBackend(shapeWithNames);
      setCurrentPoints([]);
      setMouseCanvasPos(null);
      onSave?.();
      console.log("[FieldCanvasWithMap] Saved shape");
    }
    setDrawingMode(!drawingMode);
    if (drawingMode) {
      setCurrentPoints([]);
      setMouseCanvasPos(null);
    }
  };
  
useEffect(() => {
  if (!mapRef.current && shapes.length === 0) {
    mapRef.current?.clearRegionHighlight();
    return;
  }
  
  const regionIds = new Set<string>();
  shapes.forEach(shape => {
    const region = findFieldRegion(shape);
    if (region) {
      regionIds.add(region.id);
    }
  });
  
  if (regionIds.size > 0) {
    mapRef.current.highlightRegions(Array.from(regionIds));
  }
}, [shapes]);

  const clearAllShapes = () => {
    setShapes([]);
    setCurrentPoints([]);
    setMouseCanvasPos(null);
    mapRef.current?.clearRegionHighlight();
    console.log("[FieldCanvasWithMap] Cleared shapes");
  };
  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-100">
      <LeafletMap ref={mapRef} className="absolute inset-0" />

      <CanvasDrawOverlay
        mapRef={mapRef}
        drawingMode={drawingMode}
        currentPoints={currentPoints}
        setCurrentPoints={setCurrentPoints}
        shapes={shapes}
        setShapes={setShapes}
        mouseCanvasPos={mouseCanvasPos}
        setMouseCanvasPos={setMouseCanvasPos}
        onSave={onSave}
      />

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[9999] pointer-events-auto">
        <button
          onClick={handleSaveClick}
          className="w-12 h-12 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors pointer-events-auto"
        >
          {drawingMode ? "✓" : "✎"}
        </button>
        <button
          onClick={clearAllShapes}
          className="w-12 h-12 bg-gray-200 rounded-lg shadow-lg hover:bg-gray-300 transition-colors pointer-events-auto"
        >
          🗑
        </button>
      </div>
    </div>
  );
}