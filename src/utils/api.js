export const API_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`;

export const fetchAPI = async (endpoint, options = {}) => {
    try {
        const url = `${API_URL}${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };
        // Setup backend authentication token here in Phase 2

        const response = await fetch(url, {
            ...options,
            headers: { ...defaultHeaders, ...options.headers }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data; // returns the { success, data } object
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error;
    }
};
