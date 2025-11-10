import { SatelliteData } from '../types';

export const useSatelliteData = (fieldId: number) => {
  const satelliteData: SatelliteData = {
    indices: [
      { name: "NDVI (здоровье растений)", value: 0.78, color: "bg-green-500", recommendations: [
        "Растения в хорошем состоянии",
        "Рекомендуется продолжать текущий уход"
      ]},
      { name: "NDWI (влажность почвы)", value: 0.45, color: "bg-blue-500", recommendations: [
        "Влажность почвы в норме",
        "Полив не требуется"
      ]},
      { name: "MSI (стресс растений)", value: 0.32, color: "bg-yellow-500", recommendations: [
        "Низкий уровень стресса",
        "Условия роста оптимальные"
      ]}
    ]
  };

  return { satelliteData };
};
