"use client";
import { MapProvider } from "@/features/map/context/MapContext";
import FieldCanvasWithMap from "@/features/fields/components/FieldCanvasWithMap";
import Background from "@/components/layout/Background";
import SearchBar from "@/components/layout/SearchBar";

export default function FieldsPage() {
  return (
    <MapProvider>
      <main className="min-h-screen w-screen relative overflow-x-hidden" style={{ zIndex: 1 }}>
        <Background />
        <div className="relative z-20">
          <FieldCanvasWithMap />
        </div>
        <SearchBar />
      </main>
    </MapProvider>
  );
}