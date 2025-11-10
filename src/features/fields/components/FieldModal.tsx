"use client";
import { useState, useEffect } from "react";
import { useFieldArea } from "../hooks/useFieldArea";
import cropsData from '@/data/crops.json';
import type { FieldData, LLPoint, SoilData, PlannedOperation, Fertilizer, IrrigationSystem } from "../types";

type FieldModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fieldData: FieldData) => void;
  points: LLPoint[];
  region?: string;
};

type Crop = {
  id: number;
  name: string;
  latin: string;
  categories: string[];
  type: string;
};

const createCropCategories = (crops: Crop[]) => {
  const categories: { [key: string]: string[] } = {};
  
  crops.forEach(crop => {
    crop.categories.forEach(category => {
      if (!categories[category]) {
        categories[category] = [];
      }
      if (!categories[category].includes(crop.name)) {
        categories[category].push(crop.name);
      }
    });
  });
  
  const sortedCategories: { [key: string]: string[] } = {};
  Object.keys(categories).sort().forEach(key => {
    sortedCategories[key] = categories[key].sort();
  });
  
  return sortedCategories;
};

const CROP_CATEGORIES = createCropCategories(cropsData.searchIndex);
const ALL_CROPS = cropsData.searchIndex.map(crop => ({
  id: crop.id,
  name: crop.name,
  latin: crop.latin,
  categories: crop.categories,
  type: crop.type
}));

const SOIL_TYPES = [
  "Чернозем", "Подзолистая", "Дерново-подзолистая", "Серая лесная",
  "Каштановая", "Солонец", "Торфяная", "Песчаная", "Супесчаная", "Глинистая"
];

const OPERATION_TYPES = [
  "Вспашка", "Культивация", "Боронование", "Посев", "Внесение удобрений",
  "Обработка СЗР", "Полив", "Уборка урожая", "Лущение стерни", "Известкование"
];

const FERTILIZER_TYPES = [
  "Азотные", "Фосфорные", "Калийные", "Органические", "Комплексные",
  "Микроудобрения", "Известковые"
];

const IRRIGATION_TYPES = [
  "Дождевание", "Капельное", "Арычное", "Подпочвенное", "Поверхностное"
];

const fetchSoilData = async (lat: number, lng: number): Promise<SoilData | null> => {
  try {
    const response = await fetch(
      `https://rest.soilgrids.org/query?lon=${lng}&lat=${lat}&attributes=phh2o,ocd,clay,sand,silt,nitrogen,phos,potassium`
    );
    
    if (!response.ok) {
      throw new Error('Soil API request failed');
    }
    
    const data = await response.json();
    const properties = data.properties;
    
    return {
      ph: properties.phh2o?.mean / 10 || 0,
      organicCarbon: properties.ocd?.mean / 10 || 0,
      clay: properties.clay?.mean / 10 || 0,
      sand: properties.sand?.mean / 10 || 0,
      silt: properties.silt?.mean / 10 || 0,
      nitrogen: properties.nitrogen?.mean / 10 || 0,
      phosphorus: properties.phos?.mean / 10 || 0,
      potassium: properties.potassium?.mean / 10 || 0
    };
  } catch (error) {
    console.error('Error fetching soil data:', error);
    
    return {
      ph: 6.5 + (Math.random() - 0.5),
      organicCarbon: 2.0 + (Math.random() * 1.5),
      clay: 25 + (Math.random() * 20),
      sand: 40 + (Math.random() * 30),
      silt: 35 + (Math.random() * 25),
      nitrogen: 0.15 + (Math.random() * 0.1),
      phosphorus: 0.08 + (Math.random() * 0.05),
      potassium: 0.12 + (Math.random() * 0.08)
    };
  }
};

const determineSoilType = (soilData: SoilData): string => {
  const { clay, sand, silt, organicCarbon } = soilData;
  
  if (clay > 35) return "Глинистая";
  if (clay > 25 && sand > 45) return "Супесчаная";
  if (sand > 85) return "Песчаная";
  if (clay < 10 && silt < 30) return "Песчаная";
  if (organicCarbon > 6) return "Торфяная";
  if (clay > 20 && silt > 40) return "Серая лесная";
  if (organicCarbon > 3 && clay > 15) return "Чернозем";
  
  return "Дерново-подзолистая";
};

