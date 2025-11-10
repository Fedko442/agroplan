// WeatherTab.tsx
import { useWeatherData } from '../hooks/useWeatherData';

interface WeatherTabProps {
  fieldId: number;
  coordinates?: { lat: number; lng: number };
}

export default function WeatherTab({ fieldId, coordinates }: WeatherTabProps) {
  const { weatherData, loading, error } = useWeatherData({ 
    fieldId, 
    coordinates 
  });

  if (!coordinates) {
    return (
      <div className="text-[#E8F4FF] h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Погодные условия</h3>
        <div className="text-[#8BA4B8] text-center mt-8">
          Нарисуйте поле на карте<br/>для получения погоды
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-[#E8F4FF] h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Погодные условия</h3>
        <div className="text-[#8BA4B8]">Загрузка погоды...</div>
      </div>
    );
  }

  return (
    <div className="text-[#E8F4FF] h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Погодные условия</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#1A2E42] p-3 rounded-lg">
          <div className="text-[#8BA4B8] text-sm">Температура</div>
          <div className="text-lg">{weatherData.temperature}</div>
        </div>
        <div className="bg-[#1A2E42] p-3 rounded-lg">
          <div className="text-[#8BA4B8] text-sm">Осадки</div>
          <div className="text-lg">{weatherData.precipitation}</div>
        </div>
        <div className="bg-[#1A2E42] p-3 rounded-lg">
          <div className="text-[#8BA4B8] text-sm">Влажность</div>
          <div className="text-lg">{weatherData.humidity}</div>
        </div>
        <div className="bg-[#1A2E42] p-3 rounded-lg">
          <div className="text-[#8BA4B8] text-sm">Ветер</div>
          <div className="text-lg">{weatherData.wind}</div>
        </div>
      </div>
      
      <div className="bg-[#1A2E42] p-3 rounded-lg flex-1">
        <div className="text-[#8BA4B8] text-sm mb-2">Рекомендации</div>
        <div className="text-green-400 text-sm space-y-1">
          {weatherData.recommendations.map((rec, index) => (
            <div key={index}>• {rec}</div>
          ))}
        </div>
      </div>
    </div>
  );
}