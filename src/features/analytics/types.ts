export interface SatelliteIndex {
  name: string;
  value: number;
  color: string;
  recommendations: string[];
}

export interface SatelliteData {
  indices: SatelliteIndex[];
}
