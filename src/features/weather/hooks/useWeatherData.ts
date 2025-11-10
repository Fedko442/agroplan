import { WeatherData } from '../types';

export const useWeatherData = (fieldId: number) => {
  const weatherData: WeatherData = {
    temperature: "+15°C",
    precipitation: "2.5 мм",
    humidity: "65%",
    wind: "3.2 м/с",
    recommendations: [
      "Благоприятные условия для посева",
      "Ожидаются осадки через 2 дня",
      "Температура в норме для картофеля",
      "Влажность оптимальная для роста"
    ]
  };

  return { weatherData };
};
