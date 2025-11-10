import { useWeatherData } from '../hooks/useWeatherData';

interface WeatherTabProps {
  fieldId: number;
}

export default function WeatherTab({ fieldId }: WeatherTabProps) {
  const { weatherData } = useWeatherData(fieldId);

  return (
    <div className="text-[#E8F4FF] h-full flex flex-col">
      <h3 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-2xl 3xl:text-3xl font-semibold mb-3 sm:mb-4">
        Погодные условия
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
        <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg">
          <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base">Температура</div>
          <div className="text-sm sm:text-base md:text-lg lg:text-base xl:text-xl 3xl:text-2xl">{weatherData.temperature}</div>
        </div>
        <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg">
          <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base">Осадки</div>
          <div className="text-sm sm:text-base md:text-lg lg:text-base xl:text-xl 3xl:text-2xl">{weatherData.precipitation}</div>
        </div>
        <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg">
          <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base">Влажность</div>
          <div className="text-sm sm:text-base md:text-lg lg:text-base xl:text-xl 3xl:text-2xl">{weatherData.humidity}</div>
        </div>
        <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg">
          <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base">Ветер</div>
          <div className="text-sm sm:text-base md:text-lg lg:text-base xl:text-xl 3xl:text-2xl">{weatherData.wind}</div>
        </div>
      </div>
      <div className="bg-[#1A2E42] p-2 sm:p-3 rounded-lg flex-1 min-h-0 h-[60%]">
        <div className="text-[#8BA4B8] text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Агрономические рекомендации</div>
        <div className="text-green-400 text-xs sm:text-sm md:text-base h-[90%] flex flex-col justify-start space-y-[5%] mt-[5%]">
          {weatherData.recommendations.map((rec, index) => (
            <div key={index} className="leading-tight">• {rec}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
