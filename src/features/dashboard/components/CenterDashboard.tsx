"use client";
import FieldCanvasWithMap from "@/features/fields/components/FieldCanvasWithMap";
import FieldInfoTab from "@/features/fields/components/FieldInfoTab";
import FieldNotesTab from "@/features/fields/components/FieldNotesTab";
import WeatherTab from "@/features/weather/components/WeatherTab";
import SatelliteTab from "@/features/analytics/components/SatelliteTab";
import FieldList from "@/features/fields/components/FieldList";
import { useState } from "react";

export default function CenterDashboard() {
  const [activeTab, setActiveTab] = useState("info");
  const [selectedField, setSelectedField] = useState(1);
  const [notesTab, setNotesTab] = useState("recommendations");
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex flex-col items-center justify-start pt-20 md:pt-24 lg:pt-28 xl:pt-32 2xl:pt-36 3xl:pt-44 pb-10 md:pb-16">
      <div className="w-full px-2 sm:px-4 md:px-6">
        <div className="
            flex flex-col lg:flex-row
            items-stretch
            justify-start lg:justify-between
            w-full
            max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2400px]
            gap-4 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 3xl:gap-16
            mx-auto
            transition-all duration-300
          ">

          <div className="bg-[#172B3E] rounded-2xl p-4 sm:p-5 md:p-7 3xl:p-9 w-full lg:w-[32%] xl:w-[33%] 2xl:w-[34%] min-h-[410px] md:min-h-[510px] xl:min-h-[560px] 2xl:min-h-[610px] 3xl:min-h-[710px] pointer-events-auto shadow-2xl border border-[#2D4A62] transition-all duration-300">
            <div className="flex justify-between items-center mb-4 sm:mb-5 3xl:mb-7 relative">
  <h2 className="text-[#E8F4FF] text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl 3xl:text-4xl font-semibold">
    Обзор поля
  </h2>

  <div className="relative flex items-center">
    <button
      onClick={() => setShowHelp(!showHelp)}
      onMouseEnter={() => setShowHelp(true)}
      onMouseLeave={() => setShowHelp(false)}
      className="w-8 h-8 bg-[#2D4A62] rounded-full flex items-center justify-center text-[#E8F4FF] hover:bg-[#3A5A7A] transition-colors ml-2"
      title="Помощь по работе с картой"
    >
      <span className="text-sm font-bold">?</span>
    </button>

   {showHelp && (
  <div
    className="
      absolute 
      w-[350px]
      p-4 bg-blue-600 text-white rounded-lg shadow-lg pointer-events-none z-[9999]
      bottom-full left-full ml-2 mb-2
      max-[1024px]:left-auto
      max-[1024px]:right-full
      max-[1024px]:mr-2
      max-[1024px]:bottom-full
      max-[1024px]:mb-2
    "
  >
    <div className="text-sm font-medium mb-2">Работа с картой полей:</div>
    <ul className="text-xs space-y-1">
      <li>•Кликай по карте, чтобы поставить точки границы поля.
           Каждая точка соединяется линией с предыдущей•</li>
    </ul>
  </div>
)}

  </div>
