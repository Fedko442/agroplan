import { useState, useMemo } from 'react';
import { 
  CropHistoryRecord, 
  AnalyticsData, 
  FieldRecommendation,
  FieldInfo 
} from '../types';

const cropHistory: CropHistoryRecord[] = [
  {
    id: "1", fieldName: "Поле 1", crop: "Пшеница", year: 2024, season: "spring", area: 45.2, yield: 3.2
  },
  {
    id: "2", fieldName: "Поле 1", crop: "Горох", year: 2023, season: "spring", area: 33.2, yield: 2.2
  },
  {
    id: "3", fieldName: "Поле 1", crop: "Ячмень", year: 2022, season: "spring", area: 42.1, yield: 2.9
  },
  {
    id: "4", fieldName: "Поле 2", crop: "Ячмень", year: 2024, season: "spring", area: 32.1, yield: 2.8
  },
  {
    id: "5", fieldName: "Поле 2", crop: "Картофель", year: 2023, season: "summer", area: 18.5, yield: 25.7
  },
  {
    id: "6", fieldName: "Поле 2", crop: "Овес", year: 2022, season: "spring", area: 29.4, yield: 2.4
  },
  {
    id: "7", fieldName: "Поле 3", crop: "Рапс", year: 2023, season: "autumn", area: 28.7, yield: 2.1
  },
  {
    id: "8", fieldName: "Поле 3", crop: "Пшеница", year: 2022, season: "spring", area: 38.9, yield: 3.1
  },
  {
    id: "9", fieldName: "Поле 4", crop: "Кукуруза", year: 2024, season: "summer", area: 52.3, yield: 4.5
  },
  {
    id: "10", fieldName: "Поле 4", crop: "Соя", year: 2023, season: "spring", area: 41.7, yield: 2.9
  }
];

const fieldInfo: FieldInfo[] = [
  { name: "Поле 1", area: 45.2, soilType: "Чернозем", lastCrop: "Пшеница" },
  { name: "Поле 2", area: 32.1, soilType: "Супесчаная", lastCrop: "Ячмень" },
  { name: "Поле 3", area: 28.7, soilType: "Суглинистая", lastCrop: "Рапс" },
  { name: "Поле 4", area: 52.3, soilType: "Чернозем", lastCrop: "Кукуруза" }
];

const generateCropsDistribution = (fieldName?: string) => {
  const filteredHistory = fieldName 
    ? cropHistory.filter(record => record.fieldName === fieldName)
    : cropHistory;

  return filteredHistory.map(record => ({
    crop: record.crop,
    area: record.area,
    percentage: Math.round((record.area / filteredHistory.reduce((sum, r) => sum + r.area, 0)) * 100),
    year: record.year,
    fieldName: record.fieldName
  }));
};

const generateSoilHealth = (fieldName?: string) => {
  const baseSoil = [
    { parameter: "Азот (N)", value: 2.3, status: "good" as const },
    { parameter: "Фосфор (P)", value: 1.8, status: "warning" as const },
    { parameter: "Калий (K)", value: 3.1, status: "good" as const },
    { parameter: "pH", value: 6.2, status: "good" as const }
  ];

  return baseSoil.map(soil => ({
    ...soil,
    fieldName: fieldName || "Все поля"
  }));
};

const calculateRotationEfficiency = (fieldName?: string) => {
  const fieldHistory = fieldName 
    ? cropHistory.filter(record => record.fieldName === fieldName)
    : cropHistory;

  if (fieldHistory.length === 0) return 75;

  const uniqueCrops = new Set(fieldHistory.map(record => record.crop));
  const yearsCount = new Set(fieldHistory.map(record => record.year)).size;
  
  const diversityScore = (uniqueCrops.size / fieldHistory.length) * 100;
  const timeScore = Math.min((yearsCount / fieldHistory.length) * 100, 100);
  
  return Math.round((diversityScore + timeScore) / 2);
};

const recommendations: FieldRecommendation[] = [
  {
    fieldId: "1",
    fieldName: "Поле 1",
    previousCrop: "Пшеница",
    soilCondition: "Среднее содержание азота, низкий фосфор",
    recommendedCrops: [
      {
        crop: "Горох",
        suitability: "high",
        reason: "Бобовые культуры обогащают почву азотом после зерновых",
        benefits: [
          "Повышает содержание азота в почве",
          "Улучшает структуру почвы", 
          "Хороший предшественник для зерновых"
        ]
      },
      {
        crop: "Рапс",
        suitability: "medium",
        reason: "Улучшает фитосанитарное состояние почвы",
        benefits: [
          "Борется с сорняками",
          "Улучшает структуру пахотного слоя"
        ]
      }
    ]
  },
  {
    fieldId: "2",
    fieldName: "Поле 2",
    previousCrop: "Ячмень",
    soilCondition: "Высокое содержание азота, нормальный фосфор",
    recommendedCrops: [
      {
        crop: "Кукуруза",
        suitability: "high",
        reason: "Эффективно использует накопленный азот",
        benefits: [
          "Высокая урожайность после бобовых",
          "Улучшает структуру почвы",
          "Хороший предшественник для озимых"
        ]
      },
      {
        crop: "Подсолнечник",
        suitability: "medium",
        reason: "Глубоко проникающая корневая система",
        benefits: [
          "Разрыхляет глубокие слои почвы",
          "Уменьшает количество сорняков"
        ]
      }
    ]
  }
];

export const useRotationData = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedField, setSelectedField] = useState<string>('');

  const fieldNames = Array.from(new Set(cropHistory.map(record => record.fieldName)));

  if (!selectedField && fieldNames.length > 0) {
    setSelectedField(fieldNames[0]);
  }

  const filteredHistory = useMemo(() => 
    cropHistory.filter(record => 
      record.year === selectedYear && 
      (!selectedField || record.fieldName === selectedField)
    ),
    [selectedYear, selectedField]
  );

  const analyticsData = useMemo((): AnalyticsData => ({
    cropsDistribution: generateCropsDistribution(selectedField),
    soilHealth: generateSoilHealth(selectedField),
    rotationEfficiency: calculateRotationEfficiency(selectedField),
    fieldName: selectedField
  }), [selectedField]);

  const filteredRecommendations = useMemo(() => 
    selectedField 
      ? recommendations.filter(rec => rec.fieldName === selectedField)
      : recommendations,
    [selectedField]
  );

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return {
    selectedYear,
    setSelectedYear,
    selectedField,
    setSelectedField,
    years,
    fieldNames,
    fieldInfo,
    filteredHistory,
    analyticsData,
    recommendations: filteredRecommendations,
    cropHistory
  };
};