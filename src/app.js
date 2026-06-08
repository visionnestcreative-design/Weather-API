import { fetchWeather } from './api.js';
import { state } from './state.js';
import * as dom from './dom.js';
import { debounce } from './utils.js';

const handleSearch = async (query) => {
    if (!query) return;
    
    dom.setLoader(true);
    
    try {
        // Check cache first
        let data = state.getCachedData(query);
        
        if (!data) {
            data = await fetchWeather(query);
            state.setCacheData(query, data);
        }
        
        state.setData(data);
        state.addRecentSearch(data.location.name);
        
        dom.renderUI();
        dom.renderRecentSearches((q) => {
            dom.elements.searchInput.value = q;
            handleSearch(q);
        });
        
    } catch (error) {
        dom.showError(error.message);
    } finally {
        dom.setLoader(false);
    }
};

const handleGeolocation = () => {
    if (!navigator.geolocation) {
        dom.showError("Geolocation is not supported by your browser.");
        return;
    }

    dom.setLoader(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const query = `${position.coords.latitude},${position.coords.longitude}`;
            handleSearch(query);
        },
        (error) => {
            console.warn("Geolocation denied or failed.", error);
            // Fallback to a default city if user denies
            handleSearch("London");
            dom.showError("Location access denied. Displaying default city.");
        },
        { timeout: 10000 }
    );
};

const initEventListeners = () => {
    // Form Submit
    dom.elements.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = dom.elements.searchInput.value.trim();
        handleSearch(query);
    });

    // Debounced Input (e.g. trigger search after typing stops for 500ms, only if >= 3 chars)
    dom.elements.searchInput.addEventListener('input', debounce((e) => {
        const query = e.target.value.trim();
        if (query.length >= 3) {
            handleSearch(query);
        }
    }, 500));

    // Geo Button
    dom.elements.geoBtn.addEventListener('click', handleGeolocation);

    // Unit Toggle
    dom.elements.unitToggle.addEventListener('click', () => {
        state.setUnit(!state.isMetric);
        dom.renderUI();
    });

    // Unit Toggle Keyboard A11y
    dom.elements.unitToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            state.setUnit(!state.isMetric);
            dom.renderUI();
        }
    });
};

const init = () => {
    dom.renderRecentSearches((query) => {
        dom.elements.searchInput.value = query;
        handleSearch(query);
    });
    
    initEventListeners();
    
    // Try to load initial data
    if (state.recentSearches.length > 0) {
        // Load last searched city
        dom.elements.searchInput.value = state.recentSearches[0];
        handleSearch(state.recentSearches[0]);
    } else {
        // Request geolocation
        handleGeolocation();
    }
};

// Start app
document.addEventListener('DOMContentLoaded', init);
