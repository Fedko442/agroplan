"use client";
import { useState, useRef, useEffect } from "react";
import { useMap } from "@/features/map/context/MapContext";
import Link from "next/link";
import { Menu, X, User, History, Calculator, Search } from "lucide-react";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { mapRef } = useMap();
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        burgerRef.current && 
        !burgerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <>
      <div className="fixed top-[3%] left-5 md:left-[10%] w-[90%] md:w-4/5 h-12 md:h-14 bg-[#162A3D] rounded-xl shadow-lg flex items-center px-3 md:px-4 z-19">
        <div className="relative">
          <button 
            ref={burgerRef}
            className="bg-transparent border-none cursor-pointer p-2 rounded transition-colors hover:bg-[#2D4A62] w-10 h-10 flex items-center justify-center"
            onClick={toggleMenu}
            onMouseEnter={openMenu}
            aria-label="Открыть меню"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-[#E8F4FF]" />
            ) : (
              <Menu className="w-5 h-5 text-[#E8F4FF]" />
            )}
          </button>

          <div 
            ref={menuRef}
            className="hidden lg:block absolute top-full left-0 mt-2 z-40"
            onMouseLeave={closeMenu}
          >
            <div className={`w-64 bg-[#162A3D] rounded-xl shadow-lg border border-[#2D4A62] transform transition-all duration-200 ease-in-out ${
              isMenuOpen 
                ? 'opacity-100 visible translate-y-0' 
                : 'opacity-0 invisible -translate-y-2'
            }`}>
              <nav className="p-2">
                <ul className="space-y-1">
                  <li>
                    <Link 
                      href="/profile" 
                      className="flex items-center p-3 text-[#8BA4B8] hover:bg-[#2D4A62] hover:text-[#E8F4FF] rounded-lg transition-colors text-sm"
                      onClick={closeMenu}
                    >
                      <User className="w-4 h-4 mr-2" />
                      <span>Профиль</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/culture-history" 
                      className="flex items-center p-3 text-[#8BA4B8] hover:bg-[#2D4A62] hover:text-[#E8F4FF] rounded-lg transition-colors text-sm"
                      onClick={closeMenu}
                    >
                      <History className="w-4 h-4 mr-2" />
                      <span>История культур</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/economic-calculator" 
                      className="flex items-center p-3 text-[#8BA4B8] hover:bg-[#2D4A62] hover:text-[#E8F4FF] rounded-lg transition-colors text-sm"
                      onClick={closeMenu}
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      <span>Экономический калькулятор</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

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
              className="w-full py-1.5 md:py-2 pr-10 md:pr-12 pl-3 md:pl-4 border border-[#2D4A62] rounded-full outline-none bg-[#0F1F2F] text-[#E8F4FF] text-sm md:text-base placeholder-[#8BA4B8] disabled:opacity-50"
            />
<button
  type="submit"
  disabled={isSearching || !searchQuery.trim()}
  className="absolute right-3 md:right-4 w-6 h-6 md:w-7 md:h-7 flex items-center justify-center cursor-pointer text-[#8BA4B8] hover:text-[#E8F4FF] transition-colors disabled:opacity-30 disabled:cursor-default"
  title="Найти город"
>
  <Search className="w-4 h-4 md:w-5 md:h-5" />
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

      <div className={`lg:hidden fixed top-0 left-0 z-30 w-full h-full bg-black bg-opacity-80 transform transition-opacity duration-300 ease-in-out ${
        isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div 
          ref={menuRef}
          className={`w-4/5 max-w-sm h-full bg-[#162A3D] shadow-xl transform transition-transform duration-300 ease-in-out border-r border-[#2D4A62] ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-[#2D4A62]">
            <h2 className="text-lg font-semibold text-[#E8F4FF]">Меню</h2>
            <button
              onClick={closeMenu}
              className="absolute top-4 right-4 text-[#8BA4B8] hover:text-[#E8F4FF] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/profile" 
                  className="flex items-center p-3 text-[#8BA4B8] hover:bg-[#2D4A62] hover:text-[#E8F4FF] rounded-lg transition-colors"
                  onClick={closeMenu}
                >
                  <User className="w-5 h-5 mr-3" />
                  <span>Профиль</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/culture-history" 
                  className="flex items-center p-3 text-[#8BA4B8] hover:bg-[#2D4A62] hover:text-[#E8F4FF] rounded-lg transition-colors"
                  onClick={closeMenu}
                >
                  <History className="w-5 h-5 mr-3" />
                  <span>История культур</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/economic-calculator" 
                  className="flex items-center p-3 text-[#8BA4B8] hover:bg-[#2D4A62] hover:text-[#E8F4FF] rounded-lg transition-colors"
                  onClick={closeMenu}
                >
                  <Calculator className="w-5 h-5 mr-3" />
                  <span>Экономический калькулятор</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-20"
          onClick={closeMenu}
        />
      )}
    </>
  );
}