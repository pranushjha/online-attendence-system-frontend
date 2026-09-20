import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
    children,
    allowedRoles,
}) => {
    const {
        isAuthenticated,
        user,
        loading,
    } = useAuth();

    // ==========================================
    // RECOVER AUTH FROM SESSION STORAGE
    // ==========================================

    let storedUser = null;
    let storedToken = null;

    try {
        storedToken =
            sessionStorage.getItem("token");

        const savedUser =
            sessionStorage.getItem("user");

        if (savedUser) {
            storedUser = JSON.parse(savedUser);
        }
    } catch (error) {
        console.error(
            "Unable to restore session:",
            error
        );
    }

    // Use React auth state when available,
    // otherwise fall back to the saved session.
    const effectiveUser =
        user || storedUser;

    const effectiveAuthenticated =
        isAuthenticated ||
        Boolean(storedToken && storedUser);

    // ==========================================
    // WAIT FOR AUTH STATE
    // ==========================================

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                Loading...
            </div>
        );
    }

    // ==========================================
    // NOT AUTHENTICATED
    // ==========================================

    if (!effectiveAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // ==========================================
    // ROLE CHECK
    // ==========================================

    if (
        allowedRoles &&
        !allowedRoles.includes(
            effectiveUser?.role
        )
    ) {
        // Send teacher to attendance
        if (
            effectiveUser?.role === "teacher"
        ) {
            return (
                <Navigate
                    to="/attendance"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    // ==========================================
    // AUTHORIZED
    // ==========================================

    return children;
};

export default ProtectedRoute;


