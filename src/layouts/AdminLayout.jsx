import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import {
    PieChart,
    Presentation,
    School,
    Users,
    ClipboardCheck,
    FileText,
    LogOut,
    Menu,
    X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "./AdminLayout.css";

const AdminLayout = () => {
    const { user, logout } = useAuth();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ==========================================
    // ADMIN NAVIGATION
    // ==========================================

    const navigation = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: <PieChart />,
        },
        {
            name: "Teachers",
            path: "/teachers",
            icon: <Presentation />,
        },
        {
            name: "Classes",
            path: "/classes",
            icon: <School />,
        },
        {
            name: "Students",
            path: "/students",
            icon: <Users />,
        },
        {
            name: "Attendance",
            path: "/admin/attendance",
            icon: <ClipboardCheck />,
        },
        {
            name: "Reports",
            path: "/admin/reports",
            icon: <FileText />,
        },
    ];

    // ==========================================
    // CLOSE SIDEBAR
    // ==========================================

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {
        setSidebarOpen(false);
        logout();
    };

    return (
        <div className="admin-layout">

            {/* ==========================================
                MOBILE HEADER
            ========================================== */}

            <header className="mobile-header">

                <button
                    className="mobile-menu-button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open navigation menu"
                >
                    <Menu />
                </button>

                <div className="mobile-header-title">
                    <strong>Attendance</strong>
                    <span>Admin Panel</span>
                </div>

            </header>


            {/* ==========================================
                MOBILE OVERLAY
            ========================================== */}

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}


            {/* ==========================================
                SIDEBAR
            ========================================== */}

            <aside
                className={`sidebar ${
                    sidebarOpen ? "sidebar-open" : ""
                }`}
            >

                {/* ======================================
                    MOBILE CLOSE BUTTON
                ====================================== */}

                <button
                    className="mobile-close-button"
                    onClick={closeSidebar}
                    aria-label="Close navigation menu"
                >
                    <X />
                </button>


                {/* ======================================
                    BRAND
                ====================================== */}

                <div className="sidebar-brand">

                    <h2>
                        Attendance
                    </h2>

                    <span>
                        Admin Panel
                    </span>

                </div>


                {/* ======================================
                    NAVIGATION
                ====================================== */}

                <nav className="sidebar-nav">

                    {navigation.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                                isActive
                                    ? "nav-item active"
                                    : "nav-item"
                            }
                        >

                            <span className="nav-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.name}
                            </span>

                        </NavLink>

                    ))}

                </nav>


                {/* ======================================
                    USER / LOGOUT
                ====================================== */}

                <div className="sidebar-bottom">

                    <div className="sidebar-user">

                        <strong>
                            {user?.name}
                        </strong>

                        <span>
                            Administrator
                        </span>

                    </div>


                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >

                        <LogOut />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* ==========================================
                MAIN CONTENT
            ========================================== */}

            <main className="layout-content">

                <Outlet />

            </main>

        </div>
    );
};

export default AdminLayout;

