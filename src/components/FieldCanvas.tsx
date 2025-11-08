"use client";
import { useRef, useState, useEffect } from "react";

type Point = { x: number; y: number };

export default function CanvasDraw() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [shapes, setShapes] = useState<Point[][]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [showHint, setShowHint] = useState(false);

  const radius = 5;
  const hitRadius = 10;

  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        setCenterOffset({ x: centerX, y: centerY });
        
        draw();
      }
    };
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, [shapes, currentPoints, mousePos]);

  const toCenteredCoords = (points: Point[]): Point[] => {
    return points.map(p => ({
      x: p.x + centerOffset.x,
      y: p.y + centerOffset.y
    }));
  };

  const fromCenteredCoords = (x: number, y: number): Point => {
    return {
      x: x - centerOffset.x,
      y: y - centerOffset.y
    };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#3b2a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";

    for (const shape of shapes) {
      if (shape.length < 2) continue;
      const centeredShape = toCenteredCoords(shape);
      
      ctx.beginPath();
      ctx.moveTo(centeredShape[0].x, centeredShape[0].y);
      for (let i = 1; i < centeredShape.length; i++) 
        ctx.lineTo(centeredShape[i].x, centeredShape[i].y);
      ctx.closePath();
      ctx.stroke();

      for (const p of centeredShape) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (currentPoints.length > 0) {
      const centeredCurrent = toCenteredCoords(currentPoints);
      
      ctx.beginPath();
      ctx.moveTo(centeredCurrent[0].x, centeredCurrent[0].y);
      for (let i = 1; i < centeredCurrent.length; i++) {
        ctx.lineTo(centeredCurrent[i].x, centeredCurrent[i].y);
      }
      if (mousePos) {
        const centeredMouse = toCenteredCoords([fromCenteredCoords(mousePos.x, mousePos.y)])[0];
        ctx.lineTo(centeredMouse.x, centeredMouse.y);
      }
      ctx.stroke();

      for (const p of centeredCurrent) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  useEffect(draw, [shapes, currentPoints, mousePos, centerOffset]);

  const getNearestPoint = (x: number, y: number): Point | null => {
    const clickPoint = fromCenteredCoords(x, y);
    const allPoints = [...currentPoints, ...shapes.flat()];
    
    for (const p of allPoints) {
      const dx = p.x - clickPoint.x;
      const dy = p.y - clickPoint.y;
      if (Math.sqrt(dx * dx + dy * dy) < hitRadius) return p;
    }
    return null;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hit = getNearestPoint(x, y);

    if (currentPoints.length === 0) {
      if (hit) {
        setCurrentPoints([{ x: hit.x, y: hit.y }]);
      } else {
        const newPoint = fromCenteredCoords(x, y);
        setCurrentPoints([{ x: newPoint.x, y: newPoint.y }]);
      }
      return;
    }

    if (hit) {
      const newShape = [...currentPoints, { x: hit.x, y: hit.y }];
      setShapes((s) => [...s, newShape]);
      setCurrentPoints([]);
      return;
    }

    const newPoint = fromCenteredCoords(x, y);
    setCurrentPoints((p) => [...p, { x: newPoint.x, y: newPoint.y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => setMousePos(null);

  const handleClear = () => {
    setShapes([]);
    setCurrentPoints([]);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[3/2] max-w-[800px] mx-auto"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-gray-600 rounded-xl cursor-crosshair"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      <button
        onClick={handleClear}
        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-lg md:text-base z-40"
        title="Очистить"
      >
        ✕
      </button>

      <button
        onClick={() => setShowHint((v) => !v)}
        onMouseEnter={() => setShowHint(true)}
        className="absolute top-2 left-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-lg md:text-base z-40"
        title="Подсказка"
      >
        ?
      </button>

      {showHint && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-center p-4 rounded-lg z-50"
          onMouseLeave={() => setShowHint(false)}
          onClick={() => setShowHint(false)}
          style={{ pointerEvents: "auto" }}
        >
          <div className="text-sm md:text-base">
            <p>ЛКМ — ставь точки</p>
            <p>Кликни по существующей точке, чтобы начать от неё</p>
            <p>Соединись с другой точкой — фигура замкнётся</p>
            <p>✕ — очистить поле</p>
          </div>
        </div>
      )}
    </div>
  );
}