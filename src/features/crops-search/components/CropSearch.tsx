// src/features/crops-search/components/CropSearch.tsx
"use client";

import React, { useMemo } from "react";
import { useCropsSearch } from "../hooks/useCropsSearch";
import "./crop-search.css";

export const CropSearch: React.FC = () => {
  const {
    filteredCrops,
    selectedCrop,
    searchQuery,
    area,
    faoPriceData,
    totalCropsCount,
    mainCropsCount,
    rareCropsCount,
    setArea,
    setSearchQuery,
    handleSearchChange,
    getCropPrice,
    getPriceInRub,
    calculateProfit,
    setSelectedCrop,
  } = useCropsSearch();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleSearchChange(query);
  };

  // Функция локального расчёта подробных затрат (использует costPerHectare из crop)
  const calculateCostsBreakdown = (crop: typeof selectedCrop, hectares: number) => {
    if (!crop || !hectares || hectares <= 0) return null;

    const base = crop.costPerHectare; // затраты на 1 га из данных культуры
    // Процентное распределение — можно настроить
    const pct = {
      seeds: 0.25,
      fertilizers: 0.30,
      fuel: 0.15,
      water: 0.10,
      machinery: 0.12,
      labor: 0.08,
    };

    const seeds = Math.round(base * pct.seeds * hectares);
    const fertilizers = Math.round(base * pct.fertilizers * hectares);
    const fuel = Math.round(base * pct.fuel * hectares);
    const water = Math.round(base * pct.water * hectares);
    const machinery = Math.round(base * pct.machinery * hectares);
    const labor = Math.round(base * pct.labor * hectares);

    const total = seeds + fertilizers + fuel + water + machinery + labor;

    return {
      perHectare: Math.round(base),
      seeds,
      fertilizers,
      fuel,
      water,
      machinery,
      labor,
      total,
    };
  };

  // Вычисляем значения только при изменении selectedCrop или площади
  const costsBreakdown = useMemo(() => calculateCostsBreakdown(selectedCrop, area), [selectedCrop, area]);

  // profitData уже возвращает totalCost по crop.costPerHectare * area
  const profitData = selectedCrop ? calculateProfit(selectedCrop, area) : null;
  // selectedCropPrice
  const selectedCropPrice = selectedCrop ? getCropPrice(selectedCrop.name) : null;

  return (
    <div className="crop-search">
      <div className="main-content">
        {/* Боковая панель */}
        <div className="sidebar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск культур..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>

          <div className="filter-section">
            <div className="filter-title">Фильтры</div>
            <div className="filter-group">
              <label className="filter-label">Тип культуры</label>
              <select className="filter-select" onChange={() => { /* можно подключить фильтр */ }}>
                <option>Все типы</option>
                <option>Основные</option>
                <option>Редкие</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Категория</label>
              <select className="filter-select" onChange={() => { /* можно подключить фильтр */ }}>
                <option>Все категории</option>
                <option>Зерновые</option>
                <option>Овощи</option>
                <option>Фрукты</option>
                <option>Бобовые</option>
                <option>Масличные</option>
              </select>
            </div>
          </div>

          <div className="stats-panel">
            <div className="stat-item">
              <span className="stat-label">Всего культур</span>
              <span className="stat-value">{totalCropsCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Основные</span>
              <span className="stat-value">{mainCropsCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Редкие</span>
              <span className="stat-value">{rareCropsCount}</span>
            </div>
          </div>
        </div>

        {/* Основная область контента */}
        <div className="content-area">
          <div className="content-header">
            <div className="header-left">
              <h1 className="content-title">Сельскохозяйственные культуры</h1>
              <p className="content-subtitle">Анализ прибыльности и расчет доходности</p>
            </div>
            <div className="header-right">
              <div className="counter-badge">{totalCropsCount} культур</div>
              {/* Кнопка обновления удалена */}
            </div>
          </div>

          {/* Компактный список культур */}
          <div className="compact-crops-container">
            <div className="compact-crops-list">
              {filteredCrops.map((crop) => (
                <div
                  key={crop.id}
                  className={`compact-crop-item ${selectedCrop?.id === crop.id ? "selected" : ""}`}
                  onClick={() => setSelectedCrop(crop)}
                >
                  <div className="compact-crop-main">
                    <span className="compact-crop-name">{crop.name}</span>
                    <span className={`compact-crop-type ${crop.type}`}>{crop.type}</span>
                  </div>
                  <div className="compact-crop-details">
                    <span className="compact-crop-yield">{crop.yieldPerHectare} т/га</span>
                    <span className="compact-crop-price">
                      {getPriceInRub(crop.name).toLocaleString("ru-RU")} RUB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Детали выбранной культуры */}
      {selectedCrop && (
        <div className="crop-detail-full">
          <div className="detail-layout">
            {/* Левая часть - характеристики */}
            <div className="detail-left">
              <div className="detail-header">
                <div className="crop-title-section">
                  <h2>{selectedCrop.name}</h2>
                  {selectedCrop.latinName && <p className="latin-name">{selectedCrop.latinName}</p>}
                </div>
                <div className="crop-meta">
                  <span className={`type-badge ${selectedCrop.type}`}>{selectedCrop.type}</span>
                  <span className="category-tag">{selectedCrop.category}</span>
                </div>
              </div>

              <div className="info-section">
                <h3>Характеристики</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Урожайность</label>
                    <span>{selectedCrop.yieldPerHectare} т/га</span>
                  </div>
                  <div className="info-item">
                    <label>Затраты на га (база)</label>
                    <span>{selectedCrop.costPerHectare.toLocaleString("ru-RU")} RUB</span>
                  </div>
                  <div className="info-item">
                    <label>Цена за тонну (FAO)</label>
                    <span>{getPriceInRub(selectedCrop.name).toLocaleString("ru-RU")} RUB</span>
                  </div>
                  <div className="info-item">
                    <label>Категория</label>
                    <span>{selectedCrop.category}</span>
                  </div>
                  <div className="info-item">
                    <label>Тип</label>
                    <span>{selectedCrop.type}</span>
                  </div>
                  {selectedCrop.description && (
                    <div className="info-item">
                      <label>Описание</label>
                      <span>{selectedCrop.description}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Правая часть - цены и калькулятор */}
            <div className="detail-right">
              {/* Цены */}
              <div className="price-section">
                <h3>Цены производителей 2024</h3>
                <div className="price-card">
                  {selectedCropPrice ? (
                    <>
                      <div className="price-main">
                        <span className="price-value">
                          {selectedCropPrice.producer_price.toLocaleString("ru-RU")}
                        </span>
                        <span className="price-unit">{faoPriceData?.currency_unit ?? "RUB"}</span>
                      </div>
                      <div className="price-details">
                        <div className="price-meta">
                          <span>За тонну продукции</span>
                          <span>Источник: {faoPriceData?.data_source ?? "FAOSTAT (mock)"}</span>
                          {selectedCropPrice.price_index && <span>Индекс цен: {selectedCropPrice.price_index}</span>}
                        </div>
                        <div
                          className={`price-trend ${
                            selectedCropPrice.price_index && selectedCropPrice.price_index > 150 ? "positive" : "negative"
                          }`}
                        >
                          {selectedCropPrice.price_index && selectedCropPrice.price_index > 150 ? "📈 Выше среднего" : "📉 Средний"}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="empty-state">
                      <p>Данные о цене не найдены</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Калькулятор прибыли и затрат */}
              <div className="calculator-section">
                <h3>Калькулятор прибыли и затрат</h3>

                <div className="calculator-input">
                  <label>Площадь посева (га)</label>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="area-input-no-arrows"
                    min={0}
                    step={0.1}
                  />
                </div>

                {profitData && area > 0 ? (
                  <>
                    <div className="calculation-results">
                      <div className="result-row">
                        <span>Общий урожай:</span>
                        <span>{profitData.totalYield.toFixed(1)} т</span>
                      </div>
                      <div className="result-row">
                        <span>Выручка от продажи:</span>
                        <span>{profitData.totalRevenue.toLocaleString("ru-RU")} RUB</span>
                      </div>
                      {/* Если есть breakdown вычислим и покажем */}
                      {costsBreakdown ? (
                        <>
                          <h4 style={{ marginTop: 12 }}>Детализация затрат (на {area} га)</h4>
                          <div className="cost-breakdown">
                            <div className="result-row"><span>Семена:</span><span>{costsBreakdown.seeds.toLocaleString("ru-RU")} RUB</span></div>
                            <div className="result-row"><span>Удобрения:</span><span>{costsBreakdown.fertilizers.toLocaleString("ru-RU")} RUB</span></div>
                            <div className="result-row"><span>Топливо:</span><span>{costsBreakdown.fuel.toLocaleString("ru-RU")} RUB</span></div>
                            <div className="result-row"><span>Вода / полив:</span><span>{costsBreakdown.water.toLocaleString("ru-RU")} RUB</span></div>
                            <div className="result-row"><span>Техника / амортизация:</span><span>{costsBreakdown.machinery.toLocaleString("ru-RU")} RUB</span></div>
                            <div className="result-row"><span>Рабочая сила:</span><span>{costsBreakdown.labor.toLocaleString("ru-RU")} RUB</span></div>

                            <div className="result-row total">
                              <strong>Итого затрат:</strong>
                              <strong>{costsBreakdown.total.toLocaleString("ru-RU")} RUB</strong>
                            </div>

                            <div className="result-row profit">
                              <span>Чистая прибыль:</span>
                              <span className={profitData.totalProfit >= 0 ? "positive" : "negative"}>
                                {profitData.totalProfit.toLocaleString("ru-RU")} RUB
                              </span>
                            </div>

                            <div className="result-row">
                              <span>Прибыль с гектара:</span>
                              <span className={profitData.profitPerHectare >= 0 ? "positive" : "negative"}>
                                {profitData.profitPerHectare.toLocaleString("ru-RU")} RUB/га
                              </span>
                            </div>

                            <div className="result-row">
                              <span>Рентабельность:</span>
                              <span className={profitData.profitability >= 0 ? "positive" : "negative"}>
                                {profitData.profitability.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="calculation-note">Введите корректную площадь для расчёта затрат</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="calculation-note">Введите площадь для расчета прибыли</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
