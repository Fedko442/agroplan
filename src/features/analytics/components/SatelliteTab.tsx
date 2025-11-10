// SatelliteTab.tsx
import { useSatelliteData } from '../hooks/useSatelliteData';

interface SatelliteTabProps {
  coords?: { lat: number; lng: number };
}

export default function SatelliteTab({ coords }: SatelliteTabProps) {
  const { satelliteData, loading, error } = useSatelliteData(coords || null);
  
  console.log('📌 [SatelliteTab] Received coords:', coords);

  // Если нет координат
  if (!coords) {
    return (
      <div className="text-[#E8F4FF] h-full flex flex-col">
        <h3 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-2xl 3xl:text-3xl font-semibold mb-3 sm:mb-4">
          Спутниковые индексы
        </h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-[#8BA4B8] text-center text-xs sm:text-sm">
            Выберите местоположение на карте<br />для получения спутниковых данных
          </div>
        </div>
      </div>
    );
  }

  // Загрузка
  if (loading) {
    return (
      <div className="text-[#E8F4FF] h-full flex flex-col">
        <h3 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-2xl 3xl:text-3xl font-semibold mb-3 sm:mb-4">
          Спутниковые индексы
        </h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-[#8BA4B8] text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Загрузка спутниковых данных...
          </div>
        </div>
      </div>
    );
  }

  // Ошибка
  if (error) {
    return (
      <div className="text-[#E8F4FF] h-full flex flex-col">
        <h3 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-2xl 3xl:text-3xl font-semibold mb-3 sm:mb-4">
          Спутниковые индексы
        </h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-red-400 text-center text-xs sm:text-sm">
            <div className="text-lg mb-2">⚠️</div>
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Нет данных после загрузки
  if (!satelliteData) {
    return (
      <div className="text-[#E8F4FF] h-full flex flex-col">
        <h3 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-2xl 3xl:text-3xl font-semibold mb-3 sm:mb-4">
          Спутниковые индексы
        </h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-[#8BA4B8] text-center text-xs sm:text-sm">
            Не удалось получить спутниковые данные<br />для выбранного местоположения
          </div>
        </div>
      </div>
    );
  }

  // Успешная загрузка данных
  return (
    <div className="text-[#E8F4FF] h-full flex flex-col">
  
      {/* Индексы */}
      <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-3 sm:mb-4 flex-1">
        {satelliteData.indices.map((index, i) => (
          <div key={i} className="bg-[#1A2E42] p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm md:text-base font-medium">{index.name}</span>
              <span className={`text-xs sm:text-sm md:text-base font-bold ${
                index.name.includes('NDVI') ? 'text-green-400' :
                index.name.includes('NDWI') ? 'text-blue-400' : 'text-yellow-400'
              }`}>
                {index.value.toFixed(2)}
              </span>
            </div>
            
            {/* Прогресс-бар */}
            <div className="w-full bg-[#2D4A62] rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${index.color}`}
                style={{ width: `${Math.min(index.value * 100, 100)}%` }}
              ></div>
            </div>

            {/* Статус */}
            <div className="text-xs text-[#8BA4B8]">
              {getIndexStatus(index.name, index.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Рекомендации */}
      <div className="bg-[#1A2E42] p-3 rounded-lg">
        <div className="text-[#8BA4B8] text-xs sm:text-sm mb-2 font-medium">Рекомендации</div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {satelliteData.indices.flatMap((index, i) => 
            index.recommendations.map((rec, j) => (
              <div key={`${i}-${j}`} className="text-xs sm:text-sm leading-relaxed flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span>{rec}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Вспомогательная функция для отображения статуса индекса
function getIndexStatus(name: string, value: number): string {
  if (name.includes('NDVI')) {
    if (value > 0.7) return 'Отличное состояние';
    if (value > 0.5) return 'Хорошее состояние';
    if (value > 0.3) return 'Среднее состояние';
    return 'Плохое состояние';
  }
  
  if (name.includes('NDWI')) {
    if (value > 0.5) return 'Высокая влажность';
    if (value > 0.3) return 'Нормальная влажность';
    return 'Низкая влажность';
  }
  
  if (name.includes('MSI')) {
    if (value < 0.2) return 'Очень низкий стресс';
    if (value < 0.4) return 'Низкий стресс';
    if (value < 0.6) return 'Средний стресс';
    return 'Высокий стресс';
  }
  
  return 'Норма';
}