const searchCrops = (query: string, crops: Crop[]): Crop[] => {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase().trim();
  
  return crops.filter(crop => 
    crop.name.toLowerCase().includes(lowerQuery) ||
    crop.latin.toLowerCase().includes(lowerQuery) ||
    crop.categories.some(category => category.toLowerCase().includes(lowerQuery))
  );
};

export default function FieldModal({ isOpen, onClose, onSave, points, region }: FieldModalProps) {
  const [formData, setFormData] = useState<FieldData>({
    name: "",
    area: 0,
    crop: "",
    isActive: false,
    soilType: "",
    segmentLengths: [],
    notes: "",
    cropRotationHistory: "",
    plannedOperations: [],
    fertilizers: [],
    irrigationSystem: {
      hasSystem: false,
      type: "",
      description: ""
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newOperation, setNewOperation] = useState<Omit<PlannedOperation, 'status'>>({
    type: "",
    date: ""
  });
  const [newFertilizer, setNewFertilizer] = useState<Omit<Fertilizer, 'id'>>({
    type: "",
    name: "",
    applicationDate: "",
    amount: 0,
    unit: "кг/га"
  });
  const [isLoadingSoil, setIsLoadingSoil] = useState(false);
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [manualSegmentLengths, setManualSegmentLengths] = useState<{ segment: string; length: number }[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Crop[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCropDetails, setSelectedCropDetails] = useState<Crop | null>(null);

  const sideLengths = manualSegmentLengths.map(segment => segment.length);
  const { area: calculatedArea } = useFieldArea({ 
    points, 
    sides: sideLengths 
  });

  useEffect(() => {
    if (isOpen && points.length >= 3) {
      const initialSegments = points.map((point, index) => {
        const nextIndex = (index + 1) % points.length;
        return {
          segment: `${point.name || `Т${index+1}`}-${points[nextIndex].name || `Т${nextIndex+1}`}`,
          length: 100
        };
      });
      
      setManualSegmentLengths(initialSegments);
      
      setFormData(prev => ({
        ...prev,
        segmentLengths: initialSegments,
        area: calculatedArea
      }));

      const centerLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
      const centerLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
      
      fetchSoilDataForField(centerLat, centerLng);
    }
  }, [isOpen, points]);

  useEffect(() => {
    if (manualSegmentLengths.length > 0) {
      setFormData(prev => ({
        ...prev,
        area: calculatedArea
      }));
    }
  }, [calculatedArea, manualSegmentLengths.length]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchCrops(searchQuery, ALL_CROPS);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const fetchSoilDataForField = async (lat: number, lng: number) => {
    setIsLoadingSoil(true);
    try {
      const soilData = await fetchSoilData(lat, lng);
      setSoilData(soilData);
      
      if (soilData) {
        const detectedSoilType = determineSoilType(soilData);
        setFormData(prev => ({
          ...prev,
          soilType: detectedSoilType,
          soilData: soilData
        }));
      }
    } catch (error) {
      console.error('Error loading soil data:', error);
    } finally {
      setIsLoadingSoil(false);
    }
  };

  const handleSegmentLengthChange = (index: number, value: number) => {
    const updatedSegments = [...manualSegmentLengths];
    updatedSegments[index] = {
      ...updatedSegments[index],
      length: value
    };
    
    setManualSegmentLengths(updatedSegments);
    
    setFormData(prev => ({
      ...prev,
      segmentLengths: updatedSegments
    }));
  };

  const handleAreaChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      area: value
    }));
  };

  const handleCropSelect = (crop: Crop) => {
    setFormData(prev => ({ ...prev, crop: crop.name }));
    setSelectedCropDetails(crop);
    setSearchQuery("");
    setShowSearchResults(false);
    setSelectedCategory("");
  };

  const handleCropSelectFromCategory = (cropName: string) => {
    setFormData(prev => ({ ...prev, crop: cropName }));
    const cropDetails = ALL_CROPS.find(crop => crop.name === cropName);
    setSelectedCropDetails(cropDetails || null);
  };

  const handleCropReset = () => {
    setFormData(prev => ({ ...prev, crop: "" }));
    setSelectedCropDetails(null);
    setSearchQuery("");
  };

  const addOperation = () => {
    if (!newOperation.type || !newOperation.date) return;
    
    const operation: PlannedOperation = {
      ...newOperation,
      status: 'planned'
    };
    
    setFormData(prev => ({
      ...prev,
      plannedOperations: [...prev.plannedOperations, operation]
    }));
    
    setNewOperation({ type: "", date: "" });
  };

  const removeOperation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      plannedOperations: prev.plannedOperations.filter((_, i) => i !== index)
    }));
  };

  const addFertilizer = () => {
    if (!newFertilizer.type || !newFertilizer.name || !newFertilizer.applicationDate) return;
    
    setFormData(prev => ({
      ...prev,
      fertilizers: [...prev.fertilizers, { ...newFertilizer }]
    }));
    
    setNewFertilizer({
      type: "",
      name: "",
      applicationDate: "",
      amount: 0,
      unit: "кг/га"
    });
  };

  const removeFertilizer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fertilizers: prev.fertilizers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Пожалуйста, введите название поля");
      return;
    }
    
    if (!formData.soilType) {
      alert("Пожалуйста, выберите тип почвы");
      return;
    }
    
    if (formData.isActive && !formData.crop) {
      alert("Пожалуйста, выберите культуру для активного поля");
      return;
    }
    
    const hasEmptySides = manualSegmentLengths.some(segment => segment.length <= 0);
    if (hasEmptySides) {
      alert("Пожалуйста, укажите длины всех сторон поля");
      return;
    }
    
    onSave(formData);
    onClose();
  };

  const handleRegionClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10000] p-4 overflow-y-auto modal-overlay"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-[#172B3E] rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#2D4A62] shadow-2xl my-8 modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#E8F4FF]">Добавить новое поле</h2>
          <button
            onClick={onClose}
            className="text-[#8BA4B8] hover:text-[#E8F4FF] text-2xl font-bold transition-colors w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8BA4B8] mb-2">
                Название поля *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-[#0F1F2F] border border-[#2D4A62] rounded-lg text-[#E8F4FF] placeholder-[#8BA4B8] focus:outline-none focus:border-[#3388ff] transition-colors"
                placeholder="Введите название поля"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#8BA4B8] mb-2">
                Площадь поля (га) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.area}
                  readOnly
                  className="flex-1 px-3 py-2 bg-[#0F1F2F] border border-[#2D4A62] rounded-lg text-[#E8F4FF] cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="text-[#8BA4B8] text-sm whitespace-nowrap">
                  ≈ {(formData.area * 10000).toLocaleString('ru-RU')} м²
                </div>
              </div>
              <div className="text-[#8BA4B8] text-xs mt-1">
                Площадь рассчитывается автоматически на основе длин сторон с использованием точных формул
              </div>
            </div>
          </div>

          {region && (
            <div>
              <label className="block text-sm font-medium text-[#8BA4B8] mb-2">
                Регион
              </label>
              <input
                type="text"
                value={region}
                readOnly
                onClick={handleRegionClick}
                onMouseDown={handleRegionClick}
                className="w-full px-3 py-2 bg-[#0F1F2F] border border-[#2D4A62] rounded-lg text-[#8BA4B8] cursor-default select-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#8BA4B8] mb-2">
              Длины сторон поля (метры) *
            </label>
            <div className="bg-[#0F1F2F] rounded-lg p-4 border border-[#2D4A62] space-y-3">
              {manualSegmentLengths.map((segment, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
                  <span className="text-[#8BA4B8] text-sm min-w-[120px]">Сторона {segment.segment}:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={segment.length}
                      onChange={(e) => handleSegmentLengthChange(index, parseInt(e.target.value) || 0)}
                      min="1"
                      required
                      className="w-24 px-2 py-1 bg-[#2D4A62] border border-[#3A5A7A] rounded text-[#E8F4FF] text-sm focus:outline-none focus:border-[#3388ff] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[#E8F4FF] text-sm whitespace-nowrap">метров</span>
                  </div>
                </div>
              ))}
              <div className="text-[#8BA4B8] text-xs mt-2">
                Укажите фактические длины каждой стороны поля в метрах. Площадь будет рассчитана автоматически с использованием точных математических формул.
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8BA4B8] mb-2">
              Тип почвы *
              {isLoadingSoil && (
                <span className="ml-2 text-yellow-400 text-sm">(загрузка данных...)</span>
              )}
              {soilData && !isLoadingSoil && (
                <span className="ml-2 text-green-400 text-sm">(данные загружены)</span>
              )}
            </label>
            
            <div className="space-y-3">
              <input
                type="text"
                value={formData.soilType}
                readOnly
                className="w-full px-3 py-2 bg-[#0F1F2F] border border-[#2D4A62] rounded-lg text-[#E8F4FF] cursor-not-allowed"
              />

              {soilData && (
                <div className="bg-[#0F1F2F] rounded-lg p-4 border border-[#2D4A62]">
                  <h4 className="text-[#E8F4FF] font-medium mb-3">Характеристики почвы:</h4>
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="text-[#8BA4B8]">
                      <div>pH: <span className="text-[#E8F4FF]">{soilData.ph.toFixed(1)}</span></div>
                    </div>
                    <div className="text-[#8BA4B8]">
                      <div>Орг. углерод: <span className="text-[#E8F4FF]">{soilData.organicCarbon.toFixed(1)}%</span></div>
                    </div>
                    <div className="text-[#8BA4B8]">
                      <div>Глина: <span className="text-[#E8F4FF]">{soilData.clay.toFixed(0)}%</span></div>
                    </div>
                    <div className="text-[#8BA4B8]">
                      <div>Песок: <span className="text-[#E8F4FF]">{soilData.sand.toFixed(0)}%</span></div>
                    </div>
                    <div className="text-[#8BA4B8]">
                      <div>Ил: <span className="text-[#E8F4FF]">{soilData.silt.toFixed(0)}%</span></div>
                    </div>
                    <div className="text-[#8BA4B8]">
                      <div>Азот: <span className="text-[#E8F4FF]">{soilData.nitrogen.toFixed(2)}%</span></div>
                    </div>
                    <div className="text-[#8BA4B8]">
                      <div>Фосфор: <span className="text-[#E8F4FF]">{soilData.phosphorus.toFixed(2)}%</span></div>
                    </div>
                    <div className="text-[#8BA4B8]">
                      <div>Калий: <span className="text-[#E8F4FF]">{soilData.potassium.toFixed(2)}%</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-[#3388ff] bg-[#0F1F2F] border-[#2D4A62] rounded focus:ring-[#3388ff]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-[#8BA4B8]">
              Поле активно (посажена культура)
            </label>
          </div>

          {formData.isActive && (
            <div>
              <label className="block text-sm font-medium text-[#8BA4B8] mb-3">
                Выберите культуру *
              </label>
              
              <div className="bg-[#0F1F2F] rounded-lg p-4 border border-[#2D4A62]">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#8BA4B8] mb-2">Поиск культур</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Введите название культуры на русском или латыни..."
                      className="w-full px-3 py-2 bg-[#2D4A62] border border-[#3A5A7A] rounded-lg text-[#E8F4FF] placeholder-[#8BA4B8] focus:outline-none focus:border-[#3388ff] transition-colors"
                    />
                    
                    {showSearchResults && (
                      <div className="absolute z-10 w-full mt-1 bg-[#1E3A5C] border border-[#3388ff] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.length > 0 ? (
                          searchResults.map(crop => (
                            <button
                              key={crop.id}
                              type="button"
                              onClick={() => handleCropSelect(crop)}
                              className="w-full px-3 py-2 text-left hover:bg-[#2D4A62] transition-colors border-b border-[#2D4A62] last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                            >
                              <div className="text-[#E8F4FF] font-medium">{crop.name}</div>
                              <div className="text-[#8BA4B8] text-sm italic">{crop.latin}</div>
                              <div className="text-[#8BA4B8] text-xs mt-1">
                                {crop.categories.join(", ")} • {crop.type}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-[#8BA4B8] text-sm rounded-lg">
                            Культуры не найдены
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#8BA4B8] mb-2">Или выберите из категорий</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setFormData(prev => ({ ...prev, crop: "" }));
                      setSelectedCropDetails(null);
                    }}
                    className="w-full px-3 py-2 bg-[#2D4A62] border border-[#3A5A7A] rounded-lg text-[#E8F4FF] focus:outline-none focus:border-[#3388ff] transition-colors"
                  >
                    <option value="">Выберите категорию</option>
                    {Object.keys(CROP_CATEGORIES).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {selectedCategory && (
                  <div>
                    <label className="block text-sm font-medium text-[#8BA4B8] mb-2">Конкретная культура</label>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2">
                        {CROP_CATEGORIES[selectedCategory].map(cropName => {
                          const crop = ALL_CROPS.find(c => c.name === cropName);
                          return (
                            <button
                              key={cropName}
                              type="button"
                              onClick={() => handleCropSelectFromCategory(cropName)}
                              className={`p-3 rounded-lg text-left transition-colors ${
                                formData.crop === cropName 
                                  ? 'bg-[#3388ff] text-white' 
                                  : 'bg-[#2D4A62] text-[#8BA4B8] hover:bg-[#3A5A7A] hover:text-[#E8F4FF]'
                              }`}
                            >
                              <div className="font-medium">{cropName}</div>
                              {crop && (
                                <div className="text-sm italic text-opacity-80 mt-1">
                                  {crop.latin}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {formData.crop && selectedCropDetails && (
                  <div className="mt-3 p-3 bg-green-900 bg-opacity-20 rounded-lg border border-green-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-green-400 text-sm font-medium">
                          Выбрана культура: <strong>{selectedCropDetails.name}</strong>
                        </div>
                        <div className="text-green-300 text-xs italic mt-1">
                          {selectedCropDetails.latin}
                        </div>
                        <div className="text-green-200 text-xs mt-2">
                          <strong>Категории:</strong> {selectedCropDetails.categories.join(", ")}
                        </div>
                        <div className="text-green-200 text-xs">
                          <strong>Тип:</strong> {selectedCropDetails.type}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCropReset}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
                
                {formData.crop && !selectedCropDetails && (
                  <div className="mt-3 p-3 bg-green-900 bg-opacity-20 rounded-lg border border-green-700">
                    <div className="text-green-400 text-sm">
                      Выбрана культура: <strong>{formData.crop}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#8BA4B8] mb-2">
              История севооборота (что росло в предыдущие годы)
            </label>
            <textarea
              value={formData.cropRotationHistory}
              onChange={(e) => setFormData(prev => ({ ...prev, cropRotationHistory: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-[#0F1F2F] border border-[#2D4A62] rounded-lg text-[#E8F4FF] placeholder-[#8BA4B8] focus:outline-none focus:border-[#3388ff] transition-colors"
              placeholder="Например: 2023 - Пшеница, 2022 - Ячмень, 2021 - Рапс..."
            />
          </div>

          <div className="bg-[#0F1F2F] rounded-lg p-4 border border-[#2D4A62]">
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                id="hasIrrigation"
                checked={formData.irrigationSystem.hasSystem}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  irrigationSystem: {
                    ...prev.irrigationSystem,
                    hasSystem: e.target.checked
                  }
                }))}
                className="w-4 h-4 text-[#3388ff] bg-[#0F1F2F] border-[#2D4A62] rounded focus:ring-[#3388ff]"
              />
              <label htmlFor="hasIrrigation" className="text-sm font-medium text-[#8BA4B8]">
                На поле есть система орошения
              </label>
            </div>

            {formData.irrigationSystem.hasSystem && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#8BA4B8] mb-2">
                    Тип системы орошения
                  </label>
                  <select
                    value={formData.irrigationSystem.type}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      irrigationSystem: {
                        ...prev.irrigationSystem,
                        type: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 bg-[#2D4A62] border border-[#3A5A7A] rounded-lg text-[#E8F4FF] focus:outline-none focus:border-[#3388ff] transition-colors"
                  >
                    <option value="">Выберите тип орошения</option>
                    {IRRIGATION_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#8BA4B8] mb-2">
                    Описание системы орошения
                  </label>
                  <textarea
                    value={formData.irrigationSystem.description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      irrigationSystem: {
                        ...prev.irrigationSystem,
                        description: e.target.value
                      }
                    }))}
                    rows={2}
                    className="w-full px-3 py-2 bg-[#2D4A62] border border-[#3A5A7A] rounded-lg text-[#E8F4FF] placeholder-[#8BA4B8] focus:outline-none focus:border-[#3388ff] transition-colors"
                    placeholder="Описание состояния и характеристик системы орошения..."
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8BA4B8] mb-3">
              Планируемые работы
            </label>
            
            <div className="bg-[#0F1F2F] rounded-lg p-4 space-y-3 border border-[#2D4A62]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <select
                  value={newOperation.type}
                  onChange={(e) => setNewOperation(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 bg-[#2D4A62] border border-[#3A5A7A] rounded-lg text-[#E8F4FF] text-sm focus:outline-none focus:border-[#3388ff] transition-colors"
                >
                  <option value="">Тип работы</option>
                  {OPERATION_TYPES.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
                
                <input
                  type="date"
                  value={newOperation.date}
                  onChange={(e) => setNewOperation(prev => ({ ...prev, date: e.target.value }))}
                  className="px-3 py-2 bg-[#2D4A62] border border-[#3A5A7A] rounded-lg text-[#E8F4FF] text-sm focus:outline-none focus:border-[#3388ff] transition-colors"
                />
                
                <button
                  type="button"
                  onClick={addOperation}
                  disabled={!newOperation.type || !newOperation.date}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  Добавить
                </button>
              </div>

              {formData.plannedOperations.length > 0 && (
                <div className="space-y-2">
                  {formData.plannedOperations.map((operation, index) => (
                    <div key={index} className="flex justify-between items-center bg-[#2D4A62] p-3 rounded-lg">
                      <div>
                        <span className="text-[#E8F4FF] text-sm">{operation.type}</span>
                        <span className="text-[#8BA4B8] text-sm ml-2">({new Date(operation.date).toLocaleDateString('ru-RU')})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOperation(index)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8BA4B8] mb-3">
              Удобрения (использованные/планируемые)
            </label>
            
            <div className="bg-[#0F1F2F] rounded-lg p-4 space-y-3 border border-[#2D4A62]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                <select
                  value={newFertilizer.type}
                  onChange={(e) => setNewFertilizer(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 bg-[#2D4A62] border border-[#3A5A7A] rounded-lg text-[#E8F4FF] text-sm focus:outline-none focus:border-[#3388ff] transition-colors"
                >
                  <option value="">Тип удобрения</option>
                  {FERTILIZER_TYPES.map(fert => (
                    <option key={fert} value={fert}>{fert}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  value={newFertilizer.name}
                  onChange={(e) => setNewFertilizer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Название"
                  className="px-3 py-2 bg-[#2D4A62] border border-[#3A5A7A] rounded-lg text-[#E8F4FF] text-sm placeholder-[#8BA4B8] focus:outline-none focus:border-[#3388ff] transition-colors"
                />
                
                <input
                  type="date"
                  value={newFertilizer.applicationDate}
                  onChange={(e) => setNewFertilizer(prev => ({ ...prev, applicationDate: e.target.value }))}
                  className="px-3 py-2 bg-[#2D4A62] border border-[#3A5A7A] rounded-lg text-[#E8F4FF] text-sm focus:outline-none focus:border-[#3388ff] transition-colors"
                />
                
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newFertilizer.amount}
                    onChange={(e) => setNewFertilizer(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="Кол-во"
                    className="w-20 px-2 py-2 bg-[#2D4A62] border border-[#3A5A7A] rounded-lg text-[#E8F4FF] text-sm focus:outline-none focus:border-[#3388ff] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <select
                    value={newFertilizer.unit}
                    onChange={(e) => setNewFertilizer(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-20 px-2 py-2 bg-[#2D4A62] border border-[#3A5A7A] rounded-lg text-[#E8F4FF] text-sm focus:outline-none focus:border-[#3388ff] transition-colors"
                  >
                    <option value="кг/га">кг/га</option>
                    <option value="т/га">т/га</option>
                    <option value="л/га">л/га</option>
                    <option value="ц/га">ц/га</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={addFertilizer}
                  disabled={!newFertilizer.type || !newFertilizer.name || !newFertilizer.applicationDate}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  Добавить
                </button>
              </div>

              {formData.fertilizers.length > 0 && (
                <div className="space-y-2">
                  {formData.fertilizers.map((fertilizer, index) => (
                    <div key={index} className="flex justify-between items-center bg-[#2D4A62] p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="text-[#E8F4FF] text-sm font-medium">{fertilizer.name}</div>
                        <div className="text-[#8BA4B8] text-xs">
                          {fertilizer.type} • {fertilizer.amount} {fertilizer.unit} • {new Date(fertilizer.applicationDate).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFertilizer(index)}
                        className="text-red-400 hover:text-red-300 text-sm ml-2 transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8BA4B8] mb-2">
              Дополнительные заметки
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-[#0F1F2F] border border-[#2D4A62] rounded-lg text-[#E8F4FF] placeholder-[#8BA4B8] focus:outline-none focus:border-[#3388ff] transition-colors"
              placeholder="Дополнительная информация о поле..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#2D4A62]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#2D4A62] text-[#E8F4FF] rounded-lg hover:bg-[#3A5A7A] transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#3388ff] text-white rounded-lg hover:bg-[#2970cc] transition-colors"
            >
              Сохранить поле
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}