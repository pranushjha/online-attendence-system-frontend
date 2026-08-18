import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FaChartBar,
    FaCheckCircle,
    FaTimesCircle,
    FaUsers,
    FaPercentage,
    FaSyncAlt,
    FaFilter,
    FaCalendarAlt,
    FaChalkboardTeacher,
    FaTimes,
} from "react-icons/fa";

import api from "../../services/api";

import "./Reports.css";


const AdminReports = () => {

    // ==========================================
    // STATE
    // ==========================================

    const [attendanceData, setAttendanceData] =
        useState([]);

    const [classes, setClasses] =
        useState([]);

    const [teachers, setTeachers] =
        useState([]);

    const [selectedClass, setSelectedClass] =
        useState("all");

    const [selectedTeacher, setSelectedTeacher] =
        useState("all");

    const [selectedDate, setSelectedDate] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");


    // ==========================================
    // GET ID
    // ==========================================

    const getId = (value) => {

        if (!value) {
            return "";
        }

        if (typeof value === "object") {

            return String(
                value._id ||
                value.id ||
                ""
            );
        }

        return String(value);
    };


    // ==========================================
    // GET CLASS ID
    // ==========================================

    const getClassId = (record) => {

        return getId(
            record?.classId
        );
    };


    // ==========================================
    // GET CLASS NAME
    // ==========================================

    const getClassName = (record) => {

        if (
            record?.classId &&
            typeof record.classId === "object"
        ) {

            return (
                record.classId.className ||
                record.classId.name ||
                "Unknown Class"
            );
        }

        return (
            record?.className ||
            record?.class?.className ||
            "Unknown Class"
        );
    };


    // ==========================================
    // GET TEACHER ID
    // ==========================================

    const getTeacherId = (record) => {

        return getId(
            record?.markedBy ||
            record?.teacher
        );
    };


    // ==========================================
    // GET TEACHER NAME
    // ==========================================

    const getTeacherName = (record) => {

        if (
            record?.markedBy &&
            typeof record.markedBy === "object"
        ) {

            return (
                record.markedBy.name ||
                record.markedBy.email ||
                "Unknown Teacher"
            );
        }

        if (
            record?.teacher &&
            typeof record.teacher === "object"
        ) {

            return (
                record.teacher.name ||
                record.teacher.email ||
                "Unknown Teacher"
            );
        }

        return (
            record?.teacherName ||
            "Unknown Teacher"
        );
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const getDate = (record) => {

        if (!record?.date) {
            return "";
        }

        const date =
            new Date(record.date);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );

        return `${year}-${month}-${day}`;
    };


    // ==========================================
    // GET STUDENT RECORDS
    // ==========================================

    const getStudentRecords = (record) => {

        if (
            Array.isArray(
                record?.students
            )
        ) {

            return record.students;
        }

        return [];
    };


    // ==========================================
    // GET STUDENT ID
    // ==========================================

    const getStudentId = (
        student,
        fallback
    ) => {

        if (!student) {
            return `unknown-${fallback}`;
        }

        if (
            student.studentId &&
            typeof student.studentId === "object"
        ) {

            return String(
                student.studentId._id ||
                student.studentId.id ||
                `unknown-${fallback}`
            );
        }

        if (student.studentId) {
            return String(
                student.studentId
            );
        }

        if (student._id) {
            return String(
                student._id
            );
        }

        if (student.id) {
            return String(
                student.id
            );
        }

        return `unknown-${fallback}`;
    };


    // ==========================================
    // GET STUDENT NAME
    // ==========================================

    const getStudentName = (student) => {

        if (
            student?.studentId &&
            typeof student.studentId === "object"
        ) {

            return (
                student.studentId.name ||
                "Unknown Student"
            );
        }

        return (
            student?.name ||
            "Unknown Student"
        );
    };


    // ==========================================
    // GET STUDENT ROLL
    // ==========================================

    const getStudentRollNo = (student) => {

        if (
            student?.studentId &&
            typeof student.studentId === "object"
        ) {

            return (
                student.studentId.rollNo ||
                "-"
            );
        }

        return (
            student?.rollNo ||
            "-"
        );
    };


    // ==========================================
    // GET STATUS
    // ==========================================

    const getStudentStatus = (student) => {

        return String(
            student?.status ||
            student?.attendanceStatus ||
            ""
        )
            .trim()
            .toLowerCase();
    };


    // ==========================================
    // LOAD CLASSES + TEACHERS
    // ==========================================

    const loadFilterData = async () => {

        const [
            classesResponse,
            teachersResponse,
        ] = await Promise.all([

            api.get(
                "/classes"
            ),

            api.get(
                "/teachers"
            ),
        ]);


        const classesPayload =
            classesResponse.data;

        let classList = [];


        if (
            Array.isArray(
                classesPayload?.classes
            )
        ) {

            classList =
                classesPayload.classes;

        } else if (
            Array.isArray(
                classesPayload?.data
            )
        ) {

            classList =
                classesPayload.data;

        } else if (
            Array.isArray(
                classesPayload
            )
        ) {

            classList =
                classesPayload;
        }


        setClasses(
            classList
        );


        const teachersPayload =
            teachersResponse.data;

        let teacherList = [];


        if (
            Array.isArray(
                teachersPayload?.teachers
            )
        ) {

            teacherList =
                teachersPayload.teachers;

        } else if (
            Array.isArray(
                teachersPayload?.data
            )
        ) {

            teacherList =
                teachersPayload.data;

        } else if (
            Array.isArray(
                teachersPayload
            )
        ) {

            teacherList =
                teachersPayload;
        }


        setTeachers(
            teacherList
        );
    };


    // ==========================================
    // LOAD ATTENDANCE
    // ==========================================

    const loadAttendance = async () => {

        let response;


        if (selectedDate) {

            let url =
                `/attendance/report/date/${selectedDate}`;


            if (
                selectedClass !==
                "all"
            ) {

                url +=
                    `?classId=${selectedClass}`;
            }


            response =
                await api.get(
                    url
                );


            const payload =
                response.data;


            const dateClasses =
                Array.isArray(
                    payload?.classes
                )
                    ? payload.classes
                    : [];


            const convertedRecords =
                dateClasses.map(
                    (classReport) => {

                        return {

                            _id:
                                classReport.attendanceId,

                            attendanceId:
                                classReport.attendanceId,

                            date:
                                classReport.date ||
                                selectedDate,

                            classId: {

                                _id:
                                    classReport.classId,

                                className:
                                    classReport.className,
                            },

                            markedBy:
                                classReport.markedBy,

                            students:
                                Array.isArray(
                                    classReport.students
                                )
                                    ? classReport.students.map(
                                          (
                                              student
                                          ) => ({

                                              studentId: {

                                                  _id:
                                                      student.studentId,

                                                  name:
                                                      student.name,

                                                  rollNo:
                                                      student.rollNo,
                                              },

                                              status:
                                                  student.status,
                                          })
                                      )
                                    : [],
                        };
                    }
                );


            setAttendanceData(
                convertedRecords
            );


            return;
        }


        let url =
            "/attendance";


        const params = [];


        if (
            selectedClass !==
            "all"
        ) {

            params.push(
                `classId=${selectedClass}`
            );
        }


        if (
            params.length > 0
        ) {

            url +=
                `?${params.join("&")}`;
        }


        response =
            await api.get(
                url
            );


        const attendancePayload =
            response.data;


        let attendance = [];


        if (
            Array.isArray(
                attendancePayload?.attendance
            )
        ) {

            attendance =
                attendancePayload.attendance;

        } else if (
            Array.isArray(
                attendancePayload?.data
            )
        ) {

            attendance =
                attendancePayload.data;

        } else if (
            Array.isArray(
                attendancePayload
            )
        ) {

            attendance =
                attendancePayload;
        }


        setAttendanceData(
            attendance
        );
    };


    // ==========================================
    // LOAD EVERYTHING
    // ==========================================

    const loadData = async (
        showLoading = true
    ) => {

        try {

            if (showLoading) {
                setLoading(true);
            }

            setError("");


            await Promise.all([
                loadFilterData(),
                loadAttendance(),
            ]);

        } catch (err) {

            console.error(
                "Admin Reports Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to load admin reports."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        loadData();

    }, []);


    // ==========================================
    // RELOAD FILTERED ATTENDANCE
    // ==========================================

    useEffect(() => {

        if (!loading) {

            loadAttendance()
                .catch(
                    (err) => {

                        console.error(
                            "Filter Attendance Error:",
                            err
                        );

                        setError(
                            err.response?.data?.message ||
                            "Unable to load filtered attendance."
                        );
                    }
                );
        }

    }, [
        selectedClass,
        selectedDate,
    ]);


    // ==========================================
    // REFRESH
    // ==========================================

    const handleRefresh = async () => {

        try {

            setRefreshing(true);
            setError("");


            await loadFilterData();

            await loadAttendance();

        } catch (err) {

            console.error(
                "Refresh Admin Reports Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to refresh reports."
            );

        } finally {

            setRefreshing(false);
        }
    };


    // ==========================================
    // TEACHER FILTER
    // ==========================================

    const filteredAttendance =
        useMemo(() => {

            return attendanceData.filter(
                (record) => {

                    if (
                        selectedTeacher !==
                        "all"
                    ) {

                        if (
                            getTeacherId(
                                record
                            ) !==
                            String(
                                selectedTeacher
                            )
                        ) {

                            return false;
                        }
                    }

                    return true;
                }
            );

        }, [
            attendanceData,
            selectedTeacher,
        ]);


    // ==========================================
    // SUMMARY
    // ==========================================

    const summary =
        useMemo(() => {

            let present = 0;
            let absent = 0;

            const studentIds =
                new Set();


            filteredAttendance.forEach(
                (record) => {

                    const students =
                        getStudentRecords(
                            record
                        );


                    students.forEach(
                        (
                            student,
                            index
                        ) => {

                            const studentId =
                                getStudentId(
                                    student,
                                    index
                                );


                            studentIds.add(
                                String(
                                    studentId
                                )
                            );


                            const status =
                                getStudentStatus(
                                    student
                                );


                            if (
                                status ===
                                "present"
                            ) {
                                present++;
                            }


                            if (
                                status ===
                                "absent"
                            ) {
                                absent++;
                            }
                        }
                    );
                }
            );


            const total =
                present +
                absent;


            const percentage =
                total > 0
                    ? (
                          present /
                          total
                      ) * 100
                    : 0;


            return {

                totalStudents:
                    studentIds.size,

                attendanceDays:
                    filteredAttendance.length,

                present,

                absent,

                percentage,
            };

        }, [
            filteredAttendance,
        ]);


    // ==========================================
    // CLASS REPORTS
    // ==========================================

    const classReports =
        useMemo(() => {

            const grouped = {};


            filteredAttendance.forEach(
                (record) => {

                    const classId =
                        getClassId(
                            record
                        ) ||
                        getClassName(
                            record
                        );


                    if (
                        !grouped[classId]
                    ) {

                        grouped[classId] = {

                            classId,

                            className:
                                getClassName(
                                    record
                                ),

                            teacherName:
                                getTeacherName(
                                    record
                                ),

                            days:
                                0,

                            present:
                                0,

                            absent:
                                0,
                        };
                    }


                    grouped[
                        classId
                    ].days++;


                    const students =
                        getStudentRecords(
                            record
                        );


                    students.forEach(
                        (student) => {

                            const status =
                                getStudentStatus(
                                    student
                                );


                            if (
                                status ===
                                "present"
                            ) {

                                grouped[
                                    classId
                                ].present++;
                            }


                            if (
                                status ===
                                "absent"
                            ) {

                                grouped[
                                    classId
                                ].absent++;
                            }
                        }
                    );
                }
            );


            return Object.values(
                grouped
            ).map(
                (item) => {

                    const total =
                        item.present +
                        item.absent;


                    const percentage =
                        total > 0
                            ? (
                                  item.present /
                                  total
                              ) * 100
                            : 0;


                    return {
                        ...item,
                        percentage,
                    };
                }
            );

        }, [
            filteredAttendance,
        ]);


    // ==========================================
    // ATTENDANCE ACTIVITY
    // ==========================================

    const attendanceActivity =
        useMemo(() => {

            return filteredAttendance
                .map(
                    (record) => {

                        const students =
                            getStudentRecords(
                                record
                            );


                        let present = 0;
                        let absent = 0;


                        students.forEach(
                            (student) => {

                                const status =
                                    getStudentStatus(
                                        student
                                    );


                                if (
                                    status ===
                                    "present"
                                ) {
                                    present++;
                                }


                                if (
                                    status ===
                                    "absent"
                                ) {
                                    absent++;
                                }
                            }
                        );


                        return {

                            ...record,

                            totalStudents:
                                students.length,

                            present,

                            absent,
                        };
                    }
                );

        }, [
            filteredAttendance,
        ]);


    // ==========================================
    // PERCENTAGE CLASS
    // ==========================================

    const getPercentageClass = (
        percentage
    ) => {

        if (
            percentage >= 75
        ) {
            return "percentage-good";
        }


        if (
            percentage >= 50
        ) {
            return "percentage-warning";
        }


        return "percentage-danger";
    };


    // ==========================================
    // CLEAR FILTERS
    // ==========================================

    const clearFilters = () => {

        setSelectedClass("all");

        setSelectedTeacher("all");

        setSelectedDate("");
    };


    // ==========================================
    // FILTER ACTIVE CHECK
    // ==========================================

    const hasActiveFilters =
        selectedClass !== "all" ||
        selectedTeacher !== "all" ||
        selectedDate !== "";


    // ==========================================
    // SELECTED CLASS NAME
    // ==========================================

    const selectedClassName =
        selectedClass === "all"
            ? "All Classes"
            : classes.find(
                  (item) =>
                      String(
                          item._id
                      ) ===
                      String(
                          selectedClass
                      )
              )?.className ||
              "Selected Class";


    // ==========================================
    // SELECTED TEACHER NAME
    // ==========================================

    const selectedTeacherName =
        selectedTeacher === "all"
            ? "All Teachers"
            : teachers.find(
                  (teacher) =>
                      String(
                          teacher._id
                      ) ===
                      String(
                          selectedTeacher
                      )
              )?.name ||
              "Selected Teacher";


    // ==========================================
    // LOADING
    // ==========================================

    if (
        loading &&
        attendanceData.length === 0
    ) {

        return (

            <div className="reports-page">

                <div className="reports-loading">

                    Loading admin reports...

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
                        ADMIN REPORTS
                    </p>


                    <h1>
                        Attendance Reports
                    </h1>


                    <p className="reports-description">
                        View attendance performance by
                        class and date.
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
                        Unable to load reports
                    </strong>


                    <span>
                        {error}
                    </span>

                </div>
            )}


            {/* ======================================
                FILTER CARD
            ====================================== */}

            <div className="admin-filter-card">

                <div className="admin-filter-header">

                    <div className="admin-filter-heading">

                        <div className="admin-filter-icon">
                            <FaFilter />
                        </div>


                        <div>

                            <h2>
                                Report Filters
                            </h2>

                            <p>
                                Narrow down attendance
                                records by class, date,
                                or teacher.
                            </p>

                        </div>

                    </div>


                    {hasActiveFilters && (

                        <button
                            type="button"
                            className="clear-filter-button"
                            onClick={clearFilters}
                        >

                            <FaTimes />

                            Clear Filters

                        </button>

                    )}

                </div>


                <div className="admin-filter-divider" />


                <div className="admin-filter-grid">


                    {/* ==================================
                        CLASS
                    ================================== */}

                    <div className="admin-filter-field">

                        <label htmlFor="report-class">

                            <span className="filter-label-icon">
                                <FaUsers />
                            </span>

                            Class

                        </label>


                        <div className="filter-input-wrapper">

                            <select
                                id="report-class"
                                value={
                                    selectedClass
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSelectedClass(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="all">
                                    All Classes
                                </option>


                                {classes.map(
                                    (classItem) => (

                                        <option
                                            key={
                                                classItem._id
                                            }
                                            value={
                                                classItem._id
                                            }
                                        >

                                            {
                                                classItem.className ||
                                                classItem.name
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>


                    {/* ==================================
                        DATE
                    ================================== */}

                    <div className="admin-filter-field">

                        <label htmlFor="report-date">

                            <span className="filter-label-icon">
                                <FaCalendarAlt />
                            </span>

                            Date

                        </label>


                        <div className="filter-input-wrapper">

                            <input
                                id="report-date"
                                type="date"
                                value={
                                    selectedDate
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSelectedDate(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                    </div>


                    {/* ==================================
                        TEACHER
                    ================================== */}

                    <div className="admin-filter-field">

                        <label htmlFor="report-teacher">

                            <span className="filter-label-icon">
                                <FaChalkboardTeacher />
                            </span>

                            Teacher

                        </label>


                        <div className="filter-input-wrapper">

                            <select
                                id="report-teacher"
                                value={
                                    selectedTeacher
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSelectedTeacher(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="all">
                                    All Teachers
                                </option>


                                {teachers.map(
                                    (teacher) => (

                                        <option
                                            key={
                                                teacher._id
                                            }
                                            value={
                                                teacher._id
                                            }
                                        >

                                            {
                                                teacher.name ||
                                                teacher.email
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    ACTIVE FILTERS
                ================================== */}

                {hasActiveFilters && (

                    <div className="active-filter-row">

                        <span className="active-filter-label">
                            Active filters
                        </span>


                        {selectedClass !== "all" && (

                            <span className="filter-chip">

                                <FaUsers />

                                {selectedClassName}

                            </span>

                        )}


                        {selectedDate && (

                            <span className="filter-chip">

                                <FaCalendarAlt />

                                {selectedDate}

                            </span>

                        )}


                        {selectedTeacher !== "all" && (

                            <span className="filter-chip">

                                <FaChalkboardTeacher />

                                {selectedTeacherName}

                            </span>

                        )}

                    </div>

                )}

            </div>


            {/* ======================================
                SUMMARY
            ====================================== */}

            <div className="summary-grid">


                <div className="summary-card">

                    <div className="summary-icon">
                        <FaUsers />
                    </div>


                    <div>

                        <span>
                            Students
                        </span>


                        <strong>
                            {
                                summary.totalStudents
                            }
                        </strong>

                    </div>

                </div>


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
                                summary.attendanceDays
                            }
                        </strong>

                    </div>

                </div>


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
                                summary.present
                            }
                        </strong>

                    </div>

                </div>


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
                                summary.absent
                            }
                        </strong>

                    </div>

                </div>


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
                                    summary.percentage
                                )
                            }
                        >

                            {
                                summary.percentage.toFixed(
                                    1
                                )
                            }%

                        </strong>

                    </div>

                </div>

            </div>


            {/* ======================================
                CLASS REPORTS
            ====================================== */}

            <div className="student-report-card">

                <div className="section-heading">

                    <div>

                        <p className="card-label">
                            CLASS PERFORMANCE
                        </p>


                        <h2>
                            Class Reports
                        </h2>

                    </div>

                </div>


                {classReports.length === 0 ? (

                    <div className="report-empty">

                        <FaChartBar />

                        <h3>
                            No attendance records
                        </h3>

                        <p>
                            No attendance records match
                            the selected filters.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Class
                                    </th>

                                    <th>
                                        Teacher
                                    </th>

                                    <th>
                                        Attendance Days
                                    </th>

                                    <th>
                                        Present
                                    </th>

                                    <th>
                                        Absent
                                    </th>

                                    <th>
                                        Attendance
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {classReports.map(
                                    (report) => (

                                        <tr
                                            key={
                                                report.classId
                                            }
                                        >

                                            <td>

                                                <strong>
                                                    {
                                                        report.className
                                                    }
                                                </strong>

                                            </td>


                                            <td>
                                                {
                                                    report.teacherName
                                                }
                                            </td>


                                            <td>
                                                {
                                                    report.days
                                                }
                                            </td>


                                            <td className="present-cell">
                                                {
                                                    report.present
                                                }
                                            </td>


                                            <td className="absent-cell">
                                                {
                                                    report.absent
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        `percentage-badge ${
                                                            getPercentageClass(
                                                                report.percentage
                                                            )
                                                        }`
                                                    }
                                                >

                                                    {
                                                        report.percentage.toFixed(
                                                            1
                                                        )
                                                    }%

                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ======================================
                ATTENDANCE ACTIVITY
            ====================================== */}

            <div className="student-report-card">

                <div className="section-heading">

                    <div>

                        <p className="card-label">
                            ATTENDANCE ACTIVITY
                        </p>


                        <h2>
                            Attendance Records
                        </h2>

                    </div>

                </div>


                {attendanceActivity.length === 0 ? (

                    <div className="report-empty">

                        <FaChartBar />

                        <h3>
                            No records found
                        </h3>

                        <p>
                            Try changing the filters.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Class
                                    </th>

                                    <th>
                                        Teacher
                                    </th>

                                    <th>
                                        Students
                                    </th>

                                    <th>
                                        Present
                                    </th>

                                    <th>
                                        Absent
                                    </th>

                                    <th>
                                        Attendance
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {attendanceActivity.map(
                                    (
                                        record,
                                        index
                                    ) => {

                                        const total =
                                            record.present +
                                            record.absent;


                                        const percentage =
                                            total > 0
                                                ? (
                                                      record.present /
                                                      total
                                                  ) *
                                                  100
                                                : 0;


                                        return (

                                            <tr
                                                key={
                                                    record._id ||
                                                    record.attendanceId ||
                                                    index
                                                }
                                            >

                                                <td>
                                                    {
                                                        getDate(
                                                            record
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        getClassName(
                                                            record
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        getTeacherName(
                                                            record
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        record.totalStudents
                                                    }
                                                </td>


                                                <td className="present-cell">
                                                    {
                                                        record.present
                                                    }
                                                </td>


                                                <td className="absent-cell">
                                                    {
                                                        record.absent
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

        </div>
    );
};


export default AdminReports;