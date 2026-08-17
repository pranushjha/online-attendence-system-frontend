import { useEffect, useMemo, useState } from "react";

import {
    FaChartBar,
    FaCheckCircle,
    FaTimesCircle,
    FaUsers,
    FaPercentage,
    FaSyncAlt,
} from "react-icons/fa";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import "./Reports.css";

const Reports = () => {
    const { user } = useAuth();

    const [classData, setClassData] = useState(null);
    const [reportData, setReportData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");


    // ==========================================
    // LOAD REPORT
    // ==========================================

    useEffect(() => {
        loadReport();
    }, []);


    const loadReport = async () => {
        try {
            setLoading(true);
            setError("");

            // ======================================
            // GET ASSIGNED CLASS
            // ======================================

            const classResponse =
                await api.get("/classes/my-class");

            console.log(
                "My Class Report Response:",
                classResponse.data
            );

            const responseData =
                classResponse.data;

            const assignedClass =
                responseData.class ||
                responseData.myClass ||
                responseData.data?.class ||
                responseData.data ||
                responseData;

            if (
                !assignedClass ||
                !assignedClass._id
            ) {
                setError(
                    "No class is assigned to you."
                );

                setClassData(null);
                setReportData(null);

                return;
            }

            setClassData(assignedClass);


            // ======================================
            // GET CLASS ATTENDANCE REPORT
            // ======================================

            const reportResponse =
                await api.get(
                    `/attendance/report/class/${assignedClass._id}`
                );

            console.log(
                "Class Report Response:",
                reportResponse.data
            );

            setReportData(
                reportResponse.data
            );

        } catch (err) {
            console.error(
                "Teacher Report Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load attendance report."
            );

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    // ==========================================
    // REFRESH
    // ==========================================

    const handleRefresh = async () => {
        setRefreshing(true);

        await loadReport();
    };


    // ==========================================
    // EXTRACT STUDENT REPORTS
    // ==========================================

    const studentReports = useMemo(() => {

        if (!reportData) {
            return [];
        }

        const reports =
            reportData.students ||
            reportData.studentReports ||
            reportData.data?.students ||
            reportData.data?.studentReports ||
            reportData.report?.students ||
            reportData.report ||
            [];

        return Array.isArray(reports)
            ? reports
            : [];

    }, [reportData]);


    // ==========================================
    // GET STUDENT NAME
    // ==========================================

    const getStudentName = (student) => {

        return (
            student.studentName ||
            student.name ||
            student.studentId?.name ||
            "Unknown Student"
        );
    };


    // ==========================================
    // GET ROLL NUMBER
    // ==========================================

    const getRollNo = (student) => {

        return (
            student.rollNo ||
            student.studentId?.rollNo ||
            "-"
        );
    };


    // ==========================================
    // GET PRESENT COUNT
    // ==========================================

    const getPresent = (student) => {

        return Number(
            student.present ??
            student.presentCount ??
            student.totalPresent ??
            0
        );
    };


    // ==========================================
    // GET ABSENT COUNT
    // ==========================================

    const getAbsent = (student) => {

        return Number(
            student.absent ??
            student.absentCount ??
            student.totalAbsent ??
            0
        );
    };


    // ==========================================
    // GET TOTAL DAYS
    // ==========================================

    const getTotalDays = (student) => {

        const present =
            getPresent(student);

        const absent =
            getAbsent(student);

        return Number(
            student.totalDays ??
            student.attendanceDays ??
            student.totalAttendanceDays ??
            present + absent
        );
    };


    // ==========================================
    // GET PERCENTAGE
    // ==========================================

    const getPercentage = (student) => {

        const directPercentage =
            student.percentage ??
            student.attendancePercentage ??
            student.attendancePercent;

        if (
            directPercentage !== undefined &&
            directPercentage !== null
        ) {
            return Number(
                directPercentage
            );
        }

        const present =
            getPresent(student);

        const total =
            getTotalDays(student);

        if (total === 0) {
            return 0;
        }

        return (
            (present / total) *
            100
        );
    };


    // ==========================================
    // CALCULATE SUMMARY
    // ==========================================

    const totals = useMemo(() => {

        // ======================================
        // NO REPORT
        // ======================================

        if (
            !studentReports ||
            studentReports.length === 0
        ) {
            return {
                totalStudents:
                    classData?.students?.length || 0,

                totalDays: 0,

                present: 0,

                absent: 0,

                percentage: 0,
            };
        }


        // ======================================
        // TOTAL STUDENTS
        // ======================================

        const totalStudents =
            classData?.students?.length ||
            studentReports.length;


        // ======================================
        // TOTAL PRESENT
        // ======================================

        const present =
            studentReports.reduce(
                (total, student) => {
                    return (
                        total +
                        getPresent(student)
                    );
                },
                0
            );


        // ======================================
        // TOTAL ABSENT
        // ======================================

        const absent =
            studentReports.reduce(
                (total, student) => {
                    return (
                        total +
                        getAbsent(student)
                    );
                },
                0
            );


        // ======================================
        // ATTENDANCE DAYS
        //
        // Each student has:
        //
        // present + absent = total days
        //
        // Since every student belongs to
        // the same class, we use the maximum
        // total days found.
        // ======================================

        const totalDays =
            studentReports.reduce(
                (maximum, student) => {

                    const days =
                        getTotalDays(
                            student
                        );

                    return Math.max(
                        maximum,
                        days
                    );
                },
                0
            );


        // ======================================
        // OVERALL ATTENDANCE
        //
        // Total Present
        // ---------------- × 100
        // Present + Absent
        // ======================================

        const totalAttendance =
            present + absent;


        const percentage =
            totalAttendance > 0
                ? (
                    (present /
                        totalAttendance) *
                    100
                )
                : 0;


        return {
            totalStudents,
            totalDays,
            present,
            absent,
            percentage,
        };

    }, [
        studentReports,
        classData,
    ]);


    // ==========================================
    // PERCENTAGE CLASS
    // ==========================================

    const getPercentageClass = (
        percentage
    ) => {

        if (percentage >= 75) {
            return "percentage-good";
        }

        if (percentage >= 50) {
            return "percentage-warning";
        }

        return "percentage-danger";
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="reports-page">

                <div className="reports-loading">
                    Loading reports...
                </div>

            </div>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="reports-page">


            {/* ======================================
                HEADER
            ====================================== */}

            <div className="reports-header">

                <div>

                    <p className="reports-label">
                        ATTENDANCE REPORTS
                    </p>

                    <h1>
                        Reports
                    </h1>

                    <p className="reports-description">
                        View attendance performance
                        for your assigned class.
                    </p>

                </div>


                <button
                    className="refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >

                    <FaSyncAlt
                        className={
                            refreshing
                                ? "refresh-spinning"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"
                    }

                </button>

            </div>


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (
                <div className="reports-error">

                    <strong>
                        Unable to load report
                    </strong>

                    <span>
                        {error}
                    </span>

                </div>
            )}


            {/* ======================================
                NO CLASS
            ====================================== */}

            {!classData &&
                !error && (

                    <div className="reports-empty">

                        <FaUsers />

                        <h2>
                            No Assigned Class
                        </h2>

                        <p>
                            You do not currently
                            have a class assigned.
                        </p>

                    </div>
                )}


            {/* ======================================
                CLASS REPORT
            ====================================== */}

            {classData && (
                <>


                    {/* ==================================
                        CLASS INFORMATION
                    ================================== */}

                    <div className="class-report-card">

                        <div>

                            <p className="card-label">
                                MY CLASS
                            </p>

                            <h2>
                                {classData.className}
                            </h2>

                        </div>


                        <div className="class-details">

                            <div>

                                <span>
                                    Teacher
                                </span>

                                <strong>
                                    {
                                        classData
                                            .classTeacher
                                            ?.name ||
                                        user?.name ||
                                        "You"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Students
                                </span>

                                <strong>
                                    {
                                        totals
                                            .totalStudents
                                    }
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        SUMMARY CARDS
                    ================================== */}

                    <div className="summary-grid">


                        {/* TOTAL STUDENTS */}

                        <div className="summary-card">

                            <div className="summary-icon">
                                <FaUsers />
                            </div>

                            <div>

                                <span>
                                    Total Students
                                </span>

                                <strong>
                                    {
                                        totals
                                            .totalStudents
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* ATTENDANCE DAYS */}

                        <div className="summary-card">

                            <div className="summary-icon">
                                <FaChartBar />
                            </div>

                            <div>

                                <span>
                                    Attendance Days
                                </span>

                                <strong>
                                    {
                                        totals
                                            .totalDays
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* PRESENT */}

                        <div className="summary-card">

                            <div className="summary-icon">
                                <FaCheckCircle />
                            </div>

                            <div>

                                <span>
                                    Present
                                </span>

                                <strong>
                                    {
                                        totals.present
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* ABSENT */}

                        <div className="summary-card">

                            <div className="summary-icon">
                                <FaTimesCircle />
                            </div>

                            <div>

                                <span>
                                    Absent
                                </span>

                                <strong>
                                    {
                                        totals.absent
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* OVERALL ATTENDANCE */}

                        <div className="summary-card">

                            <div className="summary-icon">
                                <FaPercentage />
                            </div>

                            <div>

                                <span>
                                    Overall Attendance
                                </span>

                                <strong
                                    className={
                                        getPercentageClass(
                                            totals.percentage
                                        )
                                    }
                                >
                                    {
                                        totals
                                            .percentage
                                            .toFixed(1)
                                    }%
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        STUDENT REPORT
                    ================================== */}

                    <div className="student-report-card">

                        <div className="section-heading">

                            <div>

                                <p className="card-label">
                                    STUDENT PERFORMANCE
                                </p>

                                <h2>
                                    Student Attendance
                                </h2>

                            </div>

                        </div>


                        {studentReports.length === 0 ? (

                            <div className="report-empty">

                                <FaChartBar />

                                <h3>
                                    No attendance
                                    records yet
                                </h3>

                                <p>
                                    Attendance data will
                                    appear here after
                                    attendance is marked.
                                </p>

                            </div>

                        ) : (

                            <div className="table-wrapper">

                                <table>

                                    <thead>

                                        <tr>

                                            <th>
                                                Roll No.
                                            </th>

                                            <th>
                                                Student
                                            </th>

                                            <th>
                                                Present
                                            </th>

                                            <th>
                                                Absent
                                            </th>

                                            <th>
                                                Total Days
                                            </th>

                                            <th>
                                                Attendance
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {studentReports.map(
                                            (
                                                student,
                                                index
                                            ) => {

                                                const present =
                                                    getPresent(
                                                        student
                                                    );

                                                const absent =
                                                    getAbsent(
                                                        student
                                                    );

                                                const total =
                                                    getTotalDays(
                                                        student
                                                    );

                                                const percentage =
                                                    getPercentage(
                                                        student
                                                    );


                                                return (
                                                    <tr
                                                        key={
                                                            student
                                                                .studentId
                                                                ?._id ||
                                                            student
                                                                .studentId ||
                                                            index
                                                        }
                                                    >

                                                        <td>
                                                            {
                                                                getRollNo(
                                                                    student
                                                                )
                                                            }
                                                        </td>


                                                        <td>

                                                            <strong>
                                                                {
                                                                    getStudentName(
                                                                        student
                                                                    )
                                                                }
                                                            </strong>

                                                        </td>


                                                        <td className="present-cell">
                                                            {
                                                                present
                                                            }
                                                        </td>


                                                        <td className="absent-cell">
                                                            {
                                                                absent
                                                            }
                                                        </td>


                                                        <td>
                                                            {
                                                                total
                                                            }
                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    `percentage-badge ${
                                                                        getPercentageClass(
                                                                            percentage
                                                                        )
                                                                    }`
                                                                }
                                                            >

                                                                {
                                                                    percentage.toFixed(
                                                                        1
                                                                    )
                                                                }%

                                                            </span>

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </>
            )}

        </div>
    );
};

export default Reports;