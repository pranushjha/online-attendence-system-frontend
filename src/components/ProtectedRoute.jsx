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

    if (!isAuthenticated) {
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
        !allowedRoles.includes(user?.role)
    ) {
        // Send user to their correct dashboard
        if (user?.role === "teacher") {
            return (
                <Navigate
                    to="/teacher-dashboard"
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