import { 
  CheckCircle, 
  CloudRain,
  TrendingUp,
  RotateCcw,
  Leaf,
  ClipboardList,
  AlertCircle,
  Sprout
} from "lucide-react";
import type { FieldData } from "@/features/fields/types";

interface FieldRecommendationsTabProps {
  fieldData?: FieldData;
}

export default function FieldRecommendationsTab({ fieldData }: FieldRecommendationsTabProps) {
  if (!fieldData) {
    return (
      <div className="text-[#E8F4FF] h-full flex flex-col">
        <h3 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-2xl 3xl:text-3xl font-semibold mb-3 sm:mb-4">
          Агрономические рекомендации
        </h3>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-[#8BA4B8] text-center mb-4">
            <div className="flex justify-center mb-2">
              <ClipboardList className="w-12 h-12" />
            </div>
            <div className="text-xs sm:text-sm">
              Нарисуйте поле на карте<br />для получения рекомендаций
            </div>
          </div>
          <div className="bg-[#1A2E42] rounded-lg p-3 max-w-xs">
            <div className="text-[#8BA4B8] text-xs mb-2">Доступные рекомендации:</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                <span>Сроки посева и уборки</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                <span>Режим орошения</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                <span>Система удобрений</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
                <span>Прогноз урожайности</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const recommendations = [
    {
      icon: CheckCircle,
      text: fieldData.crop 
        ? `Благоприятный период для ${fieldData.crop}`
        : 'Выберите культуру для рекомендаций',
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-400/20"
    },
    {
      icon: CloudRain,
      text: fieldData.irrigationSystem?.hasSystem 
        ? 'Система орошения активна' 
        : 'Рекомендуем установить систему орошения',
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-400/20"
    },
    {
      icon: Leaf,
      text: fieldData.soilType 
        ? `Оптимальная обработка для ${fieldData.soilType}`
        : 'Подкормка азотными удобрениями',
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-400/20"
    },
    {
      icon: TrendingUp,
      text: fieldData.area 
        ? `Прогноз урожайности для ${fieldData.area} га`
        : 'Высокая прогнозируемая урожайность',
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-400/20"
    },
    {
      icon: RotateCcw,
      text: fieldData.cropRotationHistory 
        ? 'План севооборота на следующий год'
        : 'После уборки - посев озимых зерновых',
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-400/20"
    }
  ];

  return (
    <div className="text-[#E8F4FF] h-full flex flex-col">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-2xl 3xl:text-3xl font-semibold">
          Агрономические рекомендации
        </h3>
        <div className="flex items-center space-x-2">
          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
            <Sprout className="w-3 h-3 mr-1" />
            Актуально
          </span>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto">
        {recommendations.map((rec, index) => (
          <div 
            key={index}
            className={`${rec.bgColor} ${rec.borderColor} border p-3 sm:p-4 rounded-lg flex items-center`}
          >
            <rec.icon 
              size={20} 
              className={`flex-shrink-0 ${rec.color}`} 
            />
            <span className={`ml-3 text-sm sm:text-base ${rec.color}`}>
              {rec.text}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-[#2D4A62]">
        <div className="bg-[#1A2E42] rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-[#8BA4B8]">
            <div className="flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Статус рекомендаций
            </div>
            <span className="text-green-400 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Актуально
            </span>
          </div>
          <div className="text-xs text-[#8BA4B8] mt-1">
            Рекомендации основаны на данных поля и текущем сезоне
          </div>
        </div>
      </div>
    </div>
  );
}