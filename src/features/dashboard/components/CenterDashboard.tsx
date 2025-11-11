"use client";
import { useState } from "react";
import FieldCanvasWithMap from "@/features/fields/components/FieldCanvasWithMap";
import FieldInfoTab from "@/features/fields/components/FieldInfoTab";
import FieldNotesTab from "@/features/fields/components/FieldNotesTab";
import FieldRecommendationsTab from "@/features/recommended/components/FieldRecommendationsTab";
import WeatherTab from "@/features/weather/components/WeatherTab";
import SatelliteTab from "@/features/analytics/components/SatelliteTab";
import FieldList from "@/features/fields/components/FieldList";
import FieldModal from "@/features/fields/components/FieldModal";
import type { FieldData, LLPoint } from "@/features/fields/types";

import { 
  Info,
  Cloud,
  Satellite,
  ClipboardList,
  StickyNote,
  Edit
} from "lucide-react";

export default function CenterDashboard() {
  const [activeTab, setActiveTab] = useState("info");
  const [notesTab, setNotesTab] = useState("recommendations");
  const [showHelp, setShowHelp] = useState(false);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [selectedField, setSelectedField] = useState<FieldData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFieldPoints, setEditFieldPoints] = useState<LLPoint[]>([]);

  const handleFieldCreated = (fieldData: FieldData) => {
    console.log('📍 [CenterDashboard] Field created:', fieldData);
    
    const newField: FieldData = {
      ...fieldData,
      id: Date.now().toString(),
      region: fieldData.region || 'Регион не указан'
    };
    
    setFields(prev => [...prev, newField]);
    setSelectedField(newField);
  };

  const handleFieldSelect = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      setSelectedField(field);
    }
  };

  const handleFieldUpdate = (updatedField: FieldData) => {
    setFields(prev => prev.map(field => 
      field.id === updatedField.id ? updatedField : field
    ));
    if (selectedField?.id === updatedField.id) {
      setSelectedField(updatedField);
    }
    setIsEditModalOpen(false);
  };

  const handleFieldDelete = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(fields.find(f => f.id !== fieldId) || null);
    }
  };

  const handleEditField = () => {
    if (!selectedField) return;

    const points: LLPoint[] = [
      { lat: selectedField.coordinates.lat, lng: selectedField.coordinates.lng, name: "Т1" }
    ];
    
    setEditFieldPoints(points);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditFieldPoints([]);
  };

  return (
    <div className="flex flex-col items-center justify-start pt-20 md:pt-24 lg:pt-28 xl:pt-32 2xl:pt-36 3xl:pt-44 pb-10 md:pb-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="flex flex-col lg:flex-row items-stretch justify-center lg:justify-between w-full max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2400px] gap-6 md:gap-8 lg:gap-6 xl:gap-8 2xl:gap-10 3xl:gap-12 mx-auto transition-all duration-300">

          <div className="bg-[#172B3E] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-5 xl:p-6 2xl:p-7 3xl:p-9 w-full lg:w-[31%] xl:w-[32%] 2xl:w-[33%] min-h-[410px] md:min-h-[510px] lg:min-h-[480px] xl:min-h-[560px] 2xl:min-h-[610px] 3xl:min-h-[710px] pointer-events-auto shadow-2xl border border-[#2D4A62] transition-all duration-300 relative z-10">
            <div className="flex justify-between items-center mb-4 sm:mb-5 lg:mb-4 xl:mb-5 3xl:mb-7 relative">
              <h2 className="text-[#E8F4FF] text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl font-semibold">
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
                  <div className="absolute w-[350px] p-4 bg-blue-600 text-white rounded-lg shadow-lg pointer-events-none z-[9999] bottom-full left-full ml-2 mb-2 max-[1024px]:left-auto max-[1024px]:right-full max-[1024px]:mr-2 max-[1024px]:bottom-full max-[1024px]:mb-2">
                    <div className="text-sm font-medium mb-2">Работа с картой полей:</div>
                    <ul className="text-xs space-y-1">
