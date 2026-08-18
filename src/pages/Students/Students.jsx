import {
    useEffect,
    useRef,
    useState,
} from "react";

import { Navigate } from "react-router-dom";

import {
    FaEdit,
    FaPlus,
    FaTrash,
    FaTimes,
    FaFileExcel,
    FaUserGraduate,
    FaUsers,
    FaChevronDown,
    FaFilter,
} from "react-icons/fa";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import "./Students.css";


const Students = () => {

    const { user } = useAuth();

    const fileInputRef = useRef(null);


    // =========================================================
    // STATE
    // =========================================================

    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [uploadResult, setUploadResult] = useState(null);


    // =========================================================
    // CLASS FILTER
    // =========================================================

    const [selectedClassId, setSelectedClassId] =
        useState("all");


    const [form, setForm] = useState({
        rollNo: "",
        name: "",
        classId: "",
        active: true,
    });


    // =========================================================
    // LOAD DATA
    // =========================================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                studentsResponse,
                classesResponse,
            ] = await Promise.all([
                api.get("/students"),
                api.get("/classes"),
            ]);


            setStudents(
                studentsResponse.data.students || []
            );


            setClasses(
                classesResponse.data.classes || []
            );

        } catch (err) {

            console.error(
                "Students Load Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load students."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // LOAD ONLY FOR ADMIN
    // =========================================================

    useEffect(() => {

        if (user?.role === "admin") {

            loadData();

        }

    }, [user?.role]);


    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange = (event) => {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;


        setForm((previous) => ({
            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));

    };


    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {

        setForm({
            rollNo: "",
            name: "",
            classId: "",
            active: true,
        });

    };


    // =========================================================
    // OPEN ADD MODAL
    // =========================================================

    const openAddModal = () => {

        setEditingStudent(null);

        resetForm();

        setError("");

        setShowModal(true);

    };


    // =========================================================
    // OPEN EDIT MODAL
    // =========================================================

    const openEditModal = (student) => {

        setEditingStudent(student);

        setForm({

            rollNo:
                student.rollNo || "",

            name:
                student.name || "",

            classId:
                student.classId?._id ||
                student.classId ||
                "",

            active:
                student.active ?? true,

        });

        setError("");

        setShowModal(true);

    };


    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        setEditingStudent(null);

        resetForm();

    };


    // =========================================================
    // SAVE STUDENT
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        const rollNo =
            form.rollNo.trim();

        const name =
            form.name.trim();


        if (!rollNo) {

            setError(
                "Roll number is required."
            );

            return;
        }


        if (!name) {

            setError(
                "Student name is required."
            );

            return;
        }


        if (!form.classId) {

            setError(
                "Please select a class."
            );

            return;
        }


        try {

            setSaving(true);


            const payload = {

                rollNo,

                name,

                classId:
                    form.classId,

                active:
                    form.active,

            };


            if (editingStudent) {

                await api.put(
                    `/students/${editingStudent._id}`,
                    payload
                );

            } else {

                await api.post(
                    "/students",
                    payload
                );

            }


            setShowModal(false);

            setEditingStudent(null);

            resetForm();

            await loadData();

        } catch (err) {

            console.error(
                "Save Student Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to save student."
            );

        } finally {

            setSaving(false);

        }

    };


    // =========================================================
    // DELETE STUDENT
    // =========================================================

    const handleDelete = async (student) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to delete ${student.name}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setError("");

            await api.delete(
                `/students/${student._id}`
            );

            await loadData();

        } catch (err) {

            console.error(
                "Delete Student Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to delete student."
            );

        }

    };


    // =========================================================
    // FILE PICKER
    // =========================================================

    const openFilePicker = () => {

        setError("");

        setUploadResult(null);


        if (fileInputRef.current) {

            fileInputRef.current.click();

        }

    };


    // =========================================================
    // EXCEL UPLOAD
    // =========================================================

    const handleExcelUpload = async (event) => {

        const file =
            event.target.files?.[0];


        event.target.value = "";


        if (!file) {
            return;
        }


        // =====================================================
        // FILE TYPE
        // =====================================================

        const fileName =
            file.name.toLowerCase();


        const validExtension =
            fileName.endsWith(".xlsx") ||
            fileName.endsWith(".xls");


        if (!validExtension) {

            setError(
                "Please select an Excel file (.xlsx or .xls)."
            );

            return;
        }


        // =====================================================
        // FILE SIZE
        // =====================================================

        if (file.size > 5 * 1024 * 1024) {

            setError(
                "Excel file must be smaller than 5 MB."
            );

            return;
        }


        try {

            setUploading(true);

            setError("");

            setUploadResult(null);


            const formData =
                new FormData();


            formData.append(
                "file",
                file
            );


            const response =
                await api.post(
                    "/students/bulk",
                    formData
                );


            setUploadResult(
                response.data
            );


            await loadData();

        } catch (err) {

            console.error(
                "Excel Upload Error:",
                err
            );


            const responseData =
                err.response?.data;


            setError(
                responseData?.message ||
                "Unable to upload Excel file."
            );


            if (responseData) {

                setUploadResult(
                    responseData
                );

            }

        } finally {

            setUploading(false);

        }

    };


    // =========================================================
    // REDIRECT TEACHER
    // =========================================================

    if (user?.role === "teacher") {

        return (
            <Navigate
                to="/my-class"
                replace
            />
        );

    }


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="students-page">

                <div className="students-loading">

                    <div className="students-loading-spinner" />

                    <span>
                        Loading students...
                    </span>

                </div>

            </div>

        );

    }


    // =========================================================
    // FILTER STUDENTS
    // =========================================================

    const filteredStudents =
        selectedClassId === "all"
            ? students
            : students.filter((student) => {

                const studentClassId =
                    student.classId?._id ||
                    student.classId;

                return (
                    studentClassId &&
                    studentClassId.toString() ===
                        selectedClassId.toString()
                );

            });


    // =========================================================
    // GROUP FILTERED STUDENTS BY CLASS
    // =========================================================

    const groupedStudents = [];


    classes.forEach((classItem) => {

        const classStudents =
            filteredStudents.filter((student) => {

                const studentClassId =
                    student.classId?._id ||
                    student.classId;

                return (
                    studentClassId &&
                    studentClassId.toString() ===
                        classItem._id.toString()
                );

            });


        if (classStudents.length > 0) {

            groupedStudents.push({

                classId:
                    classItem._id,

                className:
                    classItem.className,

                students:
                    classStudents,

            });

        }

    });


    // =========================================================
    // UNASSIGNED STUDENTS
    // =========================================================

    const unassignedStudents =
        filteredStudents.filter((student) => {

            const studentClassId =
                student.classId?._id ||
                student.classId;

            if (!studentClassId) {
                return true;
            }

            return !classes.some(
                (classItem) =>
                    classItem._id.toString() ===
                    studentClassId.toString()
            );

        });


    if (
        unassignedStudents.length > 0 &&
        selectedClassId === "all"
    ) {

        groupedStudents.push({

            classId: "unassigned",

            className: "Unassigned Students",

            students:
                unassignedStudents,

        });

    }


    // =========================================================
    // SORT STUDENTS INSIDE EACH CLASS
    // =========================================================

    const sortStudentsByRoll = (studentList) => {

        return [...studentList].sort((a, b) => {

            const aRoll =
                String(a.rollNo ?? "").trim();

            const bRoll =
                String(b.rollNo ?? "").trim();


            const aNumber =
                Number(aRoll);

            const bNumber =
                Number(bRoll);


            const aIsNumber =
                aRoll !== "" &&
                Number.isFinite(aNumber);

            const bIsNumber =
                bRoll !== "" &&
                Number.isFinite(bNumber);


            if (aIsNumber && bIsNumber) {

                return aNumber - bNumber;

            }


            if (aIsNumber) {

                return -1;

            }


            if (bIsNumber) {

                return 1;

            }


            return aRoll.localeCompare(
                bRoll,
                undefined,
                {
                    numeric: true,
                    sensitivity: "base",
                }
            );

        });

    };


    groupedStudents.forEach((group) => {

        group.students =
            sortStudentsByRoll(
                group.students
            );

    });


    // =========================================================
    // FILTERED TOTALS
    // =========================================================

    const activeStudents =
        filteredStudents.filter(
            (student) =>
                student.active !== false
        ).length;

    const inactiveStudents =
        filteredStudents.length -
        activeStudents;


    // =========================================================
    // FILTERED CLASS COUNT
    // =========================================================

    const displayedClassCount =
        groupedStudents.length;


    // =========================================================
    // SELECTED CLASS NAME
    // =========================================================

    const selectedClass =
        classes.find(
            (classItem) =>
                classItem._id.toString() ===
                selectedClassId.toString()
        );


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="students-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="students-header">

                <div className="students-heading">

                    <p className="students-label">
                        ADMINISTRATION
                    </p>

                    <h1>
                        Students
                    </h1>

                    <p className="students-description">
                        Manage students and their class assignments.
                    </p>

                </div>


                <div className="students-actions">

                    <button
                        type="button"
                        className="import-excel-button"
                        onClick={openFilePicker}
                        disabled={uploading}
                    >

                        <FaFileExcel />

                        <span>
                            {uploading
                                ? "Uploading..."
                                : "Import Excel"}
                        </span>

                    </button>


                    <button
                        type="button"
                        className="add-student-button"
                        onClick={openAddModal}
                        disabled={uploading}
                    >

                        <FaPlus />

                        <span>
                            Add Student
                        </span>

                    </button>

                </div>


                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="students-file-input"
                    onChange={handleExcelUpload}
                />

            </div>


            {/* =================================================
                CLASS FILTER
            ================================================= */}

            <div className="students-filter-card">

                <div className="students-filter-heading">

                    <div className="students-filter-icon">
                        <FaFilter />
                    </div>

                    <div>

                        <h3>
                            Filter Students
                        </h3>

                        <p>
                            Choose a class to view only its students.
                        </p>

                    </div>

                </div>


                <div className="students-filter-control">

                    <label htmlFor="student-class-filter">
                        Class
                    </label>

                    <div className="students-filter-select-wrapper">

                        <select
                            id="student-class-filter"
                            value={selectedClassId}
                            onChange={(event) =>
                                setSelectedClassId(
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
                                            classItem.className
                                        }

                                    </option>

                                )
                            )}

                        </select>

                        <FaChevronDown
                            className="students-filter-chevron"
                        />

                    </div>

                </div>


                {selectedClassId !== "all" && (

                    <button
                        type="button"
                        className="clear-student-filter"
                        onClick={() =>
                            setSelectedClassId("all")
                        }
                    >

                        Clear Filter

                    </button>

                )}

            </div>


            {/* =================================================
                OVERVIEW
            ================================================= */}

            <div className="students-overview">

                <div className="student-overview-item">

                    <div className="overview-icon total">
                        <FaUsers />
                    </div>

                    <div>

                        <span>
                            Total Students
                        </span>

                        <strong>
                            {filteredStudents.length}
                        </strong>

                    </div>

                </div>


                <div className="student-overview-item">

                    <div className="overview-icon active">
                        <span className="overview-dot" />
                    </div>

                    <div>

                        <span>
                            Active
                        </span>

                        <strong>
                            {activeStudents}
                        </strong>

                    </div>

                </div>


                <div className="student-overview-item">

                    <div className="overview-icon inactive">
                        <span className="overview-dot" />
                    </div>

                    <div>

                        <span>
                            Inactive
                        </span>

                        <strong>
                            {inactiveStudents}
                        </strong>

                    </div>

                </div>


                <div className="student-overview-item">

                    <div className="overview-icon classes">
                        <FaUsers />
                    </div>

                    <div>

                        <span>
                            {selectedClassId === "all"
                                ? "Classes"
                                : "Selected Class"}
                        </span>

                        <strong>
                            {displayedClassCount}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                ACTIVE FILTER INDICATOR
            ================================================= */}

            {selectedClassId !== "all" && (

                <div className="students-active-filter">

                    <div className="students-active-filter-left">

                        <span className="students-active-filter-dot" />

                        <span>
                            Showing students from
                        </span>

                        <strong>
                            {selectedClass?.className ||
                                "Selected Class"}
                        </strong>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            setSelectedClassId("all")
                        }
                    >
                        Show All Classes
                    </button>

                </div>

            )}


            {/* =================================================
                UPLOAD RESULT
            ================================================= */}

            {uploadResult?.success && (

                <div className="students-upload-success">

                    <div className="students-upload-title">

                        <FaFileExcel />

                        <strong>
                            Excel upload completed successfully.
                        </strong>

                    </div>


                    {uploadResult.summary && (

                        <div className="students-upload-summary">

                            <div>
                                <span>
                                    Total
                                </span>

                                <strong>
                                    {
                                        uploadResult
                                            .summary
                                            .total
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Created
                                </span>

                                <strong>
                                    {
                                        uploadResult
                                            .summary
                                            .created
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Updated
                                </span>

                                <strong>
                                    {
                                        uploadResult
                                            .summary
                                            .updated
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Unchanged
                                </span>

                                <strong>
                                    {
                                        uploadResult
                                            .summary
                                            .unchanged
                                    }
                                </strong>
                            </div>

                        </div>

                    )}

                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="students-error">

                    {error}

                </div>

            )}


            {/* =================================================
                STUDENT CONTENT
            ================================================= */}

            {students.length === 0 ? (

                <div className="students-card">

                    <div className="students-empty">

                        <div className="students-empty-icon">
                            <FaUserGraduate />
                        </div>

                        <h3>
                            No students found
                        </h3>

                        <p>
                            Add your first student to get started.
                        </p>

                        <button
                            type="button"
                            onClick={openAddModal}
                        >

                            <FaPlus />

                            Add Student

                        </button>

                    </div>

                </div>

            ) : filteredStudents.length === 0 ? (

                <div className="students-card">

                    <div className="students-empty">

                        <div className="students-empty-icon">
                            <FaUsers />
                        </div>

                        <h3>
                            No students in this class
                        </h3>

                        <p>
                            There are currently no students
                            assigned to{" "}
                            <strong>
                                {selectedClass?.className ||
                                    "this class"}
                            </strong>.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setSelectedClassId("all")
                            }
                        >

                            <FaUsers />

                            Show All Classes

                        </button>

                    </div>

                </div>

            ) : (

                <div className="student-class-groups">

                    {groupedStudents.map(
                        (group) => {

                            const classActive =
                                group.students.filter(
                                    (student) =>
                                        student.active !== false
                                ).length;

                            const classInactive =
                                group.students.length -
                                classActive;


                            return (

                                <section
                                    className="student-class-section"
                                    key={
                                        group.classId
                                    }
                                >

                                    <div className="student-class-header">

                                        <div className="student-class-title">

                                            <div className="student-class-icon">
                                                <FaUsers />
                                            </div>

                                            <div>

                                                <h2>
                                                    {
                                                        group.className
                                                    }
                                                </h2>

                                                <p>
                                                    Manage students
                                                    assigned to this class.
                                                </p>

                                            </div>

                                        </div>


                                        <div className="student-class-stats">

                                            <span className="class-student-count">

                                                <strong>
                                                    {
                                                        group.students.length
                                                    }
                                                </strong>

                                                {
                                                    group.students.length === 1
                                                        ? " Student"
                                                        : " Students"
                                                }

                                            </span>


                                            {classActive > 0 && (

                                                <span className="class-active-count">

                                                    <span className="class-status-dot" />

                                                    {classActive} Active

                                                </span>

                                            )}


                                            {classInactive > 0 && (

                                                <span className="class-inactive-count">

                                                    {classInactive} Inactive

                                                </span>

                                            )}

                                        </div>

                                    </div>


                                    <div className="students-card">

                                        <div className="students-table-wrapper">

                                            <table className="students-table">

                                                <thead>

                                                    <tr>

                                                        <th>
                                                            Roll No
                                                        </th>

                                                        <th>
                                                            Student
                                                        </th>

                                                        <th>
                                                            Status
                                                        </th>

                                                        <th>
                                                            Actions
                                                        </th>

                                                    </tr>

                                                </thead>


                                                <tbody>

                                                    {group.students.map(
                                                        (student) => (

                                                            <tr
                                                                key={
                                                                    student._id
                                                                }
                                                            >

                                                                <td>

                                                                    <span className="student-roll-badge">
                                                                        {
                                                                            student.rollNo
                                                                        }
                                                                    </span>

                                                                </td>


                                                                <td>

                                                                    <div className="student-name-cell">

                                                                        <div className="student-list-avatar">

                                                                            {
                                                                                student.name
                                                                                    ?.charAt(0)
                                                                                    ?.toUpperCase() ||
                                                                                "S"
                                                                            }

                                                                        </div>

                                                                        <strong>
                                                                            {
                                                                                student.name
                                                                            }
                                                                        </strong>

                                                                    </div>

                                                                </td>


                                                                <td>

                                                                    <span
                                                                        className={
                                                                            student.active
                                                                                ? "student-status-badge active"
                                                                                : "student-status-badge inactive"
                                                                        }
                                                                    >

                                                                        <span className="student-status-dot" />

                                                                        {student.active
                                                                            ? "Active"
                                                                            : "Inactive"}

                                                                    </span>

                                                                </td>


                                                                <td>

                                                                    <div className="student-action-buttons">

                                                                        <button
                                                                            type="button"
                                                                            className="student-edit-button"
                                                                            title="Edit student"
                                                                            aria-label="Edit student"
                                                                            onClick={() =>
                                                                                openEditModal(
                                                                                    student
                                                                                )
                                                                            }
                                                                        >

                                                                            <FaEdit />

                                                                        </button>


                                                                        <button
                                                                            type="button"
                                                                            className="student-delete-button"
                                                                            title="Delete student"
                                                                            aria-label="Delete student"
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    student
                                                                                )
                                                                            }
                                                                        >

                                                                            <FaTrash />

                                                                        </button>

                                                                    </div>

                                                                </td>

                                                            </tr>

                                                        )
                                                    )}

                                                </tbody>

                                            </table>

                                        </div>

                                    </div>

                                </section>

                            );

                        }
                    )}

                </div>

            )}


            {/* =================================================
                MODAL
            ================================================= */}

            {showModal && (

                <div className="student-modal-overlay">

                    <div
                        className="student-modal"
                        role="dialog"
                        aria-modal="true"
                    >

                        <div className="student-modal-header">

                            <div>

                                <p className="student-modal-label">
                                    {editingStudent
                                        ? "UPDATE STUDENT"
                                        : "NEW STUDENT"}
                                </p>

                                <h2>
                                    {editingStudent
                                        ? "Edit Student"
                                        : "Add Student"}
                                </h2>

                                <p>
                                    {editingStudent
                                        ? "Update student information and class assignment."
                                        : "Create a new student record."}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="student-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Close modal"
                            >

                                <FaTimes />

                            </button>

                        </div>


                        <form
                            className="student-form"
                            onSubmit={handleSubmit}
                        >

                            <label>

                                Roll Number

                                <input
                                    type="text"
                                    name="rollNo"
                                    value={
                                        form.rollNo
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Example: 1"
                                    required
                                />

                            </label>


                            <label>

                                Student Name

                                <input
                                    type="text"
                                    name="name"
                                    value={
                                        form.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter student name"
                                    required
                                />

                            </label>


                            <label>

                                Class

                                <select
                                    name="classId"
                                    value={
                                        form.classId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
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

                            </label>


                            {editingStudent && (

                                <label className="student-active-checkbox">

                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={
                                            form.active
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <span>
                                        Student is active
                                    </span>

                                </label>

                            )}


                            <div className="student-modal-actions">

                                <button
                                    type="button"
                                    className="student-cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="student-save-button"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving..."
                                        : editingStudent
                                            ? "Update Student"
                                            : "Create Student"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

};


export default Students;