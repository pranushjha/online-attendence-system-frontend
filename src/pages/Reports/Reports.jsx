import {
    useEffect,
    useState,
} from "react";

import {
    FaCalendarAlt,
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

    const { user } =
        useAuth();


    const [classData, setClassData] =
        useState(null);

    const [reportData, setReportData] =
        useState(null);


    const [selectedDate, setSelectedDate] =
        useState("");


    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");


    // ==========================================
    // GET TODAY
    // ==========================================

    const getToday = () => {

        const today =
            new Date();


        const year =
            today.getFullYear();


        const month =
            String(
                today.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                today.getDate()
            ).padStart(
                2,
                "0"
            );


        return `${year}-${month}-${day}`;
    };


    // ==========================================
    // LOAD ASSIGNED CLASS
    // ==========================================

    const loadClass = async () => {

        const response =
            await api.get(
                "/classes/my-class"
            );


        const responseData =
            response.data;


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

            throw new Error(
                "No class is assigned to you."
            );
        }


        setClassData(
            assignedClass
        );


        return assignedClass;
    };


    // ==========================================
    // LOAD DATE REPORT
    // ==========================================

    const loadDateReport = async (
        date,
        classId
    ) => {

        if (
            !date ||
            !classId
        ) {

            setReportData(
                null
            );

            return;
        }


        const response =
            await api.get(
                `/attendance/report/date/${date}?classId=${classId}`
            );


        setReportData(
            response.data
        );
    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        const initialize =
            async () => {

                try {

                    setLoading(
                        true
                    );

                    setError("");


                    const today =
                        getToday();


                    setSelectedDate(
                        today
                    );


                    const assignedClass =
                        await loadClass();


                    await loadDateReport(
                        today,
                        assignedClass._id
                    );

                } catch (err) {

                    console.error(
                        "Teacher Report Error:",
                        err
                    );


                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Unable to load attendance report."
                    );

                } finally {

                    setLoading(
                        false
                    );
                }
            };


        initialize();

    }, []);


    // ==========================================
    // DATE CHANGE
    // ==========================================

    const handleDateChange = async (
        event
    ) => {

        const date =
            event.target.value;


        setSelectedDate(
            date
        );


        if (
            !date ||
            !classData?._id
        ) {

            setReportData(
                null
            );

            return;
        }


        try {

            setError("");

            setLoading(
                true
            );


            await loadDateReport(
                date,
                classData._id
            );

        } catch (err) {

            console.error(
                "Date Report Error:",
                err
            );


            setReportData(
                null
            );


            setError(
                err.response?.data?.message ||
                "Unable to load attendance for selected date."
            );

        } finally {

            setLoading(
                false
            );
        }
    };


    // ==========================================
    // REFRESH
    // ==========================================

    const handleRefresh = async () => {

        try {

            setRefreshing(
                true
            );

            setError("");


            const assignedClass =
                await loadClass();


            await loadDateReport(
                selectedDate,
                assignedClass._id
            );

        } catch (err) {

            console.error(
                "Refresh Report Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to refresh report."
            );

        } finally {

            setRefreshing(
                false
            );
        }
    };


    // ==========================================
    // SELECTED CLASS REPORT
    // ==========================================

    const classReport =
        reportData?.classes?.find(
            (item) =>
                String(
                    item.classId
                ) ===
                String(
                    classData?._id
                )
        ) ||
        reportData?.classes?.[0] ||
        null;


    // ==========================================
    // DISPLAY DATE
    // ==========================================

    const displayDate =
        selectedDate
            ? new Date(
                  `${selectedDate}T00:00:00`
              ).toLocaleDateString(
                  "en-IN",
                  {
                      day:
                          "2-digit",

                      month:
                          "long",

                      year:
                          "numeric",
                  }
              )
            : "-";


    // ==========================================
    // SUMMARY
    // ==========================================

    const totalStudents =
        classReport?.totalStudents ||
        0;


    const present =
        classReport?.present ||
        0;


    const absent =
        classReport?.absent ||
        0;


    const percentage =
        classReport?.percentage ||
        0;


    // ==========================================
    // STATUS CLASS
    // ==========================================

    const getStatusClass = (
        status
    ) => {

        if (
            status ===
            "Present"
        ) {

            return "status-present";
        }


        return "status-absent";
    };


    // ==========================================
    // PERCENTAGE CLASS
    // ==========================================

    const getPercentageClass = (
        value
    ) => {

        if (
            value >= 75
        ) {

            return "percentage-good";
        }


        if (
            value >= 50
        ) {

            return "percentage-warning";
        }


        return "percentage-danger";
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading && !classData) {

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

                        View attendance for your
                        assigned class by date.

                    </p>

                </div>


                <button
                    className="refresh-button"
                    onClick={
                        handleRefresh
                    }
                    disabled={
                        refreshing
                    }
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
                CLASS INFORMATION
            ====================================== */}

            {classData && (

                <div className="class-report-card">

                    <div>

                        <p className="card-label">
                            MY CLASS
                        </p>


                        <h2>
                            {
                                classData.className
                            }
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
                                Report Date
                            </span>


                            <strong>
                                {
                                    displayDate
                                }
                            </strong>

                        </div>

                    </div>

                </div>
            )}


            {/* ======================================
                DATE FILTER
            ====================================== */}

            {classData && (

                <div className="student-report-card">

                    <div className="section-heading">

                        <div>

                            <p className="card-label">
                                REPORT FILTER
                            </p>


                            <h2>
                                Select Date
                            </h2>

                        </div>

                    </div>


                    <div
                        style={{
                            display:
                                "flex",

                            alignItems:
                                "flex-end",

                            gap:
                                "20px",

                            flexWrap:
                                "wrap",
                        }}
                    >

                        <div
                            style={{
                                minWidth:
                                    "250px",
                            }}
                        >

                            <label
                                style={{
                                    display:
                                        "block",

                                    marginBottom:
                                        "8px",

                                    fontWeight:
                                        "600",
                                }}
                            >

                                <FaCalendarAlt
                                    style={{
                                        marginRight:
                                            "7px",
                                    }}
                                />

                                Date

                            </label>


                            <input
                                type="date"
                                value={
                                    selectedDate
                                }
                                onChange={
                                    handleDateChange
                                }
                                style={{
                                    width:
                                        "100%",

                                    padding:
                                        "12px",

                                    border:
                                        "1px solid #dbe3ef",

                                    borderRadius:
                                        "8px",

                                    fontSize:
                                        "15px",

                                    background:
                                        "white",

                                    boxSizing:
                                        "border-box",
                                }}
                            />

                        </div>

                    </div>

                </div>
            )}


            {/* ======================================
                NO RECORD
            ====================================== */}

            {classData &&
                !classReport && (

                    <div className="report-empty">

                        <FaCalendarAlt />


                        <h3>
                            No attendance record
                        </h3>


                        <p>

                            Attendance has not been
                            marked for{" "}

                            <strong>
                                {
                                    displayDate
                                }
                            </strong>

                            .

                        </p>

                    </div>
                )}


            {/* ======================================
                REPORT
            ====================================== */}

            {classReport && (

                <>

                    {/* ==================================
                        SUMMARY
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
                                        totalStudents
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
                                        present
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
                                        absent
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* ATTENDANCE */}

                        <div className="summary-card">

                            <div className="summary-icon">

                                <FaPercentage />

                            </div>


                            <div>

                                <span>
                                    Attendance
                                </span>


                                <strong
                                    className={
                                        getPercentageClass(
                                            percentage
                                        )
                                    }
                                >

                                    {
                                        Number(
                                            percentage
                                        ).toFixed(
                                            1
                                        )
                                    }%

                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        STUDENT ATTENDANCE
                    ================================== */}

                    <div className="student-report-card">

                        <div className="section-heading">

                            <div>

                                <p className="card-label">
                                    DAILY ATTENDANCE
                                </p>


                                <h2>
                                    Student Attendance
                                </h2>

                            </div>


                            <div>

                                <strong>
                                    {
                                        displayDate
                                    }
                                </strong>

                            </div>

                        </div>


                        {
                            classReport.students
                                ?.length === 0

                                ? (

                                    <div className="report-empty">

                                        <FaChartBar />


                                        <h3>
                                            No student records
                                        </h3>

                                    </div>

                                )

                                : (

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
                                                        Status
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {
                                                    classReport
                                                        .students
                                                        ?.map(
                                                            (
                                                                student,
                                                                index
                                                            ) => (

                                                                <tr
                                                                    key={
                                                                        student
                                                                            .studentId ||
                                                                        index
                                                                    }
                                                                >

                                                                    <td>

                                                                        <strong>
                                                                            {
                                                                                student.rollNo
                                                                            }
                                                                        </strong>

                                                                    </td>


                                                                    <td>

                                                                        <strong>
                                                                            {
                                                                                student.name
                                                                            }
                                                                        </strong>

                                                                    </td>


                                                                    <td>

                                                                        <span
                                                                            className={
                                                                                getStatusClass(
                                                                                    student.status
                                                                                )
                                                                            }
                                                                        >

                                                                            {
                                                                                student.status
                                                                            }

                                                                        </span>

                                                                    </td>

                                                                </tr>

                                                            )
                                                        )
                                                }

                                            </tbody>

                                        </table>

                                    </div>

                                )
                        }

                    </div>

                </>
            )}

        </div>
    );
};


export default Reports;