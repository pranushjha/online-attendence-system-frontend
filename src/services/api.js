import axios from "axios";


// ==========================================
// API BASE URL
// ==========================================

const configuredApiUrl =
    import.meta.env.VITE_API_URL;


// ==========================================
// NORMALIZE API URL
// ==========================================

const normalizeApiUrl = (url) => {

    if (!url) {
        return "http://localhost:5001/api";
    }


    const cleanedUrl =
        url.replace(/\/+$/, "");


    // Already contains /api
    if (cleanedUrl.endsWith("/api")) {
        return cleanedUrl;
    }


    // Add /api
    return `${cleanedUrl}/api`;
};


const apiBaseUrl =
    normalizeApiUrl(configuredApiUrl);


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

        // ==========================================
        // GET TOKEN FROM CURRENT TAB ONLY
        // ==========================================

        const token =
            sessionStorage.getItem("token");


        if (token) {

            config.headers =
                config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;
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

    // ==========================================
    // SUCCESS
    // ==========================================

    (response) => {

        return response;
    },


    // ==========================================
    // ERROR
    // ==========================================

    (error) => {

        const status =
            error.response?.status;


        // ==========================================
        // 401 = AUTHENTICATION INVALID/EXPIRED
        // ==========================================

        if (status === 401) {

            console.warn(
                "Authentication expired or invalid."
            );


            // Clear CURRENT TAB only
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");


            // Redirect CURRENT TAB only
            window.location.href = "/login";
        }


        // ==========================================
        // 403 = AUTHENTICATED BUT NOT AUTHORIZED
        // ==========================================

        if (status === 403) {

            console.warn(
                "Access denied: insufficient permissions."
            );

            // IMPORTANT:
            // Do NOT logout here.
            //
            // A 403 means the user is authenticated,
            // but their role does not have permission
            // for that endpoint.
        }


        return Promise.reject(error);
    }

);


export default api;