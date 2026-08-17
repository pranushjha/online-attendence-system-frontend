import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./Dashboard.css";

const Dashboard = () => {
    const { user, logout } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/dashboard");

                setDashboard(response.data);
            } catch (err) {
                console.error("Dashboard Error:", err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading">
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error-page">
                <h2>Dashboard Error</h2>
                <p>{error}</p>

                <button
                    className="dashboard-logout"
                    onClick={logout}
                >
                    Logout
                </button>
            </div>
        );
    }

    const statistics = dashboard?.statistics || {};
    const recentAttendance =
        dashboard?.recentAttendance || [];

    return (
        <div className="dashboard-page">

            {/* ==========================================
                HEADER
            ========================================== */}

            <header className="dashboard-header">

                <div>
                    <p className="dashboard-label">
                        ADMIN PANEL
                    </p>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p className="dashboard-welcome">
                        Welcome back, {user?.name}
                    </p>
                </div>

                <button
                    className="dashboard-logout"
                    onClick={logout}
                >
                    Logout
                </button>

            </header>


            {/* ==========================================
                STATISTICS
            ========================================== */}

            <section className="statistics-grid">

                <div className="stat-card">
                    <p>Total Teachers</p>
                    <h2>
                        {statistics.totalTeachers ?? 0}
                    </h2>
                </div>

                <div className="stat-card">
                    <p>Total Classes</p>
                    <h2>
                        {statistics.totalClasses ?? 0}
                    </h2>
                </div>

                <div className="stat-card">
                    <p>Total Students</p>
                    <h2>
                        {statistics.totalStudents ?? 0}
                    </h2>
                </div>

                <div className="stat-card">
                    <p>Attendance Records</p>
                    <h2>
                        {statistics.totalAttendanceRecords ?? 0}
                    </h2>
                </div>

                <div className="stat-card attendance-stat">
                    <p>Overall Attendance</p>
                    <h2>
                        {statistics.overallAttendance ?? 0}%
                    </h2>
                </div>

            </section>


            {/* ==========================================
                RECENT ATTENDANCE
            ========================================== */}

            <section className="recent-section">

                <div className="section-header">
                    <div>
                        <p className="dashboard-label">
                            ACTIVITY
                        </p>

                        <h2>
                            Recent Attendance
                        </h2>
                    </div>
                </div>


                {recentAttendance.length === 0 ? (
                    <div className="empty-state">
                        No attendance records found.
                    </div>
                ) : (

                    <div className="attendance-list">

                        {recentAttendance.map((record) => (

                            <div
                                className="attendance-card"
                                key={record.attendanceId}
                            >

                                <div>
                                    <h3>
                                        {record.className}
                                    </h3>

                                    <p>
                                        {new Date(
                                            record.date
                                        ).toLocaleDateString()}
                                    </p>
                                </div>


                                <div className="attendance-summary">

                                    <div>
                                        <span>
                                            Present
                                        </span>

                                        <strong>
                                            {record.present}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Absent
                                        </span>

                                        <strong>
                                            {record.absent}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Percentage
                                        </span>

                                        <strong>
                                            {record.percentage}%
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </div>
    );
};

export default Dashboard;