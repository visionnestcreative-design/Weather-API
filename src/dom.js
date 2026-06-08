import { state } from './state.js';
import * as utils from './utils.js';

export const elements = {
    appContainer: document.getElementById('app-container'),
    mainContent: document.getElementById('main-content'),
    errorBanner: document.getElementById('error-banner'),
    loader: document.getElementById('loader'),
    
    // Search & Top
    searchInput: document.getElementById('search-input'),
    searchForm: document.getElementById('search-form'),
    geoBtn: document.getElementById('geo-btn'),
    recentSearches: document.getElementById('recent-searches'),
    unitToggle: document.getElementById('unit-toggle'),
    
    // Current Weather
    locName: document.getElementById('location-name'),
    locDate: document.getElementById('location-date'),
    currentTemp: document.getElementById('current-temp'),
    feelsLike: document.getElementById('feels-like'),
    currentIcon: document.getElementById('current-icon'),
    currentCondition: document.getElementById('current-condition'),
    
    // AQI
    aqiCircle: document.getElementById('aqi-circle'),
    aqiStatus: document.getElementById('aqi-status'),
    aqiPm25: document.getElementById('aqi-pm25'),
    
    // Metrics
    humidityVal: document.getElementById('humidity-val'),
    windVal: document.getElementById('wind-val'),
    windDir: document.getElementById('wind-dir'),
    pressureVal: document.getElementById('pressure-val'),
    uvVal: document.getElementById('uv-val'),
    visVal: document.getElementById('vis-val'),
    
    // Forecasts
    hourlyContainer: document.getElementById('hourly-container'),
    dailyContainer: document.getElementById('daily-container')
};

export const showError = (message) => {
    elements.errorBanner.textContent = message;
    elements.errorBanner.classList.remove('hidden');
    setTimeout(() => {
        elements.errorBanner.classList.add('hidden');
    }, 5000);
};

export const setLoader = (isLoading) => {
    if (isLoading) {
        elements.mainContent.classList.add('skeleton-active');
        // If we also want the spinning overlay:
        // elements.loader.classList.remove('hidden');
    } else {
        elements.mainContent.classList.remove('skeleton-active');
        elements.loader.classList.add('hidden');
    }
};

export const renderRecentSearches = (onSearch) => {
    elements.recentSearches.innerHTML = '';
    state.recentSearches.forEach(query => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = query;
        tag.addEventListener('click', () => onSearch(query));
        elements.recentSearches.appendChild(tag);
    });
};

export const renderUI = () => {
    const { data, isMetric } = state;
    if (!data) return;

    const current = data.current;
    const location = data.location;
    const tz = location.tz_id;

    // Theme Update
    const theme = utils.determineTheme(current.condition.code, current.is_day);
    document.body.className = theme;

    // Toggle Switch State
    elements.unitToggle.setAttribute('aria-checked', isMetric ? 'true' : 'false');
    const labels = elements.unitToggle.querySelectorAll('.toggle-label');
    labels[0].classList.toggle('active', isMetric);
    labels[1].classList.toggle('active', !isMetric);

    // Current Weather
    elements.locName.textContent = `${location.name}, ${location.country}`;
    elements.locDate.textContent = utils.formatDate(location.localtime_epoch, tz);
    
    elements.currentTemp.textContent = `${utils.convertTemp(current.temp_c, isMetric)}°`;
    elements.feelsLike.textContent = `${utils.convertTemp(current.feelslike_c, isMetric)}°`;
    
    elements.currentIcon.src = `https:${current.condition.icon}`;
    elements.currentIcon.classList.remove('hidden');
    elements.currentCondition.textContent = current.condition.text;

    // AQI
    if (current.air_quality) {
        const aqiIndex = current.air_quality['us-epa-index'];
        const aqiInfo = utils.getAqiDetails(aqiIndex);
        
        elements.aqiCircle.textContent = aqiIndex;
        elements.aqiCircle.style.borderColor = aqiInfo.color;
        
        elements.aqiStatus.textContent = aqiInfo.text;
        elements.aqiStatus.style.color = aqiInfo.color;
        
        elements.aqiPm25.textContent = current.air_quality.pm2_5 ? current.air_quality.pm2_5.toFixed(1) : '-';
    } else {
        elements.aqiStatus.textContent = "N/A";
        elements.aqiCircle.textContent = "-";
        elements.aqiPm25.textContent = "-";
        elements.aqiCircle.style.borderColor = "#fff";
        elements.aqiStatus.style.color = "#fff";
    }

    // Metrics
    elements.humidityVal.textContent = `${current.humidity}%`;
    elements.windVal.textContent = utils.convertWind(current.wind_kph, isMetric);
    elements.windDir.textContent = current.wind_dir;
    elements.pressureVal.textContent = utils.convertPressure(current.pressure_mb, isMetric);
    elements.uvVal.textContent = current.uv;
    elements.visVal.textContent = utils.convertVisibility(current.vis_km, isMetric);

    // Hourly Forecast (Next 24 hours starting from current hour)
    elements.hourlyContainer.innerHTML = '';
    const currentEpoch = location.localtime_epoch;
    
    // Combine today and tomorrow's hours safely
    let allHours = [];
    if (data.forecast && data.forecast.forecastday) {
        data.forecast.forecastday.forEach(day => {
            if (day.hour) {
                allHours = allHours.concat(day.hour);
            }
        });
    }
    
    // Filter to get next 24 hours
    let hourlyData = allHours.filter(h => h.time_epoch >= currentEpoch - 3600).slice(0, 24);
    
    // Filter to every 3 hours as requested by prompt
    hourlyData = hourlyData.filter((_, index) => index % 3 === 0);

    hourlyData.forEach(hour => {
        const item = document.createElement('div');
        item.className = 'hourly-item';
        item.innerHTML = `
            <span class="hourly-time">${utils.formatHour(hour.time_epoch, tz)}</span>
            <img class="hourly-icon" src="https:${hour.condition.icon}" alt="${hour.condition.text}">
            <span class="hourly-temp">${utils.convertTemp(hour.temp_c, isMetric)}°</span>
        `;
        elements.hourlyContainer.appendChild(item);
    });

    // Daily Forecast
    elements.dailyContainer.innerHTML = '';
    if (data.forecast && data.forecast.forecastday) {
        data.forecast.forecastday.forEach((day, index) => {
            const item = document.createElement('div');
            item.className = 'daily-item';
            const dayName = index === 0 ? 'Today' : utils.formatDay(day.date_epoch, tz);
            
            item.innerHTML = `
                <span class="daily-day">${dayName}</span>
                <div class="daily-icon-wrapper">
                    <img class="daily-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" title="${day.day.condition.text}">
                </div>
                <div class="daily-temps">
                    <span class="daily-max">${utils.convertTemp(day.day.maxtemp_c, isMetric)}°</span>
                    <span class="daily-min">${utils.convertTemp(day.day.mintemp_c, isMetric)}°</span>
                </div>
            `;
            elements.dailyContainer.appendChild(item);
        });
    }
};