</div>

            <div className="relative w-full h-[55%] sm:h-[60%] md:h-[65%] flex items-center justify-center overflow-hidden bg-[#0F1F2F] rounded-xl border border-[#2D4A62] min-h-[250px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[350px] xl:min-h-[380px] mb-4 sm:mb-5 md:mb-6">
              <FieldCanvasWithMap />
            </div>
            
            <FieldList 
              selectedField={selectedField}
              onFieldSelect={setSelectedField}
            />
          </div>

          <div className="bg-[#172B3E] rounded-2xl p-3 sm:p-4 md:p-6 3xl:p-8 w-full lg:w-[32%] xl:w-[33%] 2xl:w-[34%] min-h-[400px] md:min-h-[500px] xl:min-h-[550px] 2xl:min-h-[600px] 3xl:min-h-[700px] pointer-events-auto shadow-2xl border border-[#2D4A62] transition-all duration-300">
            <div className="flex justify-center mb-3 sm:mb-4 3xl:mb-6 border-b border-[#2D4A62]">
              <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`flex-shrink-0 pb-2 px-2 sm:px-3 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-2xl font-medium transition-colors ${
                    activeTab === "info" 
                      ? "text-[#E8F4FF] border-b-2 border-[#3388ff]" 
                      : "text-[#8BA4B8] hover:text-[#E8F4FF]"
                  }`}
                >
                  📋 Информация
                </button>
                <button
                  onClick={() => setActiveTab("weather")}
                  className={`flex-shrink-0 pb-2 px-2 sm:px-3 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-2xl font-medium transition-colors ${
                    activeTab === "weather" 
                      ? "text-[#E8F4FF] border-b-2 border-[#3388ff]" 
                      : "text-[#8BA4B8] hover:text-[#E8F4FF]"
                  }`}
                >
                  🌤️ Погода
                </button>
                <button
                  onClick={() => setActiveTab("satellite")}
                  className={`flex-shrink-0 pb-2 px-2 sm:px-3 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-2xl font-medium transition-colors ${
                    activeTab === "satellite" 
                      ? "text-[#E8F4FF] border-b-2 border-[#3388ff]" 
                      : "text-[#8BA4B8] hover:text-[#E8F4FF]"
                  }`}
                >
                  🛰️ Спутник
                </button>
              </div>
            </div>

            <div className="bg-[#0F1F2F] rounded-xl h-[70%] lg:h-[80%] xl:h-[70%] border border-[#2D4A62] p-3 sm:p-4 overflow-auto">
              {activeTab === "info" && <FieldInfoTab />}
              {activeTab === "weather" && <WeatherTab />}
              {activeTab === "satellite" && <SatelliteTab />}
            </div>
          </div>
          <div className="bg-[#172B3E] rounded-2xl p-3 sm:p-4 md:p-6 3xl:p-8 w-full lg:w-[32%] xl:w-[33%] 2xl:w-[34%] min-h-[400px] md:min-h-[500px] xl:min-h-[550px] 2xl:min-h-[600px] 3xl:min-h-[700px] pointer-events-auto shadow-2xl border border-[#2D4A62] transition-all duration-300">
            <div className="flex justify-center mb-3 sm:mb-4 3xl:mb-6 border-b border-[#2D4A62]">
              <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
                <button
                  onClick={() => setNotesTab("recommendations")}
                  className={`flex-shrink-0 pb-2 px-2 sm:px-3 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-2xl font-medium transition-colors ${
                    notesTab === "recommendations" 
                      ? "text-[#E8F4FF] border-b-2 border-[#3388ff]" 
                      : "text-[#8BA4B8] hover:text-[#E8F4FF]"
                  }`}
                >
                  💡 Рекомендации
                </button>
                <button
                  onClick={() => setNotesTab("notes")}
                  className={`flex-shrink-0 pb-2 px-2 sm:px-3 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-2xl font-medium transition-colors ${
                    notesTab === "notes" 
                      ? "text-[#E8F4FF] border-b-2 border-[#3388ff]" 
                      : "text-[#8BA4B8] hover:text-[#E8F4FF]"
                  }`}
                >
                  📝 Заметки
                </button>
              </div>
            </div>

            <div className="bg-[#0F1F2F] rounded-xl h-[70%] lg:h-[80%] xl:h-[70%] border border-[#2D4A62] p-3 sm:p-4 overflow-auto">
              {notesTab === "recommendations" && (
                <div className="h-full flex flex-col justify-center">
                  <div className="space-y-2 sm:space-y-3 md:space-y-4 text-xs sm:text-sm md:text-base lg:text-sm xl:text-lg 3xl:text-2xl w-full h-[90%] flex flex-col justify-between">
                    <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg text-green-400 w-full h-[18%] flex items-center">
                      <span className="ml-2">✅ Благоприятный период для посева картофеля</span>
                    </div>
                    <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg text-blue-400 w-full h-[18%] flex items-center">
                      <span className="ml-2">💧 Рекомендуем полив через 2 дня</span>
                    </div>
                    <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg text-yellow-400 w-full h-[18%] flex items-center">
                      <span className="ml-2">🌾 Подкормка азотными удобрениями</span>
                    </div>
                    <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg text-green-400 w-full h-[18%] flex items-center">
                      <span className="ml-2">📈 Высокая прогнозируемая урожайность</span>
                    </div>
                    <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg text-blue-400 w-full h-[18%] flex items-center">
                      <span className="ml-2">🔄 После уборки - посев озимых зерновых</span>
                    </div>
                  </div>
                </div>
              )}
              {notesTab === "notes" && <FieldNotesTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}