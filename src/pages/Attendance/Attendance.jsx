import { useEffect, useState } from "react";

import {
    FaCheck,
    FaSave,
    FaTimes,
    FaCalendarAlt,
    FaUsers,
    FaUserCheck,
    FaUserTimes,
    FaChartPie,
    FaClipboardCheck,
    FaInfoCircle,
} from "react-icons/fa";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import "./Attendance.css";


const Attendance = () => {

    const { user } = useAuth();

    const isTeacher =
        user?.role === "teacher";

    const isAdmin =
        user?.role === "admin";


    // ==========================================
    // STATE
    // ==========================================

    const [classes, setClasses] =
        useState([]);

    const [students, setStudents] =
        useState([]);

    const [selectedClass, setSelectedClass] =
        useState("");

    const [selectedDate, setSelectedDate] =
        useState("");

    const [attendance, setAttendance] =
        useState({});

    const [existingRecord, setExistingRecord] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [loadingStudents, setLoadingStudents] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");


    // ==========================================
    // TODAY
    // ==========================================

    const getToday = () => {

        const today = new Date();

        const year =
            today.getFullYear();

        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                today.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };


    // ==========================================
    // NORMALIZE DATE
    // ==========================================

    const normalizeDate = (date) => {

        if (!date) {
            return "";
        }

        if (
            typeof date === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(date)
        ) {
            return date;
        }

        const parsed =
            new Date(date);

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {
            return "";
        }

        const year =
            parsed.getFullYear();

        const month =
            String(
                parsed.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                parsed.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        initializePage();

    }, [user?.role]);


    // ==========================================
    // INITIALIZE PAGE
    // ==========================================

    const initializePage = async () => {

        try {

            setLoading(true);
            setError("");
            setMessage("");

            const today =
                getToday();

            setSelectedDate(today);


            // ==================================
            // TEACHER
            // ==================================

            if (isTeacher) {

                const response =
                    await api.get(
                        "/classes/my-class"
                    );

                const responseData =
                    response.data;

                const myClass =
                    responseData.class ||
                    responseData.myClass ||
                    responseData.data?.class ||
                    responseData.data;

                if (
                    !myClass ||
                    !myClass._id
                ) {

                    setClasses([]);
                    setStudents([]);

                    setError(
                        "No class is assigned to you."
                    );

                    return;
                }

                setClasses([
                    myClass,
                ]);

                setSelectedClass(
                    myClass._id
                );

                await loadStudentsForClass(
                    myClass._id
                );

                return;
            }


            // ==================================
            // ADMIN
            // ==================================

            if (isAdmin) {

                const response =
                    await api.get(
                        "/classes"
                    );

                const allClasses =
                    response.data
                        ?.classes || [];

                setClasses(
                    allClasses
                );

                setSelectedClass("");
                setStudents([]);
                setAttendance({});
                setExistingRecord(null);

                return;
            }

        } catch (err) {

            console.error(
                "Attendance Initial Load Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load attendance data."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // LOAD STUDENTS
    // ==========================================

    const loadStudentsForClass =
        async (classId) => {

            if (!classId) {

                setStudents([]);
                setAttendance({});
                setExistingRecord(null);

                return;
            }

            try {

                setLoadingStudents(true);
                setError("");
                setMessage("");

                const response =
                    await api.get(
                        "/students"
                    );

                const allStudents =
                    response.data
                        ?.students || [];

                const classStudents =
                    allStudents.filter(
                        (student) => {

                            const studentClassId =
                                student.classId?._id ||
                                student.classId;

                            return (
                                studentClassId &&
                                studentClassId.toString() ===
                                    classId.toString() &&
                                student.active !== false
                            );
                        }
                    );

                setStudents(
                    classStudents
                );

                await loadExistingAttendance(
                    classId,
                    selectedDate,
                    classStudents
                );

            } catch (err) {

                console.error(
                    "Load Students Error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to load students."
                );

            } finally {

                setLoadingStudents(false);
            }
        };


    // ==========================================
    // LOAD EXISTING ATTENDANCE
    // ==========================================

    const loadExistingAttendance =
        async (
            classId,
            date,
            classStudents
        ) => {

            if (
                !classId ||
                !date
            ) {

                setExistingRecord(null);
                return;
            }

            try {

                setError("");
                setMessage("");

                const response =
                    await api.get(
                        `/attendance?classId=${classId}&date=${date}`
                    );

                const records =
                    response.data
                        ?.attendance || [];

                const record =
                    records.length > 0
                        ? records[0]
                        : null;

                setExistingRecord(
                    record
                );


                // ==================================
                // NO RECORD
                // ==================================

                if (!record) {

                    const initial =
                        {};

                    classStudents.forEach(
                        (student) => {

                            initial[
                                student._id
                            ] =
                                "Present";
                        }
                    );

                    setAttendance(
                        initial
                    );

                    return;
                }


                // ==================================
                // EXISTING RECORD
                // ==================================

                const saved =
                    {};

                classStudents.forEach(
                    (student) => {

                        saved[
                            student._id
                        ] =
                            "Absent";
                    }
                );


                if (
                    Array.isArray(
                        record.students
                    )
                ) {

                    record.students.forEach(
                        (studentRecord) => {

                            const studentId =
                                studentRecord.studentId?._id ||
                                studentRecord.studentId;

                            if (!studentId) {
                                return;
                            }

                            saved[
                                studentId.toString()
                            ] =
                                studentRecord.status;
                        }
                    );
                }

                setAttendance(
                    saved
                );

            } catch (err) {

                console.error(
                    "Load Existing Attendance Error:",
                    err
                );

                if (
                    err.response?.status ===
                    404
                ) {

                    setExistingRecord(
                        null
                    );

                    const initial =
                        {};

                    classStudents.forEach(
                        (student) => {

                            initial[
                                student._id
                            ] =
                                "Present";
                        }
                    );

                    setAttendance(
                        initial
                    );

                    return;
                }

                setError(
                    err.response?.data?.message ||
                    "Unable to check existing attendance."
                );
            }
        };


    // ==========================================
    // CLASS CHANGE
    // ==========================================

    const handleClassChange =
        async (event) => {

            const classId =
                event.target.value;

            setSelectedClass(
                classId
            );

            setStudents([]);
            setAttendance({});
            setExistingRecord(null);

            setError("");
            setMessage("");

            if (!classId) {
                return;
            }

            await loadStudentsForClass(
                classId
            );
        };


    // ==========================================
    // DATE CHANGE
    // ==========================================

    const handleDateChange =
        async (event) => {

            const date =
                event.target.value;

            setSelectedDate(
                date
            );

            setError("");
            setMessage("");

            if (
                selectedClass &&
                students.length > 0
            ) {

                await loadExistingAttendance(
                    selectedClass,
                    date,
                    students
                );
            }
        };


    // ==========================================
    // STATUS CHANGE
    // ==========================================

    const handleStatusChange =
        (
            studentId,
            status
        ) => {

            setAttendance(
                (previous) => ({
                    ...previous,

                    [studentId]:
                        status,
                })
            );

            setError("");
            setMessage("");
        };


    // ==========================================
    // ALL PRESENT
    // ==========================================

    const markAllPresent =
        () => {

            const updated =
                {};

            students.forEach(
                (student) => {

                    updated[
                        student._id
                    ] =
                        "Present";
                }
            );

            setAttendance(
                updated
            );

            setError("");
            setMessage("");
        };


    // ==========================================
    // ALL ABSENT
    // ==========================================

    const markAllAbsent =
        () => {

            const updated =
                {};

            students.forEach(
                (student) => {

                    updated[
                        student._id
                    ] =
                        "Absent";
                }
            );

            setAttendance(
                updated
            );

            setError("");
            setMessage("");
        };


    // ==========================================
    // SAVE ATTENDANCE
    // ==========================================

    const handleSubmit =
        async (event) => {

            event.preventDefault();

            setError("");
            setMessage("");


            // ==================================
            // VALIDATION
            // ==================================

            if (!selectedClass) {

                setError(
                    "Please select a class."
                );

                return;
            }

            if (!selectedDate) {

                setError(
                    "Please select a date."
                );

                return;
            }

            if (
                !students ||
                students.length === 0
            ) {

                setError(
                    "There are no active students in this class."
                );

                return;
            }


            try {

                setSaving(true);


                const studentRecords =
                    students.map(
                        (student) => ({
                            studentId:
                                student._id,

                            status:
                                attendance[
                                    student._id
                                ] ||
                                "Absent",
                        })
                    );


                const payload = {

                    classId:
                        selectedClass,

                    date:
                        selectedDate,

                    students:
                        studentRecords,
                };


                // ==================================
                // EXISTING → UPDATE
                // ==================================

                if (existingRecord) {

                    const response =
                        await api.put(
                            `/attendance/${existingRecord._id}`,
                            {
                                students:
                                    studentRecords,
                            }
                        );

                    console.log(
                        "Update Attendance Response:",
                        response.data
                    );

                    setMessage(
                        "Attendance updated successfully."
                    );

                }

                // ==================================
                // NEW → CREATE
                // ==================================

                else {

                    const response =
                        await api.post(
                            "/attendance",
                            payload
                        );

                    console.log(
                        "Mark Attendance Response:",
                        response.data
                    );

                    setMessage(
                        "Attendance marked successfully."
                    );
                }


                // ==================================
                // RELOAD RECORD
                // ==================================

                await loadExistingAttendance(
                    selectedClass,
                    selectedDate,
                    students
                );

            } catch (err) {

                console.error(
                    existingRecord
                        ? "Update Attendance Error:"
                        : "Mark Attendance Error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to save attendance."
                );

            } finally {

                setSaving(false);
            }
        };


    // ==========================================
    // CALCULATE SUMMARY
    // ==========================================

    const presentCount =
        students.filter(
            (student) =>
                attendance[student._id] ===
                "Present"
        ).length;

    const absentCount =
        students.filter(
            (student) =>
                attendance[student._id] ===
                "Absent"
        ).length;

    const totalStudents =
        students.length;

    const attendancePercentage =
        totalStudents > 0
            ? Math.round(
                (presentCount /
                    totalStudents) *
                    100
            )
            : 0;


    // ==========================================
    // INITIALS
    // ==========================================

    const getInitials =
        (name = "") => {

            const words =
                name
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean);

            if (!words.length) {
                return "?";
            }

            if (words.length === 1) {
                return words[0]
                    .substring(0, 2)
                    .toUpperCase();
            }

            return (
                words[0][0] +
                words[words.length - 1][0]
            ).toUpperCase();
        };


    // ==========================================
    // FORMAT SELECTED DATE
    // ==========================================

    const formatDisplayDate =
        (date) => {

            if (!date) {
                return "Select date";
            }

            const parts =
                date.split("-");

            if (parts.length !== 3) {
                return date;
            }

            return `${parts[2]} ${new Date(
                Number(parts[0]),
                Number(parts[1]) - 1,
                1
            ).toLocaleString(
                "en-US",
                {
                    month: "short",
                }
            )} ${parts[0]}`;
        };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="attendance-page">

                <div className="attendance-loading-card">

                    <div className="attendance-loading-icon">
                        <FaClipboardCheck />
                    </div>

                    <div className="attendance-spinner" />

                    <h3>
                        Loading attendance
                    </h3>

                    <p>
                        Preparing your attendance workspace...
                    </p>

                </div>

            </div>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="attendance-page">


            {/* ======================================
                HEADER
            ====================================== */}

            <div className="attendance-header">

                <div className="attendance-header-content">

                    <div>

                        <div className="attendance-title-row">

                            <div className="attendance-title-icon">
                                <FaClipboardCheck />
                            </div>

                            <div>

                                <p className="attendance-page-label">
                                    ATTENDANCE MANAGEMENT
                                </p>

                                <h1>
                                    Attendance
                                </h1>

                            </div>

                        </div>

                        <p className="attendance-page-description">

                            {isTeacher
                                ? "Mark and edit attendance for your assigned class."
                                : "Mark and edit attendance for any class."
                            }

                        </p>

                    </div>

                </div>

            </div>


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (

                <div className="attendance-alert attendance-alert-error">

                    <div className="attendance-alert-icon">
                        <FaTimes />
                    </div>

                    <div>
                        <strong>
                            Something went wrong
                        </strong>

                        <span>
                            {error}
                        </span>
                    </div>

                </div>
            )}


            {/* ======================================
                SUCCESS
            ====================================== */}

            {message && (

                <div className="attendance-alert attendance-alert-success">

                    <div className="attendance-alert-icon">
                        <FaCheck />
                    </div>

                    <div>
                        <strong>
                            Success
                        </strong>

                        <span>
                            {message}
                        </span>
                    </div>

                </div>
            )}


            {/* ======================================
                SETUP CARD
            ====================================== */}

            <div className="attendance-setup-card">

                <div className="attendance-setup-header">

                    <div className="setup-heading">

                        <div className="setup-heading-icon">
                            <FaCalendarAlt />
                        </div>

                        <div>

                            <h2>
                                Attendance Setup
                            </h2>

                            <p>
                                Select the class and date you want to manage.
                            </p>

                        </div>

                    </div>

                    {existingRecord && (
                        <div className="record-badge">
                            <FaCheck />
                            Already marked
                        </div>
                    )}

                </div>


                <div className="attendance-filters">


                    {/* CLASS */}

                    <div className="filter-group">

                        <label htmlFor="attendance-class">
                            Class
                        </label>

                        <div className="input-wrapper">

                            <FaUsers className="input-icon" />

                            {isTeacher ? (

                                <select
                                    id="attendance-class"
                                    value={
                                        selectedClass
                                    }
                                    disabled
                                >

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
                                                    classItem.className
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            ) : (

                                <select
                                    id="attendance-class"
                                    value={
                                        selectedClass
                                    }
                                    onChange={
                                        handleClassChange
                                    }
                                >

                                    <option value="">
                                        Select class
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
                                                    classItem.className
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            )}

                        </div>

                    </div>


                    {/* DATE */}

                    <div className="filter-group">

                        <label htmlFor="attendance-date">
                            Attendance Date
                        </label>

                        <div className="input-wrapper">

                            <FaCalendarAlt className="input-icon" />

                            <input
                                id="attendance-date"
                                type="date"
                                value={
                                    selectedDate
                                }
                                onChange={
                                    handleDateChange
                                }
                            />

                        </div>

                        <span className="filter-helper">
                            {formatDisplayDate(selectedDate)}
                        </span>

                    </div>

                </div>

            </div>


            {/* ======================================
                EXISTING RECORD
            ====================================== */}

            {existingRecord && (

                <div className="existing-attendance">

                    <div className="existing-attendance-icon">
                        <FaInfoCircle />
                    </div>

                    <div className="existing-attendance-content">

                        <strong>
                            Attendance already exists
                        </strong>

                        <span>
                            This class already has an attendance record
                            for the selected date.
                        </span>

                        <p>
                            Marked by{" "}
                            <strong>
                                {
                                    existingRecord
                                        .markedBy
                                        ?.name ||
                                    "user"
                                }
                            </strong>
                            . You can edit the Present/Absent
                            status below and save it again.
                        </p>

                    </div>

                </div>
            )}


            {/* ======================================
                ATTENDANCE WORKSPACE
            ====================================== */}

            {selectedClass &&
                selectedDate && (

                    <div className="attendance-workspace">


                        {/* ==================================
                            STUDENTS HEADER
                        ================================== */}

                        <div className="students-header">

                            <div className="students-heading">

                                <div className="students-heading-icon">
                                    <FaUsers />
                                </div>

                                <div>

                                    <h2>
                                        Students
                                    </h2>

                                    <p>
                                        {students.length} active{" "}
                                        {students.length === 1
                                            ? "student"
                                            : "students"
                                        }
                                    </p>

                                </div>

                            </div>


                            {students.length > 0 && (

                                <div className="bulk-actions">

                                    <button
                                        type="button"
                                        className="bulk-button bulk-present"
                                        onClick={
                                            markAllPresent
                                        }
                                    >
                                        <FaUserCheck />
                                        All Present
                                    </button>

                                    <button
                                        type="button"
                                        className="bulk-button bulk-absent"
                                        onClick={
                                            markAllAbsent
                                        }
                                    >
                                        <FaUserTimes />
                                        All Absent
                                    </button>

                                </div>

                            )}

                        </div>


                        {/* ==================================
                            SUMMARY
                        ================================== */}

                        {students.length > 0 && (

                            <div className="attendance-summary">

                                <div className="summary-item">

                                    <div className="summary-icon summary-total-icon">
                                        <FaUsers />
                                    </div>

                                    <div>
                                        <span>
                                            Students
                                        </span>

                                        <strong>
                                            {totalStudents}
                                        </strong>
                                    </div>

                                </div>


                                <div className="summary-divider" />


                                <div className="summary-item">

                                    <div className="summary-icon summary-present-icon">
                                        <FaUserCheck />
                                    </div>

                                    <div>
                                        <span>
                                            Present
                                        </span>

                                        <strong>
                                            {presentCount}
                                        </strong>
                                    </div>

                                </div>


                                <div className="summary-divider" />


                                <div className="summary-item">

                                    <div className="summary-icon summary-absent-icon">
                                        <FaUserTimes />
                                    </div>

                                    <div>
                                        <span>
                                            Absent
                                        </span>

                                        <strong>
                                            {absentCount}
                                        </strong>
                                    </div>

                                </div>


                                <div className="summary-divider" />


                                <div className="summary-item">

                                    <div className="summary-icon summary-percent-icon">
                                        <FaChartPie />
                                    </div>

                                    <div>
                                        <span>
                                            Attendance
                                        </span>

                                        <strong>
                                            {attendancePercentage}%
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        )}


                        {/* ==================================
                            LOADING
                        ================================== */}

                        {loadingStudents ? (

                            <div className="students-loading">

                                <div className="attendance-spinner" />

                                <strong>
                                    Loading students...
                                </strong>

                                <span>
                                    Please wait while we prepare the class list.
                                </span>

                            </div>

                        ) : students.length === 0 ? (

                            <div className="empty-students">

                                <div className="empty-students-icon">
                                    <FaUsers />
                                </div>

                                <h3>
                                    No active students
                                </h3>

                                <p>
                                    There are no active students found
                                    in this class.
                                </p>

                            </div>

                        ) : (

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                            >

                                {/* ==================================
                                    LIST HEADER
                                ================================== */}

                                <div className="attendance-list-header">

                                    <span>
                                        STUDENT
                                    </span>

                                    <span>
                                        ATTENDANCE STATUS
                                    </span>

                                </div>


                                {/* ==================================
                                    STUDENT LIST
                                ================================== */}

                                <div className="attendance-list">

                                    {students.map(
                                        (
                                            student,
                                            index
                                        ) => {

                                            const status =
                                                attendance[
                                                    student._id
                                                ] ||
                                                "Absent";

                                            return (

                                                <div
                                                    className={`attendance-row ${
                                                        status === "Present"
                                                            ? "row-present"
                                                            : "row-absent"
                                                    }`}
                                                    key={
                                                        student._id
                                                    }
                                                >


                                                    {/* STUDENT */}

                                                    <div className="student-info">

                                                        <div className="student-roll">
                                                            {student.rollNo}
                                                        </div>

                                                        <div className="student-avatar">
                                                            {
                                                                getInitials(
                                                                    student.name
                                                                )
                                                            }
                                                        </div>

                                                        <div className="student-details">

                                                            <strong>
                                                                {
                                                                    student.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                Student #{index + 1}
                                                            </span>

                                                        </div>

                                                    </div>


                                                    {/* STATUS */}

                                                    <div className="status-area">

                                                        <div className="status-buttons">

                                                            <button
                                                                type="button"
                                                                className={
                                                                    status ===
                                                                    "Present"
                                                                        ? "status-button present selected"
                                                                        : "status-button present"
                                                                }
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        student._id,
                                                                        "Present"
                                                                    )
                                                                }
                                                            >

                                                                <FaCheck />

                                                                <span>
                                                                    Present
                                                                </span>

                                                            </button>


                                                            <button
                                                                type="button"
                                                                className={
                                                                    status ===
                                                                    "Absent"
                                                                        ? "status-button absent selected"
                                                                        : "status-button absent"
                                                                }
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        student._id,
                                                                        "Absent"
                                                                    )
                                                                }
                                                            >

                                                                <FaTimes />

                                                                <span>
                                                                    Absent
                                                                </span>

                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )}

                                </div>


                                {/* ==================================
                                    SAVE FOOTER
                                ================================== */}

                                <div className="submit-section">

                                    <div className="submit-info">

                                        <span>
                                            {existingRecord
                                                ? "Changes will update the existing attendance record."
                                                : "Review all student statuses before saving."
                                            }
                                        </span>

                                    </div>

                                    <button
                                        type="submit"
                                        className="save-attendance-button"
                                        disabled={
                                            saving
                                        }
                                    >

                                        <FaSave />

                                        <span>
                                            {saving
                                                ? "Saving..."
                                                : existingRecord
                                                    ? "Update Attendance"
                                                    : "Mark Attendance"
                                            }
                                        </span>

                                    </button>

                                </div>

                            </form>

                        )}

                    </div>
                )}

        </div>
    );
};


export default Attendance;