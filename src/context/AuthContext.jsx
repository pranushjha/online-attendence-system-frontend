import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);


// ==========================================
// AUTH PROVIDER
// ==========================================

export const AuthProvider = ({ children }) => {

    // ==========================================
    // INITIAL TOKEN
    // ==========================================

    const [token, setToken] = useState(() =>
        sessionStorage.getItem("token")
    );


    // ==========================================
    // INITIAL USER
    // ==========================================

    const [user, setUser] = useState(() => {

        const savedUser =
            sessionStorage.getItem("user");

        try {
            return savedUser
                ? JSON.parse(savedUser)
                : null;
        } catch {
            return null;
        }
    });


    const [loading, setLoading] = useState(true);


    // ==========================================
    // RESTORE LOGIN STATE
    // ==========================================

    useEffect(() => {

        const savedToken =
            sessionStorage.getItem("token");

        const savedUser =
            sessionStorage.getItem("user");


        if (savedToken && savedUser) {

            try {

                const parsedUser =
                    JSON.parse(savedUser);

                setToken(savedToken);
                setUser(parsedUser);

            } catch (error) {

                console.error(
                    "Failed to restore authentication:",
                    error
                );

                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");

                setToken(null);
                setUser(null);
            }

        } else {

            // ==================================
            // REMOVE INCOMPLETE AUTH STATE
            // ==================================

            if (!savedToken) {
                sessionStorage.removeItem("user");
            }

            if (!savedUser) {
                sessionStorage.removeItem("token");
            }

            setToken(null);
            setUser(null);
        }


        setLoading(false);

    }, []);


    // ==========================================
    // ADMIN LOGIN
    // ==========================================

    const adminLogin = async (email, password) => {

        const response = await api.post(
            "/auth/admin/login",
            {
                email,
                password,
            }
        );


        const {
            token: receivedToken,
            user: receivedUser,
        } = response.data;


        if (!receivedToken || !receivedUser) {

            throw new Error(
                "Invalid login response from server"
            );
        }


        // ==========================================
        // SAVE ONLY IN CURRENT TAB
        // ==========================================

        sessionStorage.setItem(
            "token",
            receivedToken
        );

        sessionStorage.setItem(
            "user",
            JSON.stringify(receivedUser)
        );


        // ==========================================
        // UPDATE REACT STATE
        // ==========================================

        setToken(receivedToken);
        setUser(receivedUser);


        return response.data;
    };


    // ==========================================
    // TEACHER LOGIN
    // ==========================================

    const teacherLogin = async (email, password) => {

        const response = await api.post(
            "/auth/teacher/login",
            {
                email,
                password,
            }
        );


        const {
            token: receivedToken,
            user: receivedUser,
        } = response.data;


        if (!receivedToken || !receivedUser) {

            throw new Error(
                "Invalid login response from server"
            );
        }


        // ==========================================
        // SAVE ONLY IN CURRENT TAB
        // ==========================================

        sessionStorage.setItem(
            "token",
            receivedToken
        );

        sessionStorage.setItem(
            "user",
            JSON.stringify(receivedUser)
        );


        // ==========================================
        // UPDATE REACT STATE
        // ==========================================

        setToken(receivedToken);
        setUser(receivedUser);


        return response.data;
    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {

        // ==========================================
        // CLEAR CURRENT TAB ONLY
        // ==========================================

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");


        setToken(null);
        setUser(null);
    };


    // ==========================================
    // AUTH STATE
    // ==========================================

    const isAuthenticated =
        Boolean(token && user);


    // ==========================================
    // PROVIDER
    // ==========================================

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                loading,
                isAuthenticated,
                adminLogin,
                teacherLogin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


// ==========================================
// USE AUTH HOOK
// ==========================================

export const useAuth = () => {

    const context = useContext(AuthContext);


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }


    return context;
};