// services/weatherApi.ts
import { WeatherApiResponse, WeatherData } from '../types';

export class WeatherApiService {
  private baseUrl = 'https://api.weatherapi.com/v1';
  private apiKey = process.env.REACT_APP_WEATHER_API_KEY || '22f1aa6c7ada4e7fb82203632250904';

  async getWeatherByCoords(lat: number, lng: number): Promise<WeatherApiResponse> {
    const response = await fetch(
      `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${lat},${lng}&days=3&lang=ru`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    return await response.json();
  }

  transformWeatherData(apiData: WeatherApiResponse): WeatherData {
    const recommendations = this.generateRecommendations(apiData);

    return {
      temperature: `${Math.round(apiData.current.temp_c)}°C`,
      precipitation: `${apiData.current.precip_mm} мм`,
      humidity: `${apiData.current.humidity}%`,
      wind: `${(apiData.current.wind_kph / 3.6).toFixed(1)} м/с`,
      recommendations
    };
  }

  private generateRecommendations(apiData: WeatherApiResponse): string[] {
    const rec: string[] = [];
    const t = apiData.current.temp_c;
    const h = apiData.current.humidity;
    const p = apiData.current.precip_mm;
    const w = apiData.current.wind_kph / 3.6;
    const condition = apiData.current.condition.text.toLowerCase();

    // 1. Общая оценка условий
    rec.push(`Текущие условия: ${condition}, ${t}°C`);

    // 2. Температура
    if (t < 0) rec.push("Заморозки! Защитите всходы укрывным материалом");
    else if (t < 5) rec.push("Холодно для посева. Дождитесь прогрева почвы до +5°C");
    else if (t < 10) rec.push("Можно сеять холодостойкие культуры: пшеница, ячмень, овес");
    else if (t < 15) rec.push("Оптимально для посева зерновых и ранних овощей");
    else if (t < 25) rec.push("Идеальные условия для роста большинства культур");
    else if (t < 30) rec.push("Жарко. Увеличьте полив, особенно для овощных культур");
    else rec.push("Экстремальная жара! Защитите растения от солнечных ожогов");

    // 3. Влажность
    if (h < 30) rec.push("Очень сухо! Срочный полив необходим, высок риск засухи");
    else if (h < 50) rec.push("Пониженная влажность. Увеличьте частоту полива");
    else if (h < 70) rec.push("Влажность оптимальна для фотосинтеза и роста");
    else if (h < 85) rec.push("Повышенная влажность. Контролируйте развитие грибковых заболеваний");
    else rec.push("Высокая влажность! Риск гнилей - обеспечьте вентиляцию");

    // 4. Осадки
    if (p === 0) {
      if (t > 20) rec.push("Без осадков + жара. Организуйте регулярный полив");
      else rec.push("Отсутствие дождей. Планируйте полив в ближайшие дни");
    } else if (p <= 2) rec.push("Легкие осадки. Дополнительный полив может не потребоваться");
    else if (p <= 5) rec.push("Умеренные осадки. Хорошо для укоренения и роста");
    else if (p <= 15) rec.push("Сильные осадки. Проверьте дренаж, возможен застой воды");
    else rec.push("Обильные осадки! Контролируйте эрозию почвы и подтопления");

    // 5. Ветер
    if (w < 3) rec.push("Штиль. Благоприятно для опрыскивания и внекорневых подкормок");
    else if (w < 6) rec.push("Легкий ветер. Условия хороши для опыления растений");
    else if (w < 10) rec.push("Умеренный ветер. Будьте осторожны с обработками - возможен снос");
    else if (w < 15) rec.push("Сильный ветер. Риск полегания посевов, отложите обработки");
    else rec.push("Опасный ветер! Защитите молодые растения, отложите полевые работы");

    // 6. Прогнозные рекомендации на завтра
    if (apiData.forecast?.forecastday?.length) {
      const tomorrow = apiData.forecast.forecastday[0];
      if (tomorrow) {
        const rainChance = tomorrow.day.daily_chance_of_rain;
        const maxT = tomorrow.day.maxtemp_c;
        const minT = tomorrow.day.mintemp_c;

        if (rainChance > 70) rec.push(`Завтра сильные осадки (${rainChance}%). Отложите обработки`);
        else if (rainChance > 40) rec.push(`Завтра возможен дождь (${rainChance}%). Планируйте работы с учетом этого`);

        if (minT < 2) rec.push("Завтра ожидаются заморозки! Защитите теплолюбивые культуры");
        if (maxT > 30) rec.push("Завтра жара! Увеличьте полив, особенно для овощей");
      }
    }

    // 7. Специфические агрономические рекомендации
    if (t >= 8 && t <= 25 && h >= 40 && h <= 70 && p <= 5) rec.push("Идеальное окно для посевных работ и подкормок");
    if (w < 5 && p === 0) rec.push("Благоприятные условия для внесения СЗР и удобрений");

    // Ограничим до 5 самых важных рекомендаций
    return this.prioritizeRecommendations(rec).slice(0, 5);
  }

  private prioritizeRecommendations(recommendations: string[]): string[] {
    const priorityMap: { [key: string]: number } = {
      'заморозки': 1,
      'опасный ветер': 1,
      'обильные осадки': 1,
      'экстремальная жара': 1,
      'очень сухо': 2,
      'сильные осадки': 2,
      'высокая влажность': 2,
      'идеальное окно': 3,
      'благоприятные условия': 3,
      'оптимально': 4,
      'можно сеять': 4
    };

    return recommendations.sort((a, b) => {
      const aPriority = this.getPriority(a, priorityMap);
      const bPriority = this.getPriority(b, priorityMap);
      return aPriority - bPriority;
    });
  }

  private getPriority(recommendation: string, priorityMap: { [key: string]: number }): number {
    const lowerRecommendation = recommendation.toLowerCase();
    for (const [key, priority] of Object.entries(priorityMap)) {
      if (lowerRecommendation.includes(key)) return priority;
    }
    return 5;
  }
}

export const weatherApiService = new WeatherApiService();
