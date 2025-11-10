export default function SatelliteTab() {
  return (
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
  );
}