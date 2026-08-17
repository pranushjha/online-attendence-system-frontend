import { NavLink, Outlet } from "react-router-dom";

import {
    FaChartPie,
    FaChalkboardTeacher,
    FaSchool,
    FaUsers,
    FaClipboardCheck,
    FaFileAlt,
    FaSignOutAlt,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

import "./AdminLayout.css";


const AdminLayout = () => {

    const { user, logout } = useAuth();


    // ==========================================
    // ADMIN NAVIGATION
    // ==========================================

    const navigation = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: <FaChartPie />,
        },

        {
            name: "Teachers",
            path: "/teachers",
            icon: <FaChalkboardTeacher />,
        },

        {
            name: "Classes",
            path: "/classes",
            icon: <FaSchool />,
        },

        {
            name: "Students",
            path: "/students",
            icon: <FaUsers />,
        },

        {
            name: "Attendance",
            path: "/admin/attendance",
            icon: <FaClipboardCheck />,
        },

        {
            name: "Reports",
            path: "/admin/reports",
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


export default AdminLayout;