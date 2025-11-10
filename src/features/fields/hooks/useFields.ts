import { useState } from 'react';
import { Field } from '../types';

export const mockFields: Field[] = [
  { id: 1, name: "Поле Северное", area: "50 га", crop: "Картофель", status: "active" },
  { id: 2, name: "Поле Южное", area: "30 га", crop: "Пшеница", status: "planned" },
  { id: 3, name: "Поле Западное", area: "25 га", crop: "Ячмень", status: "active" },
];

export const useFields = () => {
  const [selectedField, setSelectedField] = useState<number>(1);
  const [fields] = useState<Field[]>(mockFields);

  const selectedFieldData = fields.find(field => field.id === selectedField);

  return {
    fields,
    selectedField,
    selectedFieldData,
    setSelectedField,
  };
};
