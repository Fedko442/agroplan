export type LLPoint = { 
  lat: number; 
  lng: number; 
  name?: string;
  id?: string;
};

export type FieldData = {
  name: string;
  area: number;
  crop: string;
  isActive: boolean;
  soilType: string;
  soilData?: SoilData;
  segmentLengths: { segment: string; length: number }[];
  notes: string;
  cropRotationHistory: string;
  plannedOperations: PlannedOperation[];
  fertilizers: Fertilizer[];
  irrigationSystem: IrrigationSystem;
};

export type SoilData = {
  ph: number;
  organicCarbon: number;
  clay: number;
  sand: number;
  silt: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
};

export type PlannedOperation = {
  type: string;
  date: string;
  status: 'planned' | 'in-progress' | 'completed';
};

export type Fertilizer = {
  type: string;
  name: string;
  applicationDate: string;
  amount: number;
  unit: string;
};

export type IrrigationSystem = {
  hasSystem: boolean;
  type: string;
  description: string;
};