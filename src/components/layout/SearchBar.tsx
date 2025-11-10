"use client";
import { useState } from "react";
import { useMap } from "@/features/map/context/MapContext";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { mapRef } = useMap();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    if (!mapRef.current) {
      alert("Карта еще загружается. Подождите немного и попробуйте снова.");
      return;
    }
    
    setIsSearching(true);
    
    try {
      const result = await mapRef.current.searchCity(searchQuery.trim());
      
      if (result) {
        mapRef.current.flyToCity(result.lat, result.lng, 12);
        console.log("[SearchBar] Found city:", result.name);
        setSearchQuery("");
      } else {
        alert("Город не найден. Попробуйте другой запрос.");
      }
    } catch (error) {
      console.error("[SearchBar] Search error:", error);
      alert("Ошибка при поиске города");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <div className="fixed top-[3%] left-5 md:left-[10%] w-[90%] md:w-4/5 h-12 md:h-14 bg-[#162A3D] rounded-xl shadow-lg flex items-center px-3 md:px-4 z-19">
      <button className="bg-transparent border-none cursor-pointer p-1 md:p-2 rounded flex flex-col gap-0.5 transition-colors hover:bg-[#2D4A62] min-w-8">
        <div className="w-4 md:w-5 h-0.5 bg-[#E8F4FF]"></div>
        <div className="w-4 md:w-5 h-0.5 bg-[#E8F4FF]"></div>
        <div className="w-4 md:w-5 h-0.5 bg-[#E8F4FF]"></div>
      </button>

      <span className="ml-2 md:ml-3 text-sm md:text-lg font-semibold text-[#E8F4FF] whitespace-nowrap hidden xl:block">
        АгроПланнер
      </span>

      <form 
        onSubmit={handleSearch}
        className="absolute left-1/2 transform -translate-x-1/2 flex items-center w-2/3 md:w-[65%] lg:w-[70%] xl:w-[65%] max-w-2xl"
      >
        <div className="relative flex items-center w-full">
          <input
            type="text"
            placeholder="Поиск города..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSearching}
            className="w-full py-1.5 md:py-2 pr-8 md:pr-10 pl-3 md:pl-4 border border-[#2D4A62] rounded-full outline-none bg-[#0F1F2F] text-[#E8F4FF] text-sm md:text-base placeholder-[#8BA4B8] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-4 md:right-3 w-3.5 md:w-4 h-3.5 md:h-4 border border-[#8BA4B8] rounded-full flex items-center justify-center cursor-pointer hover:border-[#E8F4FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Найти город"
          >
            <div className="w-1.5 md:w-2 h-0.5 bg-[#8BA4B8] transform rotate-45 absolute top-2.5 md:top-3 left-2.5 md:left-3"></div>
          </button>
        </div>
      </form>
      <button className="ml-auto w-8 h-8 md:w-10 md:h-10 rounded-full border-none bg-[#2D4A62] cursor-pointer flex items-center justify-center transition-colors hover:bg-[#3A5A7A] flex-shrink-0">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="md:w-5 md:h-5"
        >
          <path
            d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
            fill="#E8F4FF"
          />
          <path
            d="M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
            fill="#E8F4FF"
          />
        </svg>
      </button>
    </div>
  );
}