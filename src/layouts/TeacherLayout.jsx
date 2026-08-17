import { NavLink, Outlet } from "react-router-dom";

import {
    FaChartPie,
    FaClipboardCheck,
    FaFileAlt,
    FaSchool,
    FaSignOutAlt,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

import "./AdminLayout.css";


const TeacherLayout = () => {

    const { user, logout } = useAuth();


    // ==========================================
    // TEACHER NAVIGATION
    // ==========================================

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


    return (
        <div className="admin-layout">


            {/* ==========================================
                SIDEBAR
            ========================================== */}

            <aside className="sidebar">


                {/* ======================================
                    BRAND
                ====================================== */}

                <div className="sidebar-brand">

                    <h2>
                        Attendance
                    </h2>

                    <span>
                        Teacher Panel
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
                            Class Teacher
                        </span>

                    </div>


                    <button
                        className="logout-button"
                        onClick={logout}
                    >

                        <FaSignOutAlt />

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


export default TeacherLayout;