<li>•Кликай по карте, чтобы поставить точки границы поля.
           Каждая точка соединяется линией с предыдущей•</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="relative w-full h-[55%] sm:h-[60%] md:h-[65%] lg:h-[60%] xl:h-[65%] flex items-center justify-center overflow-hidden bg-[#0F1F2F] rounded-xl border border-[#2D4A62] min-h-[250px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[280px] xl:min-h-[320px] 2xl:min-h-[350px] mb-4 sm:mb-5 md:mb-6 lg:mb-4 xl:mb-5">
              <FieldCanvasWithMap 
                onFieldCreated={handleFieldCreated}
                selectedField={selectedField}
              />
            </div>

            <FieldList 
              fields={fields}
              selectedField={selectedField}
              onFieldSelect={handleFieldSelect}
              onFieldUpdate={handleFieldUpdate}
              onFieldDelete={handleFieldDelete}
            />
          </div>

          <div className="bg-[#172B3E] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-5 xl:p-6 2xl:p-7 3xl:p-8 w-full lg:w-[31%] xl:w-[32%] 2xl:w-[33%] min-h-[400px] md:min-h-[500px] lg:min-h-[480px] xl:min-h-[550px] 2xl:min-h-[600px] 3xl:min-h-[700px] pointer-events-auto shadow-2xl border border-[#2D4A62] transition-all duration-300">
            <div className="flex justify-center mb-4 sm:mb-5 lg:mb-4 xl:mb-5 3xl:mb-6 border-b border-[#2D4A62]">
              <div className="flex space-x-2 sm:space-x-3 lg:space-x-2 xl:space-x-3 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`flex items-center flex-shrink-0 pb-2 px-3 sm:px-4 lg:px-3 xl:px-4 text-sm sm:text-base md:text-lg lg:text-sm xl:text-base 2xl:text-lg 3xl:text-2xl font-medium transition-colors ${
                    activeTab === "info" ? "text-[#4ECDC4] border-b-2 border-[#4ECDC4]" : "text-[#8BA4B8] hover:text-[#4ECDC4]"
                  }`}
                >
                  <Info size={18} className="mr-2 lg:mr-1 xl:mr-2" />
                  Информация
                </button>
                <button
                  onClick={() => setActiveTab("weather")}
                  className={`flex items-center flex-shrink-0 pb-2 px-3 sm:px-4 lg:px-3 xl:px-4 text-sm sm:text-base md:text-lg lg:text-sm xl:text-base 2xl:text-lg 3xl:text-2xl font-medium transition-colors ${
                    activeTab === "weather" ? "text-[#6BC5FF] border-b-2 border-[#6BC5FF]" : "text-[#8BA4B8] hover:text-[#6BC5FF]"
                  }`}
                >
                  <Cloud size={18} className="mr-2 lg:mr-1 xl:mr-2" />
                  Погода
                </button>
                <button
                  onClick={() => setActiveTab("satellite")}
                  className={`flex items-center flex-shrink-0 pb-2 px-3 sm:px-4 lg:px-3 xl:px-4 text-sm sm:text-base md:text-lg lg:text-sm xl:text-base 2xl:text-lg 3xl:text-2xl font-medium transition-colors ${
                    activeTab === "satellite" ? "text-[#FFD166] border-b-2 border-[#FFD166]" : "text-[#8BA4B8] hover:text-[#FFD166]"
                  }`}
                >
                  <Satellite size={18} className="mr-2 lg:mr-1 xl:mr-2" />
                  Спутник
                </button>
              </div>
            </div>

            <div className="bg-[#0F1F2F] rounded-xl h-[70%] lg:h-[75%] xl:h-[70%] border border-[#2D4A62] p-4 sm:p-5 lg:p-4 xl:p-5 overflow-auto">
              {activeTab === "info" && <FieldInfoTab fieldData={selectedField || undefined} />}
              {activeTab === "weather" && <WeatherTab fieldId={selectedField?.id} coordinates={selectedField?.coordinates} />}
              {activeTab === "satellite" && <SatelliteTab coords={selectedField?.coordinates} />}
            </div>

            {selectedField && (
              <div className="flex justify-end mt-4 sm:mt-5 lg:mt-4 xl:mt-5 pt-3 border-t border-[#2D4A62]">
                <button
                  onClick={handleEditField}
                  className="flex items-center px-4 py-2 bg-[#3388ff] text-white rounded-lg hover:bg-[#2970cc] transition-colors text-sm sm:text-base"
                >
                  <Edit size={16} className="mr-2" />
                  Редактировать поле
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#172B3E] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-5 xl:p-6 2xl:p-7 3xl:p-8 w-full lg:w-[31%] xl:w-[32%] 2xl:w-[33%] min-h-[400px] md:min-h-[500px] lg:min-h-[480px] xl:min-h-[550px] 2xl:min-h-[600px] 3xl:min-h-[700px] pointer-events-auto shadow-2xl border border-[#2D4A62] transition-all duration-300">
            <div className="flex justify-center mb-4 sm:mb-5 lg:mb-4 xl:mb-5 3xl:mb-6 border-b border-[#2D4A62]">
              <div className="flex space-x-2 sm:space-x-3 lg:space-x-2 xl:space-x-3 overflow-x-auto">
                <button
                  onClick={() => setNotesTab("recommendations")}
                  className={`flex items-center flex-shrink-0 pb-2 px-3 sm:px-4 lg:px-3 xl:px-4 text-sm sm:text-base md:text-lg lg:text-sm xl:text-base 2xl:text-lg 3xl:text-2xl font-medium transition-colors ${
                    notesTab === "recommendations" ? "text-[#7AE582] border-b-2 border-[#7AE582]" : "text-[#8BA4B8] hover:text-[#7AE582]"
                  }`}
                >
                  <ClipboardList size={18} className="mr-2 lg:mr-1 xl:mr-2" />
                  Рекомендации
                </button>
                <button
                  onClick={() => setNotesTab("notes")}
                  className={`flex items-center flex-shrink-0 pb-2 px-3 sm:px-4 lg:px-3 xl:px-4 text-sm sm:text-base md:text-lg lg:text-sm xl:text-base 2xl:text-lg 3xl:text-2xl font-medium transition-colors ${
                    notesTab === "notes" ? "text-[#FFA69E] border-b-2 border-[#FFA69E]" : "text-[#8BA4B8] hover:text-[#FFA69E]"
                  }`}
                >
                  <StickyNote size={18} className="mr-2 lg:mr-1 xl:mr-2" />
                  Заметки
                </button>
              </div>
            </div>

            <div className="bg-[#0F1F2F] rounded-xl h-[70%] lg:h-[75%] xl:h-[70%] border border-[#2D4A62] p-4 sm:p-5 lg:p-4 xl:p-5 overflow-auto">
              {notesTab === "recommendations" && <FieldRecommendationsTab fieldData={selectedField || undefined} />}
              {notesTab === "notes" && <FieldNotesTab fieldData={selectedField} />}
            </div>
          </div>

        </div>
      </div>

      {isEditModalOpen && selectedField && (
        <FieldModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleFieldUpdate}
          points={editFieldPoints}
          region={selectedField.region}
          initialData={selectedField}
        />
      )}
    </div>
  );
}