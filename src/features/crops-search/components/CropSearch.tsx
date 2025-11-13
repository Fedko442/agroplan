// CropSearch.tsx
"use client";

import React, { useRef } from 'react';
import { useCropsSearch } from '../hooks/useCropsSearch';
import './crop-search.css';

export const CropSearch: React.FC = () => {
  const {
    filteredCrops,
    selectedCrop,
    searchQuery,
    area,
    economics,
    loading,
    error,
    prices,
    pricesLoading,
    totalCropsCount,
    mainCropsCount,
    rareCropsCount,
    setSelectedCrop,
    setArea,
    setSearchQuery,
    handleSearchChange,
    refreshPrices
  } = useCropsSearch();

  const cropsListRef = useRef<HTMLDivElement>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleSearchChange(query, cropsListRef);
  };

  const getCropPrice = (cropId: string) => {
    return prices.find(price => price.commodity === cropId);
  };

  // Функция для расчета экономики с отрицательной прибылью в первый месяц
  const calculateEconomics = (crop: any, area: number, price: any) => {
    if (!price || area <= 0) return null;

    const revenue = price.price * crop.yield * area;
    // Увеличиваем расходы чтобы прибыль была отрицательной в первый месяц
    const expenses = revenue * 1.8; // Расходы на 80% больше дохода
    const profit = revenue - expenses;
    const profitability = ((profit / expenses) * 100);

    return {
      revenue: Math.round(revenue),
      expenses: Math.round(expenses),
      profit: Math.round(profit),
      profitability: profitability.toFixed(1)
    };
  };

  const currentEconomics = selectedCrop && getCropPrice(selectedCrop.id) 
    ? calculateEconomics(selectedCrop, area, getCropPrice(selectedCrop.id))
    : null;

  if (loading) {
    return (
      <div className="crop-search">
        <div className="loading-panel">Загрузка культур...</div>
      </div>
    );
  }

  return (
    <div className="crop-search">
      {/* Основной контент */}
      <div className="main-content">
        {/* Боковая панель фильтров */}
        <aside className="sidebar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Введите название или букву..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-section">
            <h3 className="filter-title">Фильтры</h3>
            <div className="filter-group">
              <label className="filter-label">Категория</label>
              <select className="filter-select">
                <option>Все категории</option>
                <option>Эфирномасличные</option>
                <option>Технические</option>
                <option>Лекарственные</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Тип</label>
              <select className="filter-select">
                <option>Все типы</option>
                <option>Основная</option>
                <option>Редкая</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Урожайность</label>
              <select className="filter-select">
                <option>Любая</option>
                <option>Высокая (&gt; 3 т/га)</option>
                <option>Средняя (1-3 т/га)</option>
                <option>Низкая (&lt; 1 т/га)</option>
              </select>
            </div>
          </div>

          <div className="stats-panel">
            <div className="stat-item">
              <span className="stat-value">{totalCropsCount}</span>
              <span className="stat-label">всего культур</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{mainCropsCount}</span>
              <span className="stat-label">основные</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{rareCropsCount}</span>
              <span className="stat-label">редкие</span>
            </div>
          </div>
        </aside>
        
        {/* Основная область контента */}
        <main className="content-area">
          <div className="content-header">
            <div className="header-left">
              <h1 className="content-title">Поиск сельскохозяйственных культур</h1>
              <p className="content-subtitle">Эко-калькулятор • {pricesLoading ? 'Обновление...' : 'Локальные данные'}</p>
            </div>
            <div className="header-right">
              <span className="counter-badge">{filteredCrops.length} из {totalCropsCount}</span>
              <button 
                className="refresh-btn" 
                onClick={refreshPrices} 
                disabled={pricesLoading}
              >
                {pricesLoading ? '🔄' : '⟳'} Обновить
              </button>
            </div>
          </div>

          {/* Компактный список культур с прокруткой */}
          <div className="compact-crops-container">
            <div className="compact-crops-list" ref={cropsListRef}>
              {filteredCrops.map((crop) => {
                const price = getCropPrice(crop.id);
                const isSelected = selectedCrop?.id === crop.id;
                
                return (
                  <div
                    key={crop.id}
                    className={`compact-crop-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCrop(crop)}
                  >
                    <div className="compact-crop-main">
                      <span className="compact-crop-name">{crop.name}</span>
                      <span className={`compact-crop-type ${crop.type}`}>
                        {crop.type}
                      </span>
                    </div>
                    <div className="compact-crop-details">
                      <span className="compact-crop-yield">{crop.yield} т/га</span>
                      {price && (
                        <span className="compact-crop-price">{price.price.toLocaleString()} ₽/т</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {filteredCrops.length === 0 && (
            <div className="empty-state">
              <h3>Культуры не найдены</h3>
              <p>Попробуйте изменить параметры поиска</p>
            </div>
          )}
        </main>
      </div>

      {/* Детали выбранной культуры - полноразмерное окно без скролла */}
      {selectedCrop && (
        <div className="crop-detail-full">
          <div className="detail-layout">
            {/* Левая часть - характеристики культуры */}
            <div className="detail-left">
              <div className="detail-header">
                <div className="crop-title-section">
                  <h2>{selectedCrop.name}</h2>
                  <p className="latin-name">{selectedCrop.latin}</p>
                </div>
                <div className="crop-meta">
                  <span className={`type-badge ${selectedCrop.type}`}>
                    {selectedCrop.type}
                  </span>
                  <span className="category-tag">{selectedCrop.categories[0]}</span>
                </div>
              </div>

              <div className="info-section">
                <h3>Характеристики культуры</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Категории</label>
                    <span>{selectedCrop.categories.join(', ')}</span>
                  </div>
                  <div className="info-item">
                    <label>Тип</label>
                    <span>{selectedCrop.type}</span>
                  </div>
                  <div className="info-item">
                    <label>Урожайность</label>
                    <span>{selectedCrop.yield} т/га</span>
                  </div>
                  <div className="info-item">
                    <label>ID культуры</label>
                    <span className="crop-id">{selectedCrop.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Правая часть - цены и калькулятор */}
            <div className="detail-right">
              {/* Цены */}
              {getCropPrice(selectedCrop.id) && (
                <div className="price-section">
                  <h3>Текущие цены</h3>
                  <div className="price-card">
                    <div className="price-main">
                      <span className="price-value">{getCropPrice(selectedCrop.id)?.price.toLocaleString()} ₽</span>
                      <span className="price-unit">за тонну</span>
                    </div>
                    <div className="price-details">
                      <div className="price-meta">
                        <span>Источник: {getCropPrice(selectedCrop.id)?.source}</span>
                        <span>Обновлено: {getCropPrice(selectedCrop.id)?.date}</span>
                      </div>
                      {getCropPrice(selectedCrop.id)?.changePercent && (
                        <div className={`price-trend ${(getCropPrice(selectedCrop.id)?.changePercent || 0) >= 0 ? 'positive' : 'negative'}`}>
                          {(getCropPrice(selectedCrop.id)?.changePercent || 0) >= 0 ? '↗' : '↘'} 
                          {Math.abs(getCropPrice(selectedCrop.id)?.changePercent || 0)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Экономический калькулятор */}
              <div className="calculator-section">
                <h3>Экономический расчет</h3>
                <div className="calculator-input">
                  <label>Площадь посева (га)</label>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    min="1"
                    max="10000"
                    placeholder="Введите площадь"
                    className="area-input-no-arrows"
                  />
                </div>

                {currentEconomics && area > 0 && (
                  <div className="calculation-results">
                    <div className="result-row">
                      <span>Общие расходы:</span>
                      <strong>{currentEconomics.expenses.toLocaleString()} ₽</strong>
                    </div>
                    <div className="result-row">
                      <span>Ожидаемый доход:</span>
                      <strong>{currentEconomics.revenue.toLocaleString()} ₽</strong>
                    </div>
                    <div className="result-row">
                      <span>Чистая прибыль:</span>
                      <strong className={currentEconomics.profit >= 0 ? 'positive' : 'negative'}>
                        {currentEconomics.profit.toLocaleString()} ₽
                      </strong>
                    </div>
                    <div className="result-row">
                      <span>Рентабельность:</span>
                      <strong className={currentEconomics.profitability >= 0 ? 'positive' : 'negative'}>
                        {currentEconomics.profitability}%
                      </strong>
                    </div>
                    {currentEconomics.profit < 0 && (
                      <div className="calculation-note">
                        *В первый месяц наблюдаются отрицательные показатели из-за высоких стартовых затрат
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-panel">
          {error}
        </div>
      )}
    </div>
  );
};