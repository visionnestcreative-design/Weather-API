import { CONFIG } from './config.js';

class State {
    constructor() {
        this.data = null;
        this.isMetric = localStorage.getItem('weather_unit') !== 'imperial';
        this.recentSearches = JSON.parse(localStorage.getItem('recent_searches')) || [];
    }

    setUnit(metric) {
        this.isMetric = metric;
        localStorage.setItem('weather_unit', metric ? 'metric' : 'imperial');
    }

    setData(data) {
        this.data = data;
    }

    addRecentSearch(query) {
        if (!query) return;
        const normalized = query.trim().toLowerCase();
        
        // Remove if exists
        this.recentSearches = this.recentSearches.filter(s => s.toLowerCase() !== normalized);
        
        // Add to front
        this.recentSearches.unshift(query);
        
        // Trim to max length
        if (this.recentSearches.length > CONFIG.MAX_RECENT_SEARCHES) {
            this.recentSearches.pop();
        }
        
        localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
    }

    getCachedData(query) {
        const cacheKey = `weather_cache_${query.toLowerCase()}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                const now = Date.now();
                if (now - parsed.timestamp < CONFIG.CACHE_DURATION) {
                    return parsed.data;
                } else {
                    localStorage.removeItem(cacheKey); // Expired
                }
            } catch (e) {
                console.error('Cache parsing error', e);
            }
        }
        return null;
    }

    setCacheData(query, data) {
        const cacheKey = `weather_cache_${query.toLowerCase()}`;
        const payload = {
            timestamp: Date.now(),
            data: data
        };
        localStorage.setItem(cacheKey, JSON.stringify(payload));
    }
}

export const state = new State();
