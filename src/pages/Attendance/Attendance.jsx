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

    const isTeacher = user?.role === "teacher";
    const isAdmin = user?.role === "admin";

    // ==========================================
    // STATE
    // ==========================================

    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);

    const [selectedClass, setSelectedClass] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [attendance, setAttendance] = useState({});

    const [existingRecord, setExistingRecord] = useState(null);

    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");


    // ==========================================
    // GET TODAY
    // ==========================================

    const getToday = () => {
        const today = new Date();

        const year = today.getFullYear();

        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        return parsedDate
            .toISOString()
            .split("T")[0];
    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        loadInitialData();
    }, []);


    // ==========================================
    // LOAD INITIAL DATA
    // ==========================================

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError("");
            setMessage("");

            const today = getToday();

            setSelectedDate(today);


            // ======================================
            // TEACHER
            // ======================================

            if (isTeacher) {
                const [
                    classResponse,
                    attendanceResponse,
                ] = await Promise.all([
                    api.get("/classes/my-class"),
                    api.get("/attendance"),
                ]);

                console.log(
                    "Teacher My Class Response:",
                    classResponse.data
                );

                console.log(
                    "Teacher Attendance Response:",
                    attendanceResponse.data
                );


                // ==================================
                // FIND CLASS
                // ==================================

                const responseData =
                    classResponse.data;

                const myClass =
                    responseData.class ||
                    responseData.myClass ||
                    responseData.data?.class ||
                    responseData.data ||
                    responseData;


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


                setClasses([myClass]);

                setSelectedClass(
                    myClass._id
                );


                // ==================================
                // FIND STUDENTS
                // ==================================

                const classStudents =
                    responseData.students ||
                    responseData.data?.students ||
                    myClass.students ||
                    myClass.studentsList ||
                    [];


                console.log(
                    "Students received:",
                    classStudents
                );


                const activeStudents =
                    Array.isArray(classStudents)
                        ? classStudents.filter(
                              (student) =>
                                  student.active !== false
                          )
                        : [];


                setStudents(
                    activeStudents
                );


                // ==================================
                // LOAD ATTENDANCE
                // ==================================

                const records =
                    attendanceResponse.data
                        ?.attendance || [];


                setAttendanceRecords(
                    records
                );


                loadExistingAttendance(
                    myClass._id,
                    today,
                    activeStudents,
                    records
                );

                return;
            }


            // ======================================
            // ADMIN
            // ======================================

            if (isAdmin) {
                const [
                    classesResponse,
                    attendanceResponse,
                ] = await Promise.all([
                    api.get("/classes"),
                    api.get("/attendance"),
                ]);


                const allClasses =
                    classesResponse.data
                        ?.classes || [];


                const records =
                    attendanceResponse.data
                        ?.attendance || [];


                setClasses(
                    allClasses
                );

                setAttendanceRecords(
                    records
                );
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
    // FIND EXISTING ATTENDANCE
    // ==========================================

    const loadExistingAttendance = (
        classId,
        date,
        classStudents,
        records
    ) => {
        if (!classId || !date) {
            setExistingRecord(null);
            return;
        }


        const record = records.find(
            (item) => {
                const recordClassId =
                    item.classId?._id ||
                    item.classId;


                if (!recordClassId) {
                    return false;
                }


                if (
                    recordClassId.toString() !==
                    classId.toString()
                ) {
                    return false;
                }


                return (
                    formatDate(item.date) ===
                    date
                );
            }
        );


        console.log(
            "Existing Attendance:",
            record
        );


        setExistingRecord(
            record || null
        );


        // ======================================
        // NO EXISTING RECORD
        // ======================================

        if (!record) {
            const initialAttendance = {};

            classStudents.forEach(
                (student) => {
                    initialAttendance[
                        student._id
                    ] = "Present";
                }
            );

            setAttendance(
                initialAttendance
            );

            return;
        }


        // ======================================
        // EXISTING RECORD
        // LOAD SAVED VALUES
        // ======================================

        const savedAttendance = {};


        // Default all students to Absent
        classStudents.forEach(
            (student) => {
                savedAttendance[
                    student._id
                ] = "Absent";
            }
        );


        // Replace defaults with saved status
        if (
            Array.isArray(record.students)
        ) {
            record.students.forEach(
                (studentRecord) => {

                    const studentId =
                        studentRecord.studentId?._id ||
                        studentRecord.studentId;


                    if (!studentId) {
                        return;
                    }


                    savedAttendance[
                        studentId.toString()
                    ] =
                        studentRecord.status;
                }
            );
        }


        console.log(
            "Loaded saved attendance:",
            savedAttendance
        );


        setAttendance(
            savedAttendance
        );
    };


    // ==========================================
    // LOAD ADMIN STUDENTS
    // ==========================================

    const loadAdminStudents = async (
        classId,
        date = selectedDate
    ) => {
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
                await api.get("/students");


            const allStudents =
                response.data?.students || [];


            const classStudents =
                allStudents.filter(
                    (student) => {
                        const studentClassId =
                            student.classId?._id ||
                            student.classId;


                        return (
                            studentClassId?.toString() ===
                                classId.toString() &&
                            student.active !== false
                        );
                    }
                );


            setStudents(
                classStudents
            );


            loadExistingAttendance(
                classId,
                date,
                classStudents,
                attendanceRecords
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
    // CLASS CHANGE
    // ==========================================

    const handleClassChange = async (
        event
    ) => {
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


        if (isAdmin) {
            await loadAdminStudents(
                classId,
                selectedDate
            );
        }
    };


    // ==========================================
    // DATE CHANGE
    // ==========================================

    const handleDateChange = (
        event
    ) => {
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
            loadExistingAttendance(
                selectedClass,
                date,
                students,
                attendanceRecords
            );
        }
    };


    // ==========================================
    // CHANGE STUDENT STATUS
    // ==========================================

    const handleStatusChange = (
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

    const markAllPresent = () => {
        const updated = {};

        students.forEach(
            (student) => {
                updated[
                    student._id
                ] = "Present";
            }
        );

        setAttendance(
            updated
        );
    };


    // ==========================================
    // ALL ABSENT
    // ==========================================

    const markAllAbsent = () => {
        const updated = {};

        students.forEach(
            (student) => {
                updated[
                    student._id
                ] = "Absent";
            }
        );

        setAttendance(
            updated
        );
    };


    // ==========================================
    // REFRESH ATTENDANCE
    // ==========================================

    const refreshAttendanceRecords =
        async () => {

            const response =
                await api.get(
                    "/attendance"
                );


            const records =
                response.data
                    ?.attendance || [];


            setAttendanceRecords(
                records
            );


            loadExistingAttendance(
                selectedClass,
                selectedDate,
                students,
                records
            );
        };


    // ==========================================
    // MARK / UPDATE ATTENDANCE
    // ==========================================

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setError("");
        setMessage("");


        // ======================================
        // VALIDATION
        // ======================================

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


            // ==================================
            // CREATE STUDENT ATTENDANCE ARRAY
            // ==================================

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
            // UPDATE EXISTING ATTENDANCE
            // ==================================

            if (existingRecord) {

                console.log(
                    "Updating Attendance ID:",
                    existingRecord._id
                );


                const response =
                    await api.put(
                        `/attendance/${existingRecord._id}`,
                        payload
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
            // CREATE NEW ATTENDANCE
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
            // REFRESH
            // ==================================

            await refreshAttendanceRecords();

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
                EXISTING ATTENDANCE
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
                        Change the Present/Absent
                        status below and click
                        Update Attendance.
                    </span>

                </div>
            )}


            {/* ======================================
                STUDENTS
            ====================================== */}

            {selectedClass &&
                selectedDate && (

                    <div className="attendance-card">


                        {/* STUDENT HEADER */}

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


                                {/* STUDENT LIST */}

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


                                                    {/* STUDENT */}

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


                                                    {/* STATUS */}

                                                    <div className="status-buttons">


                                                        {/* PRESENT */}

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


                                                        {/* ABSENT */}

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


                                {/* SAVE / UPDATE */}

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