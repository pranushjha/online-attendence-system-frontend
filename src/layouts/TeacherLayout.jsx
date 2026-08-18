import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import {
    FaChartPie,
    FaClipboardCheck,
    FaFileAlt,
    FaSchool,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaGraduationCap,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

import "./AdminLayout.css";

const TeacherLayout = () => {
    const { user, logout } = useAuth();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        {
            name: "Dashboard",
            path: "/teacher-dashboard",
            icon: <FaChartPie />,
        },
        {
            name: "My Class",
            path: "/my-class",
            icon: <FaSchool />,
        },
        {
            name: "Attendance",
            path: "/attendance",
            icon: <FaClipboardCheck />,
        },
        {
            name: "Reports",
            path: "/teacher-reports",
            icon: <FaFileAlt />,
        },
    ];

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const handleLogout = () => {
        setSidebarOpen(false);
        logout();
    };

    return (
        <div className="admin-layout teacher-layout">

            {/* MOBILE HEADER */}
            <header className="mobile-header">

                <button
                    className="mobile-menu-button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open navigation menu"
                >
                    <FaBars />
                </button>

                <div className="mobile-header-title">
                    <strong>Attendance</strong>
                    <span>Teacher Panel</span>
                </div>

            </header>

            {/* OVERLAY */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`sidebar ${
                    sidebarOpen ? "sidebar-open" : ""
                }`}
            >

                <button
                    className="mobile-close-button"
                    onClick={closeSidebar}
                    aria-label="Close navigation menu"
                >
                    <FaTimes />
                </button>

                {/* BRAND */}
                <div className="sidebar-brand">

                    <div className="brand-icon">
                        <FaGraduationCap />
                    </div>

                    <div>
                        <h2>Attendance</h2>
                        <span>Teacher Panel</span>
                    </div>

                </div>

                {/* NAVIGATION */}
                <nav className="sidebar-nav">

                    <p className="sidebar-section-label">
                        TEACHER MENU
                    </p>

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

                            <span>{item.name}</span>
                        </NavLink>

                    ))}

                </nav>

                {/* USER AREA */}
                <div className="sidebar-bottom">

                    <div className="teacher-profile">

                        <div className="teacher-avatar">
                            {(user?.name || "T")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="sidebar-user">

                            <strong>
                                {user?.name || "Teacher"}
                            </strong>

                            <span>
                                Class Teacher
                            </span>

                        </div>

                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt />

                        <span>
                            Logout
                        </span>
                    </button>

                </div>

            </aside>

            {/* CONTENT */}
            <main className="layout-content">
                <Outlet />
            </main>

        </div>
    );
};

export default TeacherLayout;