import { Lightbulb, CheckCircle, AlertTriangle, XCircle, ArrowRight, CheckCircle as CheckIcon } from 'lucide-react';
import { FieldRecommendation, Suitability } from '../types';

interface RecommendationsTabProps {
  recommendations: FieldRecommendation[];
}

export const RecommendationsTab = ({ recommendations }: RecommendationsTabProps) => {
  const getSuitabilityIcon = (suitability: Suitability) => {
    switch (suitability) {
      case 'high': return <CheckCircle className="text-green-400" size={20} />;
      case 'medium': return <AlertTriangle className="text-yellow-400" size={20} />;
      case 'low': return <XCircle className="text-red-400" size={20} />;
      default: return null;
    }
  };

  const getSuitabilityText = (suitability: Suitability) => {
    switch (suitability) {
      case 'high': return 'Высокая';
      case 'medium': return 'Средняя';
      case 'low': return 'Низкая';
      default: return '';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      <h2 className="text-lg md:text-xl font-semibold text-[#E8F4FF] flex items-center">
        <Lightbulb className="mr-2 text-yellow-400" size={20} />
        Рекомендации по севообороту
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 w-full">
        {recommendations.map((recommendation) => (
          <div key={recommendation.fieldId} className="bg-[#1A2E42] rounded-lg p-3 md:p-4 border border-[#2D4A62] w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:mb-4 gap-2">
              <h3 className="text-base md:text-lg font-semibold text-[#E8F4FF]">{recommendation.fieldName}</h3>
              <div className="text-[#8BA4B8] text-xs md:text-sm">
                Предыдущая культура: <span className="text-[#E8F4FF]">{recommendation.previousCrop}</span>
              </div>
            </div>

            <div className="mb-3 md:mb-4 p-2 md:p-3 bg-[#2D4A62] rounded-lg">
              <div className="text-[#8BA4B8] text-xs md:text-sm mb-1">Состояние почвы:</div>
              <div className="text-[#E8F4FF] text-sm">{recommendation.soilCondition}</div>
            </div>

            <div className="space-y-3 md:space-y-4">
              {recommendation.recommendedCrops.map((cropRec, index) => (
                <div key={index} className="border border-[#2D4A62] rounded-lg p-2 md:p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 md:mb-3 gap-2">
                    <div className="flex items-center">
                      {getSuitabilityIcon(cropRec.suitability)}
                      <span className="text-[#E8F4FF] font-medium ml-2 text-sm md:text-base">{cropRec.crop}</span>
                    </div>
                    <div className={`text-xs md:text-sm ${
                      cropRec.suitability === 'high' ? 'text-green-400' :
                      cropRec.suitability === 'medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {getSuitabilityText(cropRec.suitability)}
                    </div>
                  </div>

                  <div className="text-[#8BA4B8] text-xs md:text-sm mb-2 md:mb-3">{cropRec.reason}</div>

                  <div className="space-y-1 md:space-y-2">
                    {cropRec.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center text-xs md:text-sm">
                        <CheckIcon className="text-green-400 mr-2 flex-shrink-0" size={14} />
                        <span className="text-[#E8F4FF]">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-2 md:mt-3 flex items-center justify-center px-3 py-2 bg-[#3388ff] text-white rounded-lg hover:bg-[#2970cc] transition-colors text-xs md:text-sm">
                    Выбрать эту культуру
                    <ArrowRight size={14} className="ml-2" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1A2E42] rounded-lg p-3 md:p-4 border border-[#2D4A62] w-full">
        <h3 className="text-base md:text-lg font-semibold text-[#E8F4FF] mb-2 md:mb-3">Принципы рекомендаций</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
          <div className="flex items-start">
            <CheckIcon className="text-green-400 mr-2 mt-0.5 flex-shrink-0" size={14} />
            <span className="text-[#E8F4FF]">Бобовые после зерновых для обогащения азотом</span>
          </div>
          <div className="flex items-start">
            <CheckIcon className="text-green-400 mr-2 mt-0.5 flex-shrink-0" size={14} />
            <span className="text-[#E8F4FF]">Культуры с разной корневой системой</span>
          </div>
          <div className="flex items-start">
            <CheckIcon className="text-green-400 mr-2 mt-0.5 flex-shrink-0" size={14} />
            <span className="text-[#E8F4FF]">Учет фитосанитарного состояния</span>
          </div>
          <div className="flex items-start">
            <CheckIcon className="text-green-400 mr-2 mt-0.5 flex-shrink-0" size={14} />
            <span className="text-[#E8F4FF]">Баланс питательных веществ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
