// Utility Functions

export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};

export const formatTime = (epoch, timezone) => {
    const date = new Date(epoch * 1000);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone
    });
};

export const formatHour = (epoch, timezone) => {
    const date = new Date(epoch * 1000);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
        timeZone: timezone
    });
};

export const formatDay = (epoch, timezone) => {
    const date = new Date(epoch * 1000);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: timezone
    });
};

export const formatDate = (epoch, timezone) => {
    const date = new Date(epoch * 1000);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: timezone
    });
};

export const convertTemp = (tempC, isMetric) => {
    if (isMetric) return Math.round(tempC);
    return Math.round((tempC * 9/5) + 32);
};

export const convertWind = (kph, isMetric) => {
    if (isMetric) return `${Math.round(kph)} km/h`;
    return `${Math.round(kph / 1.609)} mph`;
};

export const convertPressure = (mb, isMetric) => {
    if (isMetric) return `${mb} mb`;
    return `${(mb * 0.02953).toFixed(2)} inHg`;
};

export const convertVisibility = (km, isMetric) => {
    if (isMetric) return `${km} km`;
    return `${(km / 1.609).toFixed(1)} mi`;
};

export const determineTheme = (code, isDay) => {
    // WeatherAPI condition codes
    if (code === 1000) return isDay ? 'theme-clear-day' : 'theme-clear-night';
    if ([1003, 1006, 1009].includes(code)) return 'theme-cloudy';
    if ([1030, 1135, 1148].includes(code)) return 'theme-fog';
    if (code >= 1066 && code <= 1237 && ![1087, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201].includes(code)) return 'theme-snow';
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'theme-thunder';
    return 'theme-rain';
};

export const getAqiDetails = (index) => {
    // US EPA Index (1-6)
    const aqiMap = {
        1: { text: 'Good', color: '#00e400' },
        2: { text: 'Moderate', color: '#ffff00' },
        3: { text: 'Unhealthy for Sensitive Groups', color: '#ff7e00' },
        4: { text: 'Unhealthy', color: '#ff0000' },
        5: { text: 'Very Unhealthy', color: '#8f3f97' },
        6: { text: 'Hazardous', color: '#7e0023' }
    };
    return aqiMap[index] || { text: 'Unknown', color: '#ccc' };
};
