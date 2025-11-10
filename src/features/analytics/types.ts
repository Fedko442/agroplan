export interface SatelliteIndex {
  name: string;
  value: number;
  color: string;
  recommendations: string[];
}

export interface SatelliteData {
  indices: SatelliteIndex[];
}
export interface SatelliteIndices {
  ndvi: number;
  ndwi: number; 
  msi: number;
}

export interface LLPoint {
  lat: number;
  lng: number;
  name?: string;
  id?: string;
  satelliteData?: SatelliteIndices;
}