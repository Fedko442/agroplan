import { Field } from '../types';

interface FieldCardProps {
  field: Field;
  isSelected: boolean;
  onSelect: () => void;
}

export default function FieldCard({ field, isSelected, onSelect }: FieldCardProps) {
  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="font-semibold">{field.fieldData.name}</div>
      <div className="text-sm text-gray-600">Культура: {field.fieldData.crop}</div>
      <div className="text-sm text-gray-600">Площадь: {field.fieldData.area} га</div>
      <div className="text-sm text-gray-600">Регион: {field.region?.name || 'Не указан'}</div>
    </div>
  );
}
