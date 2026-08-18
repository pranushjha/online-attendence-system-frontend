import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./Dashboard.css";

const Dashboard = () => {
    const { user, logout } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("all");

    // ==========================================
    // LOAD DASHBOARD
    // ==========================================

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await api.get("/dashboard");

                setDashboard(response.data);
            } catch (err) {
                console.error(
                    "Dashboard Error:",
                    err
                );

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

    // ==========================================
    // DATA
    // ==========================================

    const statistics =
        dashboard?.statistics || {};

    const recentAttendance =
        dashboard?.recentAttendance || [];

    const classPerformance =
        dashboard?.classPerformance || [];

    // ==========================================
    // FILTER RECENT ATTENDANCE
    // ==========================================

    const filteredAttendance = useMemo(() => {
        let records = [
            ...recentAttendance,
        ];

        // Search class
        if (searchTerm.trim()) {
            const search =
                searchTerm
                    .trim()
                    .toLowerCase();

            records = records.filter(
                (record) =>
                    record.className
                        ?.toLowerCase()
                        .includes(search)
            );
        }

        // Date filter
        if (dateFilter !== "all") {
            const now = new Date();

            const days =
                dateFilter === "7"
                    ? 7
                    : 30;

            const cutoff =
                new Date(now);

            cutoff.setDate(
                now.getDate() - days
            );

            records =
                records.filter(
                    (record) => {
                        const recordDate =
                            new Date(
                                record.date
                            );

                        return (
                            recordDate >=
                            cutoff
                        );
                    }
                );
        }

        return records;
    }, [
        recentAttendance,
        searchTerm,
        dateFilter,
    ]);

    // ==========================================
    // BEST CLASS
    //
    // IMPORTANT:
    // This comes from classPerformance,
    // NOT recentAttendance.
    // ==========================================

    const bestClass =
        classPerformance.length > 0
            ? classPerformance.reduce(
                (best, current) =>
                    Number(
                        current.percentage
                    ) >
                    Number(
                        best.percentage
                    )
                        ? current
                        : best
            )
            : null;

    // ==========================================
    // CLASS NEEDING ATTENTION
    // ==========================================

    const lowestClass =
        classPerformance.length > 0
            ? classPerformance.reduce(
                (lowest, current) =>
                    Number(
                        current.percentage
                    ) <
                    Number(
                        lowest.percentage
                    )
                        ? current
                        : lowest
            )
            : null;

    // ==========================================
    // STATUS
    // ==========================================

    const getStatus = (percentage) => {
        const value =
            Number(percentage) || 0;

        if (value >= 75) {
            return {
                label: "Excellent",
                className: "excellent",
                icon: "★",
            };
        }

        if (value >= 60) {
            return {
                label: "Good",
                className: "good",
                icon: "✓",
            };
        }

        if (value >= 40) {
            return {
                label: "Average",
                className: "average",
                icon: "◷",
            };
        }

        return {
            label: "Low",
            className: "low",
            icon: "⚠",
        };
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>

                <p>
                    Loading dashboard...
                </p>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div className="dashboard-error-page">
                <div className="error-icon">
                    !
                </div>

                <h2>
                    Dashboard Error
                </h2>

                <p>
                    {error}
                </p>

                <button
                    className="dashboard-logout"
                    onClick={logout}
                >
                    <span className="logout-icon">
                        ⇥
                    </span>

                    Logout
                </button>
            </div>
        );
    }

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="dashboard-page">

            {/* ======================================
                HEADER
            ====================================== */}

            <header className="dashboard-header">

                <div className="dashboard-heading">

                    <p className="dashboard-label">
                        ADMIN PANEL
                    </p>

                    <h1>
                        Admin Dashboard{" "}
                        <span>👋</span>
                    </h1>

                    <p className="dashboard-welcome">
                        Welcome back,{" "}
                        {user?.name ||
                            "College Admin"}
                    </p>

                </div>

                <button
                    className="dashboard-logout"
                    onClick={logout}
                >
                    <span className="logout-icon">
                        ⇥
                    </span>

                    Logout
                </button>

            </header>


            {/* ======================================
                STATISTICS
            ====================================== */}

            <section className="statistics-grid">

                <div className="stat-card teachers-stat">

                    <div className="stat-icon purple">
                        👥
                    </div>

                    <div className="stat-content">

                        <p>
                            Total Teachers
                        </p>

                        <h2>
                            {statistics.totalTeachers ??
                                0}
                        </h2>

                    </div>

                </div>


                <div className="stat-card classes-stat">

                    <div className="stat-icon green">
                        🏫
                    </div>

                    <div className="stat-content">

                        <p>
                            Total Classes
                        </p>

                        <h2>
                            {statistics.totalClasses ??
                                0}
                        </h2>

                    </div>

                </div>


                <div className="stat-card students-stat">

                    <div className="stat-icon orange">
                        🎓
                    </div>

                    <div className="stat-content">

                        <p>
                            Total Students
                        </p>

                        <h2>
                            {statistics.totalStudents ??
                                0}
                        </h2>

                    </div>

                </div>


                <div className="stat-card records-stat">

                    <div className="stat-icon red">
                        📋
                    </div>

                    <div className="stat-content">

                        <p>
                            Attendance Records
                        </p>

                        <h2>
                            {statistics.totalAttendanceRecords ??
                                0}
                        </h2>

                    </div>

                </div>


                <div className="stat-card overall-stat">

                    <div className="stat-icon blue">
                        📈
                    </div>

                    <div className="stat-content">

                        <p>
                            Overall Attendance
                        </p>

                        <h2>
                            {statistics.overallAttendance ??
                                0}
                            %
                        </h2>

                        <small>
                            Overall average
                        </small>

                    </div>

                </div>

            </section>


            {/* ======================================
                RECENT ATTENDANCE
            ====================================== */}

            <section className="recent-section">

                {/* HEADER */}

                <div className="recent-header">

                    <div className="recent-title">

                        <div className="recent-icon">
                            📅
                        </div>

                        <div>

                            <h2>
                                Recent Attendance
                            </h2>

                            <p>
                                Latest attendance
                                records across all
                                classes
                            </p>

                        </div>

                    </div>


                    {/* FILTERS */}

                    <div className="recent-actions">

                        <button
                            className={`filter-button ${
                                dateFilter ===
                                "all"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setDateFilter(
                                    "all"
                                )
                            }
                        >
                            📅 All Time
                        </button>


                        <button
                            className={`filter-button ${
                                dateFilter ===
                                "7"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setDateFilter(
                                    "7"
                                )
                            }
                        >
                            📅 Last 7 Days
                        </button>


                        <button
                            className={`filter-button ${
                                dateFilter ===
                                "30"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setDateFilter(
                                    "30"
                                )
                            }
                        >
                            📅 Last 30 Days
                        </button>


                        <div className="dashboard-search">

                            <span>
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search class..."
                                value={
                                    searchTerm
                                }
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target
                                            .value
                                    )
                                }
                            />

                        </div>

                    </div>

                </div>


                {/* ==================================
                    SUMMARY CARDS
                ================================== */}

                <div className="attendance-summary-cards">

                    {/* TOTAL RECORDS */}

                    <div className="summary-card total-summary">

                        <div className="summary-icon">
                            📋
                        </div>

                        <div>

                            <span>
                                Total Records
                            </span>

                            <strong>
                                {statistics.totalAttendanceRecords ??
                                    0}
                            </strong>

                        </div>

                    </div>


                    {/* AVERAGE */}

                    <div className="summary-card average-summary">

                        <div className="summary-icon">
                            📊
                        </div>

                        <div>

                            <span>
                                Avg. Attendance
                            </span>

                            <strong>
                                {statistics.overallAttendance ??
                                    0}
                                %
                            </strong>

                        </div>

                    </div>


                    {/* BEST CLASS */}

                    <div className="summary-card best-summary">

                        <div className="summary-icon">
                            ↗
                        </div>

                        <div className="summary-text">

                            <span>
                                Best Class
                            </span>

                            <strong>
                                {bestClass?.className ||
                                    "—"}
                            </strong>

                        </div>

                        <b>
                            {bestClass
                                ? `${bestClass.percentage}%`
                                : "—"}
                        </b>

                    </div>


                    {/* NEEDS ATTENTION */}

                    <div className="summary-card attention-summary">

                        <div className="summary-icon">
                            ↓
                        </div>

                        <div className="summary-text">

                            <span>
                                Needs Attention
                            </span>

                            <strong>
                                {lowestClass?.className ||
                                    "—"}
                            </strong>

                        </div>

                        <b>
                            {lowestClass
                                ? `${lowestClass.percentage}%`
                                : "—"}
                        </b>

                    </div>

                </div>


                {/* ==================================
                    ATTENDANCE TABLE
                ================================== */}

                {filteredAttendance.length ===
                0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            📋
                        </div>

                        <h3>
                            No attendance
                            records found
                        </h3>

                        <p>
                            Try changing your
                            filters or search
                            term.
                        </p>

                    </div>

                ) : (

                    <div className="attendance-table-wrapper">

                        <table className="attendance-table">

                            <thead>

                                <tr>

                                    <th>
                                        📖 Class
                                    </th>

                                    <th>
                                        📅 Date
                                    </th>

                                    <th>
                                        👥 Present
                                    </th>

                                    <th>
                                        👤 Absent
                                    </th>

                                    <th>
                                        📊 Attendance %
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredAttendance.map(
                                    (record) => {

                                        const status =
                                            getStatus(
                                                record.percentage
                                            );

                                        return (
                                            <tr
                                                key={
                                                    record.attendanceId
                                                }
                                            >

                                                {/* CLASS */}

                                                <td>

                                                    <div className="class-cell">

                                                        <div className="class-icon">
                                                            📖
                                                        </div>

                                                        <strong>
                                                            {
                                                                record.className
                                                            }
                                                        </strong>

                                                    </div>

                                                </td>


                                                {/* DATE */}

                                                <td>

                                                    <span className="date-badge">

                                                        {new Date(
                                                            record.date
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            }
                                                        )}

                                                    </span>

                                                </td>


                                                {/* PRESENT */}

                                                <td>

                                                    <span className="count-badge present">
                                                        {
                                                            record.present
                                                        }
                                                    </span>

                                                </td>


                                                {/* ABSENT */}

                                                <td>

                                                    <span className="count-badge absent">
                                                        {
                                                            record.absent
                                                        }
                                                    </span>

                                                </td>


                                                {/* PERCENTAGE */}

                                                <td>

                                                    <div className="percentage-cell">

                                                        <div className="progress-bar">

                                                            <div
                                                                className={`progress-fill ${status.className}`}
                                                                style={{
                                                                    width: `${Math.min(
                                                                        Math.max(
                                                                            Number(
                                                                                record.percentage
                                                                            ) ||
                                                                            0,
                                                                            0
                                                                        ),
                                                                        100
                                                                    )}%`,
                                                                }}
                                                            />

                                                        </div>

                                                        <strong>
                                                            {
                                                                record.percentage
                                                            }
                                                            %
                                                        </strong>

                                                    </div>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`status-badge ${status.className}`}
                                                    >
                                                        {
                                                            status.icon
                                                        }

                                                        {" "}

                                                        {
                                                            status.label
                                                        }
                                                    </span>

                                                </td>


                                                {/* VIEW */}

                                                <td>

                                                    <button
                                                        className="view-button"
                                                        type="button"
                                                        title="View attendance"
                                                    >
                                                        👁
                                                    </button>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>


                        {/* FOOTER */}

                        <div className="attendance-footer">

                            <span>

                                Showing{" "}

                                <strong>
                                    {
                                        filteredAttendance.length
                                    }
                                </strong>{" "}

                                of{" "}

                                <strong>
                                    {
                                        recentAttendance.length
                                    }
                                </strong>{" "}

                                recent records

                            </span>

                        </div>

                    </div>

                )}

            </section>

        </div>
    );
};

export default Dashboard;