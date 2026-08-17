import axios from "axios";

// ==========================================
// API BASE URL
// ==========================================

const configuredApiUrl = import.meta.env.VITE_API_URL;

const apiBaseUrl = configuredApiUrl
    ? configuredApiUrl.replace(/\/+$/, "").endsWith("/api")
        ? configuredApiUrl.replace(/\/+$/, "")
        : `${configuredApiUrl.replace(/\/+$/, "")}/api`
    : "http://localhost:5001/api";


// ==========================================
// AXIOS INSTANCE
// ==========================================

const api = axios.create({
    baseURL: apiBaseUrl,

    headers: {
        "Content-Type": "application/json",
    },
});


// ==========================================
// REQUEST INTERCEPTOR
// ==========================================

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

api.interceptors.response.use(
    (response) => {
        return response;
    },

    (error) => {

        if (error.response?.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Redirect to login
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);


export default api;