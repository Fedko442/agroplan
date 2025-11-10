"use client";

const mockFields = [
  { id: 1, name: "Поле Северное", area: "50 га", crop: "Картофель", status: "active" },
  { id: 2, name: "Поле Южное", area: "30 га", crop: "Пшеница", status: "planned" },
  { id: 3, name: "Поле Западное", area: "25 га", crop: "Ячмень", status: "active" },
];

interface FieldListProps {
  selectedField: number;
  onFieldSelect: (id: number) => void;
}

export default function FieldList({ selectedField, onFieldSelect }: FieldListProps) {
  return (
    <div className="mb-4 sm:mb-5 md:mb-6">
      <h3 className="text-[#E8F4FF] text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl 3xl:text-2xl font-semibold mb-2 sm:mb-3">Мои поля</h3>
      
      <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2 sm:pb-3 scrollbar-thin scrollbar-thumb-[#2D4A62] scrollbar-track-[#0F1F2F]">
        {mockFields.map((field) => (
          <div
            key={field.id}
            onClick={() => onFieldSelect(field.id)}
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
  );
}