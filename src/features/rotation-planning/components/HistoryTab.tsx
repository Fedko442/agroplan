import { Calendar, Plus } from 'lucide-react';
import { CropHistoryRecord } from '../types';

interface HistoryTabProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  years: number[];
  filteredHistory: CropHistoryRecord[];
}

export const HistoryTab = ({ 
  selectedYear, 
  setSelectedYear, 
  years, 
  filteredHistory 
}: HistoryTabProps) => {
  const getSeasonName = (season: string) => {
    switch (season) {
      case 'spring': return 'Весна';
      case 'summer': return 'Лето';
      case 'autumn': return 'Осень';
      case 'winter': return 'Зима';
      default: return season;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
        <h2 className="text-lg md:text-xl font-semibold text-[#E8F4FF] flex items-center">
          <Calendar className="mr-2 text-blue-400" size={20} />
          История посадок
        </h2>
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="flex-1 sm:flex-none px-3 py-2 bg-[#0F1F2F] border border-[#2D4A62] rounded-lg text-[#E8F4FF] text-sm"
          >
            {years.map(year => (
              <option key={year} value={year}>{year} год</option>
            ))}
          </select>
          <button className="flex items-center px-3 py-2 bg-[#3388ff] text-white rounded-lg hover:bg-[#2970cc] transition-colors text-sm whitespace-nowrap">
            <Plus size={16} className="mr-1" />
            Добавить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-[#1A2E42] p-3 md:p-4 rounded-lg border border-[#2D4A62]">
          <div className="text-[#8BA4B8] text-xs md:text-sm mb-1">Записей в {selectedYear}</div>
          <div className="text-xl md:text-2xl font-bold text-[#E8F4FF]">{filteredHistory.length}</div>
        </div>
        <div className="bg-[#1A2E42] p-3 md:p-4 rounded-lg border border-[#2D4A62]">
          <div className="text-[#8BA4B8] text-xs md:text-sm mb-1">Общая площадь</div>
          <div className="text-xl md:text-2xl font-bold text-[#E8F4FF]">
            {filteredHistory.reduce((sum, record) => sum + record.area, 0).toFixed(1)} га
          </div>
        </div>
        <div className="bg-[#1A2E42] p-3 md:p-4 rounded-lg border border-[#2D4A62]">
          <div className="text-[#8BA4B8] text-xs md:text-sm mb-1">Уникальных культур</div>
          <div className="text-xl md:text-2xl font-bold text-[#E8F4FF]">
            {new Set(filteredHistory.map(record => record.crop)).size}
          </div>
        </div>
      </div>

      <div className="bg-[#1A2E42] rounded-lg border border-[#2D4A62] overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[#2D4A62]">
                <th className="text-center py-3 px-3 md:px-4 text-[#8BA4B8] font-medium text-xs md:text-sm">Поле</th>
                <th className="text-center py-3 px-3 md:px-4 text-[#8BA4B8] font-medium text-xs md:text-sm">Культура</th>
                <th className="text-center py-3 px-3 md:px-4 text-[#8BA4B8] font-medium text-xs md:text-sm">Сезон</th>
                <th className="text-center py-3 px-3 md:px-4 text-[#8BA4B8] font-medium text-xs md:text-sm">Площадь</th>
                <th className="text-center py-3 px-3 md:px-4 text-[#8BA4B8] font-medium text-xs md:text-sm">Урожайность</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((record) => (
                <tr key={record.id} className="border-b border-[#2D4A62] hover:bg-[#172B3E]">
                  <td className="text-center py-3 px-3 md:px-4 text-[#E8F4FF] text-xs md:text-sm">{record.fieldName}</td>
                  <td className="text-center py-3 px-3 md:px-4 text-[#E8F4FF] text-xs md:text-sm">{record.crop}</td>
                  <td className="text-center py-3 px-3 md:px-4 text-[#E8F4FF] text-xs md:text-sm capitalize">
                    {getSeasonName(record.season)}
                  </td>
                  <td className="text-center py-3 px-3 md:px-4 text-[#E8F4FF] text-xs md:text-sm">{record.area} га</td>
                  <td className="text-center py-3 px-3 md:px-4 text-[#E8F4FF] text-xs md:text-sm">
                    {record.yield ? `${record.yield} т/га` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
