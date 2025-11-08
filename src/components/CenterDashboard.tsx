"use client";

import FieldCanvasWithMap from "./FieldCanvasWithMap";
import { useState, useRef, useEffect } from "react";

const mockFields = [
  { id: 1, name: "Поле Северное", area: "50 га", crop: "Картофель", status: "active" },
  { id: 2, name: "Поле Южное", area: "30 га", crop: "Пшеница", status: "planned" },
  { id: 3, name: "Поле Западное", area: "25 га", crop: "Ячмень", status: "active" },
];

export default function CenterDashboard() {
  const [activeTab, setActiveTab] = useState("info");
  const [selectedField, setSelectedField] = useState(1);
  const [notesTab, setNotesTab] = useState("recommendations");
  const [userNotes, setUserNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); 

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setUserNotes(newValue);
    setHasUnsavedChanges(newValue !== savedNotes);
  };

  const handleSaveNotes = () => {
    if (hasUnsavedChanges) {
      setSavedNotes(userNotes);
      setHasUnsavedChanges(false);
      console.log("Заметки сохранены:", userNotes);
      alert("Заметки сохранены!");
    }
  };

  useEffect(() => {
    setHasUnsavedChanges(userNotes !== savedNotes);
  }, [userNotes, savedNotes]);

  return (
    <div className="flex flex-col items-center justify-start z-30 pt-20 md:pt-24 lg:pt-28 xl:pt-32 2xl:pt-36 3xl:pt-44 pb-10 md:pb-16">

      <div className="w-full px-2 sm:px-4 md:px-6">
        <div
          className="
            flex flex-col lg:flex-row
            items-stretch
            justify-start lg:justify-between
            w-full
            max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2400px]
            gap-4 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 3xl:gap-16
            mx-auto
            transition-all duration-300
          "
        >

          <div className="bg-[#172B3E] rounded-2xl p-4 sm:p-5 md:p-7 3xl:p-9 w-full lg:w-[32%] xl:w-[33%] 2xl:w-[34%] min-h-[410px] md:min-h-[510px] xl:min-h-[560px] 2xl:min-h-[610px] 3xl:min-h-[710px] pointer-events-auto shadow-2xl border border-[#2D4A62] transition-all duration-300">
            <div className="flex justify-between items-center mb-4 sm:mb-5 3xl:mb-7">
              <h2 className="text-[#E8F4FF] text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl 3xl:text-4xl font-semibold">Обзор поля</h2>
            </div>

            <div className="relative w-full h-[55%] sm:h-[60%] md:h-[65%] flex items-center justify-center overflow-hidden bg-[#0F1F2F] rounded-xl border border-[#2D4A62] min-h-[250px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[350px] xl:min-h-[380px] mb-4 sm:mb-5 md:mb-6">
              <FieldCanvasWithMap />
            </div>
            <div className="mb-4 sm:mb-5 md:mb-6">
              <h3 className="text-[#E8F4FF] text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl 3xl:text-2xl font-semibold mb-2 sm:mb-3">Мои поля</h3>
              
              <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2 sm:pb-3 scrollbar-thin scrollbar-thumb-[#2D4A62] scrollbar-track-[#0F1F2F]">
                {mockFields.map((field) => (
                  <div
                    key={field.id}
                    onClick={() => setSelectedField(field.id)}
                    className={`flex-shrink-0 w-28 sm:w-32 md:w-36 lg:w-40 xl:w-44 2xl:w-48 3xl:w-52 p-2 sm:p-3 rounded-lg cursor-pointer transition-all border-2 ${
                      selectedField === field.id
                        ? "bg-[#2D4A62] border-[#E8F4FF]"
                        : "bg-[#0F1F2F] border-[#2D4A62] hover:border-[#8BA4B8]"
                    }`}
                  >
                    <div className="text-[#E8F4FF] font-medium text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg 3xl:text-xl truncate">
                      {field.name}
                    </div>
                    <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-lg mt-1">
                      {field.area}
                    </div>
                    <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-lg truncate">
                      {field.crop}
                    </div>
                    <div className={`text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-lg mt-1 ${
                      field.status === 'active' ? 'text-green-400' :
                      field.status === 'planned' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {field.status === 'active' ? 'Активно' :
                       field.status === 'planned' ? 'Планируется' : 'Завершено'}
                    </div>
                  </div>
                ))}
                
                <div
                  className="flex-shrink-0 w-28 sm:w-32 md:w-36 lg:w-40 xl:w-44 2xl:w-48 3xl:w-52 p-2 sm:p-3 rounded-lg cursor-pointer transition-all border-2 border-dashed border-[#2D4A62] hover:border-[#E8F4FF] hover:bg-[#2D4A62] flex flex-col items-center justify-center"
                  onClick={() => console.log("Создать новое поле")}
                >
                  <div className="text-[#8BA4B8] text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl 3xl:text-4xl mb-1">+</div>
                  <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-xl text-center">
                    Новое поле
                  </div>
                </div>
              </div>
            </div>
          </div>

         <div className="bg-[#172B3E] rounded-2xl p-3 sm:p-4 md:p-6 3xl:p-8 w-full lg:w-[32%] xl:w-[33%] 2xl:w-[34%] min-h-[400px] md:min-h-[500px] xl:min-h-[550px] 2xl:min-h-[600px] 3xl:min-h-[700px] pointer-events-auto shadow-2xl border border-[#2D4A62] transition-all duration-300">
  <div className="flex justify-center mb-3 sm:mb-4 3xl:mb-6 border-b border-[#2D4A62]">
    <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
      <button
        onClick={() => setActiveTab("info")}
        className={`flex-shrink-0 pb-2 px-2 sm:px-3 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-2xl font-medium transition-colors ${
          activeTab === "info" 
            ? "text-[#E8F4FF]" 
            : "text-[#8BA4B8] hover:text-[#E8F4FF]"
        }`}
      >
        📋 Информация
      </button>
      <button
        onClick={() => setActiveTab("weather")}
        className={`flex-shrink-0 pb-2 px-2 sm:px-3 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-2xl font-medium transition-colors ${
          activeTab === "weather" 
            ? "text-[#E8F4FF]" 
            : "text-[#8BA4B8] hover:text-[#E8F4FF]"
        }`}
      >
        🌤️ Погода
      </button>
      <button
        onClick={() => setActiveTab("satellite")}
        className={`flex-shrink-0 pb-2 px-2 sm:px-3 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-2xl font-medium transition-colors ${
          activeTab === "satellite" 
            ? "text-[#E8F4FF]" 
            : "text-[#8BA4B8] hover:text-[#E8F4FF]"
        }`}
      >
        🛰️ Спутник
      </button>
    </div>
  </div>


            <div className="bg-[#0F1F2F] rounded-xl h-[70%] lg:h-[80%] xl:h-[70%] border border-[#2D4A62] p-3 sm:p-4">
            
              {activeTab === "info" && (
                <div className="text-[#E8F4FF] h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-2xl 3xl:text-3xl font-semibold mb-3 sm:mb-5">Информация о поле</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                      <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg">
                        <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base">Название поля</div>
                        <div className="text-sm sm:text-base md:text-lg lg:text-base xl:text-xl 3xl:text-2xl">Поле Северное</div>
                      </div>
                      <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg">
                        <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base">Площадь</div>
                        <div className="text-sm sm:text-base md:text-lg lg:text-base xl:text-xl 3xl:text-2xl">50 га</div>
                      </div>
                      <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg">
                        <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base">Текущая культура</div>
                        <div className="text-sm sm:text-base md:text-lg lg:text-base xl:text-xl 3xl:text-2xl">Картофель</div>
                      </div>
                      <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg">
                        <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base">Тип почвы</div>
                        <div className="text-sm sm:text-base md:text-lg lg:text-base xl:text-xl 3xl:text-2xl">Чернозем</div>
                      </div>
                      <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg sm:col-span-2">
                        <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base">Местоположение</div>
                        <div className="text-sm sm:text-base md:text-lg lg:text-base xl:text-xl 3xl:text-2xl">Московская область, Дмитровский район</div>
                      </div>
                    </div>
                  </div>       
                </div>
              )}

              {activeTab === "weather" && (
                <div className="text-[#E8F4FF] h-full flex flex-col">
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-2xl 3xl:text-3xl font-semibold mb-3 sm:mb-4">Погодные условия</h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                    <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg">
                      <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base">Температура</div>
                      <div className="text-sm sm:text-base md:text-lg lg:text-base xl:text-xl 3xl:text-2xl">+15°C</div>
                    </div>
                    <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg">
                      <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base">Осадки</div>
                      <div className="text-sm sm:text-base md:text-lg lg:text-base xl:text-xl 3xl:text-2xl">2.5 мм</div>
                    </div>
                    <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg">
                      <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base">Влажность</div>
                      <div className="text-sm sm:text-base md:text-lg lg:text-base xl:text-xl 3xl:text-2xl">65%</div>
                    </div>
                    <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg">
                      <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base">Ветер</div>
                      <div className="text-sm sm:text-base md:text-lg lg:text-base xl:text-xl 3xl:text-2xl">3.2 м/с</div>
                    </div>
                  </div>
                  <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg flex-1 min-h-0 h-[60%]">
                    <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Агрономические рекомендации</div>
                    <div className="text-green-400 text-xs sm:text-sm md:text-base h-[90%] flex flex-col justify-start space-y-[5%] mt-[5%]">
                      <div className="leading-tight">• Благоприятные условия для посева</div>
                      <div className="leading-tight">• Ожидаются осадки через 2 дня</div>
                      <div className="leading-tight">• Температура в норме для картофеля</div>
                      <div className="leading-tight">• Влажность оптимальная для роста</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "satellite" && (
                <div className="text-[#E8F4FF] h-full flex flex-col">
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-2xl 3xl:text-3xl font-semibold mb-3 sm:mb-4">Спутниковые индексы</h3>
                  <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-3 sm:mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm md:text-base">NDVI (здоровье растений):</span>
                      <div className="flex items-center">
                        <div className="w-16 sm:w-20 md:w-24 bg-[#2D4A62] rounded-full h-2 mr-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
                        </div>
                        <span className="text-green-400 text-xs sm:text-sm md:text-base">0.78</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm md:text-base">NDWI (влажность почвы):</span>
                      <div className="flex items-center">
                        <div className="w-16 sm:w-20 md:w-24 bg-[#2D4A62] rounded-full h-2 mr-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                        <span className="text-blue-400 text-xs sm:text-sm md:text-base">0.45</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm md:text-base">MSI (стресс растений):</span>
                      <div className="flex items-center">
                        <div className="w-16 sm:w-20 md:w-24 bg-[#2D4A62] rounded-full h-2 mr-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: '32%'}}></div>
                        </div>
                        <span className="text-yellow-400 text-xs sm:text-sm md:text-base">0.32</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg flex-1 min-h-0 h-[60%]">
                    <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Рекомендации по мониторингу</div>
                    <div className="text-green-400 text-xs sm:text-sm md:text-base h-[90%] flex flex-col justify-start space-y-[5%] mt-[5%]">
                      <div className="leading-tight">• Растения в хорошем состоянии</div>
                      <div className="leading-tight">• Влажность почвы в норме</div>
                      <div className="leading-tight">• Низкий уровень стресса</div>
                      <div className="leading-tight">• Рекомендуется продолжать текущий уход</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

<div className="bg-[#172B3E] rounded-2xl p-3 sm:p-4 md:p-6 3xl:p-8 w-full lg:w-[32%] xl:w-[33%] 2xl:w-[34%] min-h-[400px] md:min-h-[500px] xl:min-h-[550px] 2xl:min-h-[600px] 3xl:min-h-[700px] pointer-events-auto shadow-2xl border border-[#2D4A62] transition-all duration-300">
  <div className="flex justify-center mb-3 sm:mb-4 3xl:mb-6 border-b border-[#2D4A62]">
    <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
      <button
        onClick={() => setNotesTab("recommendations")}
        className={`flex-shrink-0 pb-2 px-2 sm:px-3 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-2xl font-medium transition-colors ${
          notesTab === "recommendations" 
            ? "text-[#E8F4FF]" 
            : "text-[#8BA4B8] hover:text-[#E8F4FF]"
        }`}
      >
        💡 Рекомендации
      </button>
      <button
        onClick={() => setNotesTab("notes")}
        className={`flex-shrink-0 pb-2 px-2 sm:px-3 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 3xl:text-2xl font-medium transition-colors ${
          notesTab === "notes" 
            ? "text-[#E8F4FF]" 
            : "text-[#8BA4B8] hover:text-[#E8F4FF]"
        }`}
      >
        📝 Заметки
      </button>
    </div>
  </div>

  <div className="bg-[#0F1F2F] rounded-xl h-[70%] lg:h-[80%] xl:h-[70%] border border-[#2D4A62] p-3 sm:p-4">
    {notesTab === "recommendations" && (
      <div className="h-full flex flex-col justify-center">
        <div className="space-y-2 sm:space-y-3 md:space-y-4 text-xs sm:text-sm md:text-base lg:text-sm xl:text-lg 3xl:text-2xl w-full h-[90%] flex flex-col justify-between">
          <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg text-green-400 w-full h-[18%] flex items-center justify-center">
            ✅ Благоприятный период для посева картофеля
          </div>
          <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg text-blue-400 w-full h-[18%] flex items-center justify-center">
            💧 Рекомендуем полив через 2 дня
          </div>
          <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg text-yellow-400 w-full h-[18%] flex items-center justify-center">
            🌾 Подкормка азотными удобрениями
          </div>
          <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg text-green-400 w-full h-[18%] flex items-center justify-center">
            📈 Высокая прогнозируемая урожайность
          </div>
          <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg text-blue-400 w-full h-[18%] flex items-center justify-center">
            🔄 После уборки - посев озимых зерновых
          </div>
        </div>
      </div>
    )}
    {notesTab === "notes" && (
      <div className="text-[#E8F4FF] h-full flex flex-col">
        <h3 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-2xl 3xl:text-3xl font-semibold mb-3 sm:mb-4 text-center">
          Мои заметки
        </h3>
        <div className="bg-[#1A2E42] rounded-lg flex-1 min-h-0 p-3 sm:p-4">
          <textarea
            value={userNotes}
            onChange={handleNotesChange}
            placeholder="Введите ваши заметки о состоянии культуры, наблюдения, планы работ..."
            className="w-full h-full bg-transparent border-none outline-none text-[#E8F4FF] text-sm sm:text-base md:text-base placeholder-[#8BA4B8] resize-none"
            rows={8}
          />
        </div>
        <div className="flex justify-end mt-3 sm:mt-4">
          <button
            onClick={handleSaveNotes}
            className={`px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
              hasUnsavedChanges
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-[#2D4A62] hover:bg-[#3A5A7A] text-[#E8F4FF]"
            }`}
          >
            Сохранить
          </button>
        </div>
      </div>
    )}

  </div>
</div>
        </div>
      </div>
    </div>
  );
}