export default function FieldInfoTab() {
  return (
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
  );
}