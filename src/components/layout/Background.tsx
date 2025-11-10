"use client";
import { useEffect, useRef } from "react";

export default function Background() {
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>();

  useEffect(() => {
    const strength = 50;
    const smooth = 0.08;

    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRef.current.x = nx * strength;
      targetRef.current.y = ny * strength;
    };

    const animate = () => {
      offsetRef.current.x += (targetRef.current.x - offsetRef.current.x) * smooth;
      offsetRef.current.y += (targetRef.current.y - offsetRef.current.y) * smooth;

      if (mapWrapperRef.current) {
        mapWrapperRef.current.style.transform = `translate(${offsetRef.current.x}px, ${offsetRef.current.y}px)`;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div style={{ 
      overflow: "hidden", 
      height: "100vh", 
      width: "100vw",
      position: "fixed", 
      top: 0,
      left: 0,
      backgroundColor: "#00242F",
      zIndex: 10
    }}>
      <div
        ref={mapWrapperRef}
        style={{
          position: "absolute",
          top: "-25%",
          left: "-25%",
          height: "150%",
          width: "150%",
          backgroundImage: "url('/backround.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}