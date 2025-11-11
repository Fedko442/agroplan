"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import MapContainer from "@/features/map/components/MapContainer";
import { useMap } from "@/features/map/context/MapContext";
import FieldModal from "./FieldModal";
import type { FieldData, LLPoint } from "../types";
import { 
  Pencil, 
  Check, 
  Trash2 
} from "lucide-react";

const getNextPointName = (index: number): string => {
  const letters = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ";
  return letters[index % letters.length];
};

interface FieldCanvasWithMapProps {
  onFieldCreated: (fieldData: FieldData) => void;
  onSave?: () => void;
  selectedField?: FieldData | null;
}

export default function FieldCanvasWithMap({ onFieldCreated, onSave, selectedField }: FieldCanvasWithMapProps) {
  const mapRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const { mapRef: contextMapRef } = useMap();
  
  const [drawingMode, setDrawingMode] = useState(false);
  const [shapes, setShapes] = useState<LLPoint[][]>([]);
  const [currentPoints, setCurrentPoints] = useState<LLPoint[]>([]);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number } | null>(null);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [pendingShape, setPendingShape] = useState<LLPoint[]>([]);
  const [pendingRegion, setPendingRegion] = useState<string>("");
  const [currentZoom, setCurrentZoom] = useState(4);

  useEffect(() => {
    contextMapRef.current = mapRef.current;
  }, [contextMapRef]);

  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    draw();
  }, []);

  const llToCanvas = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    return mapRef.current.latLngToContainerPoint(lat, lng);
  }, []);

  const canvasToLatLng = useCallback((x: number, y: number) => {
    if (!mapRef.current) return { lat: 0, lng: 0 };
    return mapRef.current.containerPointToLatLng(x, y);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (shapes.length === 0 && currentPoints.length === 0) return;

    const pointRadius = 5;
    const lineColor = "#8B4513";
    const fillColor = "rgba(160, 82, 45, 0.3)";
    const pointColor = "#654321";

    ctx.lineWidth = 3;
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    shapes.forEach((shape) => {
      if (shape.length < 2) return;
      
      const canvasPoints = shape.map(p => llToCanvas(p.lat, p.lng));

      const visiblePoints = canvasPoints.filter(point => 
        point.x >= -50 && point.x <= canvas.width + 50 && 
        point.y >= -50 && point.y <= canvas.height + 50
      );

      if (visiblePoints.length < 2) return;

      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.moveTo(visiblePoints[0].x, visiblePoints[0].y);
      for (let i = 1; i < visiblePoints.length; i++) {
        ctx.lineTo(visiblePoints[i].x, visiblePoints[i].y);
      }
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = lineColor;
      ctx.beginPath();
      ctx.moveTo(visiblePoints[0].x, visiblePoints[0].y);
      for (let i = 1; i < visiblePoints.length; i++) {
        ctx.lineTo(visiblePoints[i].x, visiblePoints[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      shape.forEach((point, index) => {
        const pt = canvasPoints[index];
        if (pt.x < -50 || pt.x > canvas.width + 50 || pt.y < -50 || pt.y > canvas.height + 50) return;
        
        const name = point.name || getNextPointName(index);

        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pointRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "white";
        ctx.fillText(name, pt.x, pt.y);
      });
    });

    if (currentPoints.length > 0) {
      const canvasCurrentPoints = currentPoints.map(p => llToCanvas(p.lat, p.lng));

      ctx.strokeStyle = lineColor;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(canvasCurrentPoints[0].x, canvasCurrentPoints[0].y);
      
      for (let i = 1; i < canvasCurrentPoints.length; i++) {
        ctx.lineTo(canvasCurrentPoints[i].x, canvasCurrentPoints[i].y);
      }
    
      if (mouseCanvasPos && currentPoints.length >= 1) {
        ctx.lineTo(mouseCanvasPos.x, mouseCanvasPos.y);
        ctx.setLineDash([5, 5]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      currentPoints.forEach((point, index) => {
        const pt = canvasCurrentPoints[index];
        if (pt.x < -50 || pt.x > canvas.width + 50 || pt.y < -50 || pt.y > canvas.height + 50) return;
        
        const name = point.name || getNextPointName(index);
        
        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pointRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "white";
        ctx.fillText(name, pt.x, pt.y);
      });
    }
  }, [currentPoints, shapes, mouseCanvasPos, llToCanvas]);

  const getShapeCenter = useCallback((shape: LLPoint[]) => {
    if (shape.length === 0) return null;
    
    const centerLat = shape.reduce((sum, p) => sum + p.lat, 0) / shape.length;
    const centerLng = shape.reduce((sum, p) => sum + p.lng, 0) / shape.length;
    
    return { lat: centerLat, lng: centerLng };
  }, []);

  const updateMarkers = useCallback(() => {
    if (!mapRef.current?.mapRef?.current) return;
    
    const map = mapRef.current.mapRef.current;

    markersRef.current.forEach(marker => {
      try {
        map.removeLayer(marker);
      } catch (e) {
        // Ignore errors
      }
    });
    markersRef.current = [];
  
    if (currentZoom < 6 && shapes.length > 0) {
      import("leaflet").then((L) => {
        shapes.forEach((shape, shapeIndex) => {
          if (!mapRef.current?.mapRef?.current) return;

          const center = getShapeCenter(shape);
          if (!center) return;
          
          const blueIcon = L.icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          
          const marker = L.marker([center.lat, center.lng], { icon: blueIcon })
            .addTo(map)
            .bindPopup(`Поле ${shapeIndex + 1}<br>Точек: ${shape.length}<br>Кликните для деталей`);
          
          markersRef.current.push(marker);
        });
      }).catch(err => {
        console.error("Error loading Leaflet for markers:", err);
      });
    }
  }, [currentZoom, shapes, getShapeCenter]);

  const getNearestPoint = useCallback((x: number, y: number): LLPoint | null => {
    const allPoints = [...currentPoints, ...shapes.flat()];
    const hitRadius = 10;
    
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
  }, [currentPoints, shapes, llToCanvas]);

  const checkShapeCompletion = useCallback((points: LLPoint[], clickX: number, clickY: number): boolean => {
    if (points.length < 3) return false;
    
    const firstPoint = points[0];
    const firstPointCanvas = llToCanvas(firstPoint.lat, firstPoint.lng);
    const hitRadius = 10;
    
    const distanceToFirst = Math.sqrt(
      Math.pow(firstPointCanvas.x - clickX, 2) + 
      Math.pow(firstPointCanvas.y - clickY, 2)
    );
    
    return distanceToFirst < hitRadius;
  }, [llToCanvas]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
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
        const ll = canvasToLatLng(x, y);
        if (mapRef.current.isPointInRussia && !mapRef.current.isPointInRussia(ll.lat, ll.lng)) {
          alert("Поля можно размещать только на территории России");
          return;
        }
        setCurrentPoints([{ lat: ll.lat, lng: ll.lng }]);
      }
      return;
    }

    if (currentPoints.length >= 3 && checkShapeCompletion(currentPoints, x, y)) {
      const completedShape = [...currentPoints];
      
      const region = findFieldRegion(completedShape);
      setPendingRegion(region?.name || "Неизвестный регион");
      setPendingShape(completedShape);
      setShowFieldModal(true);
      
      setCurrentPoints([]);
      setMouseCanvasPos(null);
      return;
    }

    if (hit) {
      const newShape: LLPoint[] = [...currentPoints, { lat: hit.lat, lng: hit.lng, name: hit.name }];
      
      const region = findFieldRegion(newShape);
      setPendingRegion(region?.name || "Неизвестный регион");
      setPendingShape(newShape);
      setShowFieldModal(true);
      
      setCurrentPoints([]);
      setMouseCanvasPos(null);
      return;
    }
    
    const ll = canvasToLatLng(x, y);
    if (mapRef.current.isPointInRussia && !mapRef.current.isPointInRussia(ll.lat, ll.lng)) {
      alert("Поля можно размещать только на территории России");
      return;
    }
    setCurrentPoints([...currentPoints, { lat: ll.lat, lng: ll.lng }]);
  }, [drawingMode, mapRef, currentPoints, shapes, getNearestPoint, checkShapeCompletion, canvasToLatLng]);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawingMode) {
      setMouseCanvasPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseCanvasPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [drawingMode]);

  const handleMouseLeave = useCallback(() => {
    setMouseCanvasPos(null);
  }, []);

  const findFieldRegion = useCallback((shape: LLPoint[]): { name: string; id: string } | null => {
    if (!mapRef.current || shape.length === 0) return null;
    
    const center = getShapeCenter(shape);
    if (!center) return null;
    
    return mapRef.current.findRegionForPoint(center.lat, center.lng);
  }, [getShapeCenter]);

  const sendToBackend = useCallback((shape: LLPoint[], fieldData: FieldData) => {
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
      fieldData: fieldData,
      createdAt: new Date().toISOString()
    };
    
    console.log("[FieldCanvasWithMap] Sending to backend:", shapeData);
    return shapeData;
  }, [findFieldRegion]);

  const handleSaveClick = () => {
    if (currentPoints.length >= 3) {
      const shapeWithNames = currentPoints.map((point, index) => ({
        ...point,
        name: point.name || getNextPointName(index),
        id: point.id || `point-${Date.now()}-${index}`
      }));
      
      const region = findFieldRegion(shapeWithNames);
      setPendingRegion(region?.name || "Неизвестный регион");
      setPendingShape(shapeWithNames);
      setShowFieldModal(true);
      
      setCurrentPoints([]);
      setMouseCanvasPos(null);
      console.log("[FieldCanvasWithMap] Manual save, opening modal");
    }
    
    setDrawingMode(!drawingMode);
    
    if (drawingMode && currentPoints.length > 0) {
      setCurrentPoints([]);
      setMouseCanvasPos(null);
    }
  };

  const handleFieldSave = useCallback((fieldData: FieldData) => {
    // Добавляем координаты первой точки в данные поля
    const fieldDataWithCoords = {
      ...fieldData,
      coordinates: pendingShape.length > 0 
        ? { lat: pendingShape[0].lat, lng: pendingShape[0].lng }
        : undefined
    };

    setShapes(prev => [...prev, pendingShape]);
    
    const region = findFieldRegion(pendingShape);
    if (region && mapRef.current) {
      mapRef.current.highlightRegion(region.id);
      console.log("[FieldCanvasWithMap] Field in region:", region.name);
    }
    
    sendToBackend(pendingShape, fieldDataWithCoords);
    
    // Передаем полные данные поля в родительский компонент
    onFieldCreated(fieldDataWithCoords);
    onSave?.();
    
    console.log("[FieldCanvasWithMap] Saved shape with field data:", fieldDataWithCoords);
    
    setShowFieldModal(false);
    setPendingShape([]);
    setPendingRegion("");
    setDrawingMode(false);
  }, [pendingShape, findFieldRegion, sendToBackend, onFieldCreated, onSave]);

  const handleFieldModalClose = useCallback(() => {
    setShowFieldModal(false);
    setPendingShape([]);
    setPendingRegion("");
  }, []);

  const clearAllShapes = useCallback(() => {
    setShapes([]);
    setCurrentPoints([]);
    setMouseCanvasPos(null);

    if (mapRef.current?.mapRef?.current) {
      markersRef.current.forEach(marker => {
        try {
          mapRef.current.mapRef.current.removeLayer(marker);
        } catch (e) {
          // Ignore errors
        }
      });
    }
    markersRef.current = [];
    
    mapRef.current?.clearRegionHighlight();
    console.log("[FieldCanvasWithMap] Cleared shapes");
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [updateCanvasSize]);

  useEffect(() => {
    if (!mapRef.current) return;
    
    const handleMapEvents = () => {
      const zoom = mapRef.current?.mapRef?.current?.getZoom() || 4;
      setCurrentZoom(zoom);
      requestAnimationFrame(draw);
    };
    
    const mapElement = mapRef.current?.mapRef?.current;
    if (mapElement) {
      mapElement.on("zoom move moveend zoomend", handleMapEvents);
      
      return () => {
        mapElement.off("zoom move moveend zoomend", handleMapEvents);
      };
    }
  }, [draw]);

  useEffect(() => {
    requestAnimationFrame(draw);
  }, [currentPoints, shapes, mouseCanvasPos, draw]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  useEffect(() => {
    if (!mapRef.current || shapes.length === 0) {
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
  }, [shapes, findFieldRegion]);

  useEffect(() => {
    return () => {
      if (mapRef.current?.mapRef?.current) {
        markersRef.current.forEach(marker => {
          try {
            mapRef.current.mapRef.current.removeLayer(marker);
          } catch (e) {
            // Ignore errors
          }
        });
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[400px] bg-gray-100">
      <MapContainer 
        ref={mapRef} 
        className="absolute inset-0" 
        onMapReady={updateCanvasSize}
      />

      <canvas
        ref={canvasRef}
        style={{ 
          position: "absolute", 
          inset: 0, 
          pointerEvents: "none", 
          zIndex: 1 
        }}
      />

      {drawingMode && (
        <div
          style={{ 
            position: "absolute", 
            inset: 0, 
            cursor: "crosshair",
            zIndex: 2,
            pointerEvents: "auto"
          }}
          onClick={handleClick}
          onMouseMove={handleMove}
          onMouseLeave={handleMouseLeave}
        />
      )}

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 pointer-events-auto">
        <button
          onClick={handleSaveClick}
          className={`w-12 h-12 rounded-lg shadow-lg transition-colors pointer-events-auto flex items-center justify-center ${
            drawingMode 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          title={drawingMode ? "Завершить рисование" : "Начать рисование"}
        >
          {drawingMode ? (
            <Check size={24} />
          ) : (
            <Pencil size={24} />
          )}
        </button>
        
        <button
          onClick={clearAllShapes}
          className="w-12 h-12 bg-gray-200 rounded-lg shadow-lg hover:bg-gray-300 transition-colors pointer-events-auto flex items-center justify-center"
          title="Очистить все фигуры"
        >
          <Trash2 size={24} />
        </button>
      </div>

      <FieldModal
        isOpen={showFieldModal}
        onClose={handleFieldModalClose}
        onSave={handleFieldSave}
        points={pendingShape}
        region={pendingRegion}
      />
      
      {shapes.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg z-10 pointer-events-none">
          <div className="text-sm font-medium">Сохраненные поля: {shapes.length}</div>
          <div className="text-xs opacity-80">
            {currentZoom < 6 ? "Маркеры отображены" : "Маркеры скрыты"}
          </div>
        </div>
      )}
    </div>
  );
}