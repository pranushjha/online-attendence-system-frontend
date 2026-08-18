import axios from "axios";


// ==========================================
// API BASE URL
// ==========================================

const configuredApiUrl =
    import.meta.env.VITE_API_URL;


const apiBaseUrl = configuredApiUrl
    ? configuredApiUrl
        .replace(/\/+$/, "")
        .endsWith("/api")
        ? configuredApiUrl.replace(
            /\/+$/,
            ""
        )
        : `${configuredApiUrl.replace(
            /\/+$/,
            ""
        )}/api`
    : "http://localhost:5001/api";


// ==========================================
// AXIOS INSTANCE
// ==========================================

const api = axios.create({

    baseURL:
        apiBaseUrl,

    headers: {
        "Content-Type":
            "application/json",
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
            sessionStorage.getItem(
                "token"
            );


        if (token) {

            config.headers =
                config.headers || {};


            config.headers.Authorization =
                `Bearer ${token}`;

        }


        return config;

    },

    (error) => {

        return Promise.reject(
            error
        );

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

        // ==========================================
        // AUTHENTICATION EXPIRED / INVALID
        // ==========================================

        if (
            error.response?.status === 401
        ) {

            // ==========================================
            // CLEAR ONLY CURRENT TAB'S LOGIN
            // ==========================================

            sessionStorage.removeItem(
                "token"
            );

            sessionStorage.removeItem(
                "user"
            );


            // ==========================================
            // REDIRECT TO LOGIN
            // ==========================================

            window.location.href =
                "/login";

        }


        return Promise.reject(
            error
        );

    }

);


export default api;
