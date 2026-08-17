import { useEffect, useState } from "react";

import {
    FaCheck,
    FaSave,
    FaTimes,
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

        const today =
            new Date();

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

        // Already YYYY-MM-DD
        if (
            typeof date === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(
                date
            )
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

                console.log(
                    "Checking attendance:",
                    {
                        classId,
                        date,
                    }
                );

                const response =
                    await api.get(
                        `/attendance?classId=${classId}&date=${date}`
                    );

                const records =
                    response.data
                        ?.attendance || [];

                console.log(
                    "Attendance records for selected date:",
                    records
                );

                const record =
                    records.length > 0
                        ? records[0]
                        : null;

                console.log(
                    "Existing Attendance:",
                    record
                );

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

                // Default missing students
                // to Absent.

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

                // A 404 is treated as no record.
                // Other errors are displayed.

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


                console.log(
                    "Attendance Payload:",
                    payload
                );


                // ==================================
                // EXISTING → UPDATE
                // ==================================

                if (existingRecord) {

                    console.log(
                        "Updating attendance:",
                        existingRecord._id
                    );

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

                    console.log(
                        "Creating new attendance"
                    );

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
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="attendance-page">

                <div className="page-loading">
                    Loading attendance...
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

                <div>

                    <p className="page-label">
                        ATTENDANCE MANAGEMENT
                    </p>

                    <h1>
                        Attendance
                    </h1>

                    <p className="page-description">

                        {isTeacher
                            ? "Mark and edit attendance for your assigned class."
                            : "Mark and edit attendance for any class."
                        }

                    </p>

                </div>

            </div>


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (

                <div className="attendance-error">

                    <FaTimes />

                    <span>
                        {error}
                    </span>

                </div>
            )}


            {/* ======================================
                SUCCESS
            ====================================== */}

            {message && (

                <div className="attendance-success">

                    <FaCheck />

                    <span>
                        {message}
                    </span>

                </div>
            )}


            {/* ======================================
                CLASS + DATE
            ====================================== */}

            <div className="attendance-card">

                <div className="attendance-filters">


                    {/* CLASS */}

                    <div className="filter-group">

                        <label>
                            Class
                        </label>


                        {isTeacher ? (

                            <select
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


                    {/* DATE */}

                    <div className="filter-group">

                        <label>
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
                        />

                    </div>

                </div>

            </div>


            {/* ======================================
                EXISTING RECORD NOTICE
            ====================================== */}

            {existingRecord && (

                <div className="existing-attendance">

                    <strong>
                        Attendance already exists
                        for this class and date.
                    </strong>

                    <span>
                        Marked by{" "}
                        {
                            existingRecord
                                .markedBy
                                ?.name ||
                            "user"
                        }
                    </span>

                    <span>
                        You can edit the
                        Present/Absent status
                        below and save it again.
                    </span>

                </div>
            )}


            {/* ======================================
                STUDENTS
            ====================================== */}

            {selectedClass &&
                selectedDate && (

                    <div className="attendance-card">


                        {/* HEADER */}

                        <div className="students-header">

                            <div>

                                <h2>
                                    Students
                                </h2>

                                <p>
                                    {
                                        students.length
                                    } active student
                                    {
                                        students.length !==
                                        1
                                            ? "s"
                                            : ""
                                    }
                                </p>

                            </div>


                            {students.length > 0 && (

                                <div className="bulk-actions">

                                    <button
                                        type="button"
                                        onClick={
                                            markAllPresent
                                        }
                                    >
                                        All Present
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            markAllAbsent
                                        }
                                    >
                                        All Absent
                                    </button>

                                </div>
                            )}

                        </div>


                        {/* LOADING */}

                        {loadingStudents ? (

                            <div className="students-loading">
                                Loading students...
                            </div>

                        ) : students.length === 0 ? (

                            <div className="empty-students">
                                No active students
                                found in this class.
                            </div>

                        ) : (

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                            >

                                <div className="attendance-list">

                                    {students.map(
                                        (student) => {

                                            const status =
                                                attendance[
                                                    student._id
                                                ] ||
                                                "Absent";

                                            return (

                                                <div
                                                    className="attendance-row"
                                                    key={
                                                        student._id
                                                    }
                                                >

                                                    <div className="student-info">

                                                        <strong>
                                                            {
                                                                student.rollNo
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                student.name
                                                            }
                                                        </span>

                                                    </div>


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
                                                            Present
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
                                                            Absent
                                                        </button>

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>


                                {/* SAVE */}

                                <div className="submit-section">

                                    <button
                                        type="submit"
                                        className="save-attendance-button"
                                        disabled={
                                            saving
                                        }
                                    >

                                        <FaSave />

                                        {saving
                                            ? "Saving..."
                                            : existingRecord
                                                ? "Update Attendance"
                                                : "Mark Attendance"
                                        }

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