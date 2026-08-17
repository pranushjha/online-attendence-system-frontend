import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";

import {
    FaEdit,
    FaPlus,
    FaTrash,
    FaTimes,
    FaFileExcel,
} from "react-icons/fa";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import "./Students.css";


const Students = () => {

    const { user } = useAuth();

    const fileInputRef = useRef(null);


    // ==========================================
    // STATE
    // ==========================================

    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const [saving, setSaving] = useState(false);

    const [uploading, setUploading] = useState(false);

    const [uploadResult, setUploadResult] = useState(null);

    const [form, setForm] = useState({
        rollNo: "",
        name: "",
        classId: "",
        active: true,
    });


    // ==========================================
    // REDIRECT TEACHER
    // ==========================================
    //
    // Students page is ADMIN ONLY.
    //
    // Teachers should use /my-class.
    //
    // This also prevents a teacher from accidentally
    // calling GET /api/classes, which is admin-only.
    // ==========================================

    if (user?.role === "teacher") {
        return <Navigate to="/my-class" replace />;
    }


    // ==========================================
    // LOAD STUDENTS + CLASSES
    // ==========================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            // ==========================================
            // ADMIN ONLY
            // ==========================================

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


    // ==========================================
    // LOAD DATA
    // ==========================================

    useEffect(() => {

        if (user?.role === "admin") {
            loadData();
        }

    }, [user?.role]);


    // ==========================================
    // FORM CHANGE
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked,
        } = e.target;


        setForm((previous) => ({
            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));

    };


    // ==========================================
    // OPEN ADD MODAL
    // ==========================================

    const openAddModal = () => {

        setEditingStudent(null);


        setForm({
            rollNo: "",
            name: "",
            classId: "",
            active: true,
        });


        setError("");
        setShowModal(true);

    };


    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================

    const openEditModal = (student) => {

        setEditingStudent(student);


        setForm({
            rollNo: student.rollNo || "",

            name: student.name || "",

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


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const closeModal = () => {

        if (saving) {
            return;
        }


        setShowModal(false);
        setEditingStudent(null);

    };


    // ==========================================
    // SAVE STUDENT
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        try {

            setSaving(true);
            setError("");


            // ==========================================
            // VALIDATION
            // ==========================================

            if (!form.rollNo.trim()) {

                setError(
                    "Roll number is required."
                );

                return;
            }


            if (!form.name.trim()) {

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


            // ==========================================
            // PAYLOAD
            // ==========================================

            const payload = {

                rollNo:
                    form.rollNo.trim(),

                name:
                    form.name.trim(),

                classId:
                    form.classId,

                active:
                    form.active,
            };


            // ==========================================
            // UPDATE
            // ==========================================

            if (editingStudent) {

                await api.put(
                    `/students/${editingStudent._id}`,
                    payload
                );

            }

            // ==========================================
            // CREATE
            // ==========================================

            else {

                await api.post(
                    "/students",
                    payload
                );

            }


            // ==========================================
            // CLOSE + REFRESH
            // ==========================================

            setShowModal(false);
            setEditingStudent(null);

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


    // ==========================================
    // DELETE STUDENT
    // ==========================================

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


    // ==========================================
    // OPEN FILE PICKER
    // ==========================================

    const openFilePicker = () => {

        setError("");
        setUploadResult(null);


        if (fileInputRef.current) {

            fileInputRef.current.click();

        }

    };


    // ==========================================
    // BULK EXCEL UPLOAD
    // ==========================================

    const handleExcelUpload = async (e) => {

        const file =
            e.target.files?.[0];


        // Reset input so the same file can
        // be selected again.

        e.target.value = "";


        if (!file) {
            return;
        }


        // ==========================================
        // FILE TYPE CHECK
        // ==========================================

        const validExtension =
            file.name
                .toLowerCase()
                .endsWith(".xlsx") ||
            file.name
                .toLowerCase()
                .endsWith(".xls");


        if (!validExtension) {

            setError(
                "Please select an Excel file (.xlsx or .xls)."
            );

            return;
        }


        // ==========================================
        // FILE SIZE CHECK
        // ==========================================

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


            // ==========================================
            // CREATE FORM DATA
            // ==========================================

            const formData =
                new FormData();


            formData.append(
                "file",
                file
            );


            // ==========================================
            // UPLOAD EXCEL
            // ==========================================

            const response =
                await api.post(
                    "/students/bulk",
                    formData
                );


            // ==========================================
            // SAVE RESULT
            // ==========================================

            setUploadResult(
                response.data
            );


            // ==========================================
            // REFRESH STUDENTS
            // ==========================================

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


            // Keep detailed validation response
            // from backend.

            if (responseData) {

                setUploadResult(
                    responseData
                );

            }

        } finally {

            setUploading(false);

        }

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="students-page">

                <div className="page-loading">

                    Loading students...

                </div>

            </div>
        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="students-page">


            {/* ======================================
                HEADER
            ====================================== */}

            <div className="students-header">

                <div>

                    <p className="page-label">
                        ADMINISTRATION
                    </p>


                    <h1>
                        Students
                    </h1>


                    <p className="page-description">
                        Manage students and their class assignments.
                    </p>

                </div>


                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                >

                    {/* ==================================
                        IMPORT EXCEL
                    ================================== */}

                    <button
                        className="add-student-button"
                        onClick={openFilePicker}
                        disabled={uploading}
                    >

                        <FaFileExcel />

                        {uploading
                            ? "Uploading..."
                            : "Import Excel"}

                    </button>


                    {/* ==================================
                        ADD STUDENT
                    ================================== */}

                    <button
                        className="add-student-button"
                        onClick={openAddModal}
                        disabled={uploading}
                    >

                        <FaPlus />

                        Add Student

                    </button>

                </div>


                {/* ==================================
                    HIDDEN FILE INPUT
                ================================== */}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{
                        display: "none",
                    }}
                    onChange={
                        handleExcelUpload
                    }
                />

            </div>


            {/* ======================================
                EXCEL SUCCESS / RESULT
            ====================================== */}

            {uploadResult?.success && (

                <div
                    style={{
                        marginBottom: "20px",
                        padding: "18px",
                        background: "#ecfdf5",
                        border: "1px solid #a7f3d0",
                        borderRadius: "10px",
                        color: "#065f46",
                    }}
                >

                    <strong>
                        Excel upload completed successfully.
                    </strong>


                    {uploadResult.summary && (

                        <div
                            style={{
                                display: "flex",
                                gap: "20px",
                                flexWrap: "wrap",
                                marginTop: "10px",
                            }}
                        >

                            <span>
                                Total:{" "}
                                <strong>
                                    {
                                        uploadResult
                                            .summary
                                            .total
                                    }
                                </strong>
                            </span>


                            <span>
                                Created:{" "}
                                <strong>
                                    {
                                        uploadResult
                                            .summary
                                            .created
                                    }
                                </strong>
                            </span>


                            <span>
                                Updated:{" "}
                                <strong>
                                    {
                                        uploadResult
                                            .summary
                                            .updated
                                    }
                                </strong>
                            </span>


                            <span>
                                Unchanged:{" "}
                                <strong>
                                    {
                                        uploadResult
                                            .summary
                                            .unchanged
                                    }
                                </strong>
                            </span>

                        </div>

                    )}

                </div>

            )}


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (

                <div className="students-error">
                    {error}
                </div>

            )}


            {/* ======================================
                STUDENTS TABLE
            ====================================== */}

            <div className="students-card">

                {students.length === 0 ? (

                    <div className="empty-students">

                        <h3>
                            No students found
                        </h3>

                        <p>
                            Add your first student to get started.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="students-table">

                            <thead>

                                <tr>

                                    <th>
                                        Roll No
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Class
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

                                {students.map(
                                    (student) => (

                                        <tr
                                            key={
                                                student._id
                                            }
                                        >

                                            {/* ROLL */}

                                            <td>

                                                <strong>
                                                    {
                                                        student.rollNo
                                                    }
                                                </strong>

                                            </td>


                                            {/* NAME */}

                                            <td>
                                                {
                                                    student.name
                                                }
                                            </td>


                                            {/* CLASS */}

                                            <td>

                                                {student.classId
                                                    ? student.classId.className
                                                    : (
                                                        <span className="not-assigned">
                                                            —
                                                        </span>
                                                    )}

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={
                                                        student.active
                                                            ? "status-badge active"
                                                            : "status-badge inactive"
                                                    }
                                                >

                                                    {student.active
                                                        ? "Active"
                                                        : "Inactive"}

                                                </span>

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="action-buttons">

                                                    <button
                                                        className="edit-button"
                                                        title="Edit student"
                                                        onClick={() =>
                                                            openEditModal(
                                                                student
                                                            )
                                                        }
                                                    >

                                                        <FaEdit />

                                                    </button>


                                                    <button
                                                        className="delete-button"
                                                        title="Delete student"
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

                )}

            </div>


            {/* ======================================
                ADD / EDIT MODAL
            ====================================== */}

            {showModal && (

                <div className="modal-overlay">

                    <div className="student-modal">

                        {/* MODAL HEADER */}

                        <div className="modal-header">

                            <div>

                                <h2>

                                    {editingStudent
                                        ? "Edit Student"
                                        : "Add Student"}

                                </h2>


                                <p>

                                    {editingStudent
                                        ? "Update student information."
                                        : "Create a new student."}

                                </p>

                            </div>


                            <button
                                className="close-modal"
                                onClick={closeModal}
                                disabled={saving}
                            >

                                <FaTimes />

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            className="student-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* ROLL NUMBER */}

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
                                    placeholder="Example: BCA002"
                                    required
                                />

                            </label>


                            {/* NAME */}

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


                            {/* CLASS */}

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


                            {/* ACTIVE */}

                            {editingStudent && (

                                <label
                                    className="active-checkbox"
                                >

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


                            {/* MODAL ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="save-button"
                                    disabled={
                                        saving
                                    }
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