import { CONFIG } from './config.js';

export const fetchWeather = async (query) => {
    if (!CONFIG.API_KEY || CONFIG.API_KEY === 'YOUR_WEATHERAPI_KEY_HERE') {
        throw new Error("Missing API Key. Please add your WeatherAPI key in config.js");
    }

    const url = `${CONFIG.BASE_URL}/forecast.json?key=${CONFIG.API_KEY}&q=${encodeURIComponent(query)}&days=3&aqi=yes&alerts=no`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || `HTTP Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        if (error.name === 'TypeError') {
            throw new Error("Network connection lost or blocked by CORS/Adblocker.");
        }
        throw error;
    }
};
