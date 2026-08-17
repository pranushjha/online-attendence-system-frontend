import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    FaPlus,
    FaFileExcel,
    FaTimes,
    FaEdit,
    FaTrash,
} from "react-icons/fa";

import api from "../../services/api";

import "./MyClass.css";


const MyClass = () => {

    const fileInputRef =
        useRef(null);


    // ==========================================
    // STATE
    // ==========================================

    const [classData, setClassData] =
        useState(null);

    const [students, setStudents] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [uploading, setUploading] =
        useState(false);

    const [uploadResult, setUploadResult] =
        useState(null);


    // ==========================================
    // ADD / EDIT MODAL
    // ==========================================

    const [showModal, setShowModal] =
        useState(false);

    const [editingStudent, setEditingStudent] =
        useState(null);

    const [saving, setSaving] =
        useState(false);


    const [form, setForm] =
        useState({
            rollNo: "",
            name: "",
            active: true,
        });


    // ==========================================
    // DELETE MODAL
    // ==========================================

    const [deletingStudent, setDeletingStudent] =
        useState(null);

    const [deleting, setDeleting] =
        useState(false);


    // ==========================================
    // NORMALIZE STUDENT
    // ==========================================

    const normalizeStudent = (student) => {

        let active;


        // ======================================
        // USE BACKEND `active` FIELD
        // ======================================

        if (
            typeof student.active === "boolean"
        ) {

            active =
                student.active;

        } else if (
            typeof student.active === "string"
        ) {

            active =
                student.active
                    .trim()
                    .toLowerCase() ===
                "true";

        } else {

            // ==================================
            // FALLBACK FOR OLD API RESPONSE
            // ==================================

            if (
                typeof student.status === "string"
            ) {

                active =
                    student.status
                        .trim()
                        .toLowerCase() ===
                    "active";

            } else {

                active = true;
            }
        }


        return {
            ...student,
            active,
        };
    };


    // ==========================================
    // LOAD MY CLASS
    // ==========================================

    const loadMyClass = async () => {

        try {

            setLoading(true);
            setError("");


            const response =
                await api.get(
                    "/classes/my-class"
                );


            const classResponse =
                response.data.class;


            const studentResponse =
                response.data.students || [];


            setClassData(
                classResponse
            );


            setStudents(
                studentResponse.map(
                    normalizeStudent
                )
            );

        } catch (err) {

            console.error(
                "My Class Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to load your class."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadMyClass();

    }, []);


    // ==========================================
    // OPEN FILE PICKER
    // ==========================================

    const openFilePicker = () => {

        setError("");
        setUploadResult(null);


        if (
            fileInputRef.current
        ) {

            fileInputRef.current.click();
        }
    };


    // ==========================================
    // EXCEL UPLOAD
    // ==========================================

    const handleExcelUpload = async (
        e
    ) => {

        const file =
            e.target.files?.[0];


        e.target.value = "";


        if (!file) {
            return;
        }


        // ==========================================
        // FILE TYPE
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
        // FILE SIZE
        // ==========================================

        if (
            file.size >
            5 * 1024 * 1024
        ) {

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


            await loadMyClass();

        } catch (err) {

            console.error(
                "Excel Upload Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to upload Excel file."
            );


            if (
                err.response?.data
            ) {

                setUploadResult(
                    err.response.data
                );
            }

        } finally {

            setUploading(false);
        }
    };


    // ==========================================
    // FORM CHANGE
    // ==========================================

    const handleChange = (
        e
    ) => {

        const {
            name,
            value,
            type,
            checked,
        } = e.target;


        setForm(
            (previous) => ({

                ...previous,

                [name]:
                    type === "checkbox"
                        ? Boolean(checked)
                        : value,
            })
        );
    };


    // ==========================================
    // OPEN ADD MODAL
    // ==========================================

    const openAddModal = () => {

        setEditingStudent(null);


        setForm({

            rollNo: "",

            name: "",

            active: true,
        });


        setError("");

        setShowModal(true);
    };


    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================

    const openEditModal = (
        student
    ) => {

        console.log(
            "Editing student:",
            student
        );


        setEditingStudent(
            student
        );


        setForm({

            rollNo:
                String(
                    student.rollNo ?? ""
                ),

            name:
                String(
                    student.name ?? ""
                ),

            active:
                student.active === true,
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

    const handleSubmit = async (
        e
    ) => {

        e.preventDefault();


        if (saving) {
            return;
        }


        try {

            setSaving(true);

            setError("");


            if (
                !classData?._id
            ) {

                setError(
                    "Your class information is unavailable."
                );

                return;
            }


            const rollNo =
                String(
                    form.rollNo
                ).trim();

            const name =
                String(
                    form.name
                ).trim();


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


            // ======================================
            // EDIT STUDENT
            // ======================================

            if (
                editingStudent
            ) {

                const payload = {

                    rollNo,

                    name,

                    classId:
                        classData._id,

                    active:
                        Boolean(
                            form.active
                        ),
                };


                console.log(
                    "Update Student Payload:",
                    payload
                );


                const response =
                    await api.put(

                        `/students/${editingStudent._id}`,

                        payload
                    );


                console.log(
                    "Update Student Response:",
                    response.data
                );


                const updatedStudent =
                    normalizeStudent(
                        response.data.student
                    );


                // ==================================
                // UPDATE UI IMMEDIATELY
                // ==================================

                setStudents(
                    (previous) =>
                        previous.map(
                            (student) =>

                                student._id ===
                                updatedStudent._id

                                    ? {
                                          ...student,
                                          ...updatedStudent,
                                      }

                                    : student
                        )
                );

            }

            // ======================================
            // CREATE STUDENT
            // ======================================

            else {

                const payload = {

                    rollNo,

                    name,

                    classId:
                        classData._id,

                    active: true,
                };


                const response =
                    await api.post(
                        "/students",
                        payload
                    );


                const createdStudent =
                    response.data.student;


                // ==================================
                // ADD TO CURRENT LIST
                // ==================================

                if (createdStudent) {

                    setStudents(
                        (previous) => [

                            ...previous,

                            normalizeStudent(
                                createdStudent
                            ),
                        ]
                    );

                } else {

                    await loadMyClass();
                }
            }


            // ==========================================
            // CLOSE MODAL
            // ==========================================

            setShowModal(false);

            setEditingStudent(null);


        } catch (err) {

            console.error(
                "Save Student Error:",
                err
            );


            console.error(
                "Server Response:",
                err.response?.data
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
    // OPEN DELETE CONFIRMATION
    // ==========================================

    const openDeleteModal = (
        student
    ) => {

        setError("");

        setDeletingStudent(
            student
        );
    };


    // ==========================================
    // CANCEL DELETE
    // ==========================================

    const cancelDelete = () => {

        if (deleting) {
            return;
        }

        setDeletingStudent(null);
    };


    // ==========================================
    // DELETE STUDENT
    // ==========================================

    const handleDelete = async () => {

        if (
            !deletingStudent ||
            deleting
        ) {
            return;
        }


        try {

            setDeleting(true);

            setError("");


            await api.delete(
                `/students/${deletingStudent._id}`
            );


            setStudents(
                (previous) =>
                    previous.filter(
                        (student) =>
                            student._id !==
                            deletingStudent._id
                    )
            );


            setDeletingStudent(
                null
            );

        } catch (err) {

            console.error(
                "Delete Student Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to delete student."
            );

        } finally {

            setDeleting(false);
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="my-class-page">

                <div className="my-class-loading">
                    Loading class information...
                </div>

            </div>
        );
    }


    // ==========================================
    // ERROR WITHOUT CLASS
    // ==========================================

    if (
        error &&
        !classData
    ) {

        return (
            <div className="my-class-page">

                <h1>
                    My Class
                </h1>


                <div className="my-class-error">
                    {error}
                </div>

            </div>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="my-class-page">


            {/* ======================================
                HEADER
            ====================================== */}

            <div className="my-class-header">

                <div>

                    <div className="my-class-label">
                        MY CLASS
                    </div>


                    <h1>
                        {classData?.className}
                    </h1>


                    <p>
                        Your assigned class and students.
                    </p>

                </div>


                <div className="my-class-actions">

                    {/* IMPORT EXCEL */}

                    <button
                        className="my-class-button"
                        onClick={
                            openFilePicker
                        }
                        disabled={
                            uploading
                        }
                    >

                        <FaFileExcel />

                        {uploading
                            ? "Uploading..."
                            : "Import Excel"}

                    </button>


                    {/* ADD STUDENT */}

                    <button
                        className="my-class-button"
                        onClick={
                            openAddModal
                        }
                        disabled={
                            uploading
                        }
                    >

                        <FaPlus />

                        Add Student

                    </button>

                </div>


                {/* HIDDEN FILE INPUT */}

                <input
                    ref={
                        fileInputRef
                    }
                    type="file"
                    accept=".xlsx,.xls"
                    style={{
                        display:
                            "none",
                    }}
                    onChange={
                        handleExcelUpload
                    }
                />

            </div>


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (

                <div className="my-class-error">
                    {error}
                </div>

            )}


            {/* ======================================
                UPLOAD RESULT
            ====================================== */}

            {uploadResult?.success && (

                <div className="upload-success">

                    <strong>
                        Excel upload completed successfully.
                    </strong>


                    {uploadResult.summary && (

                        <div className="upload-summary">

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
                CLASS INFORMATION
            ====================================== */}

            <div className="class-information">

                <h2>
                    Class Information
                </h2>


                <p>

                    <strong>
                        Class:
                    </strong>{" "}

                    {classData?.className}

                </p>


                <p>

                    <strong>
                        Teacher:
                    </strong>{" "}

                    {
                        classData
                            ?.classTeacher
                            ?.name ||
                        "You"
                    }

                </p>


                <p>

                    <strong>
                        Total Students:
                    </strong>{" "}

                    {students.length}

                </p>

            </div>


            {/* ======================================
                STUDENTS
            ====================================== */}

            <div className="my-class-students">

                <div className="students-section-header">

                    <h2>
                        Students
                    </h2>


                    <span>
                        {students.length} students
                    </span>

                </div>


                {students.length === 0 ? (

                    <div className="empty-class">

                        <h3>
                            No students found
                        </h3>


                        <p>
                            Add a student manually or
                            import students using Excel.
                        </p>

                    </div>

                ) : (

                    <div className="my-class-table-wrapper">

                        <table className="my-class-table">

                            <thead>

                                <tr>

                                    <th>
                                        Roll No
                                    </th>

                                    <th>
                                        Name
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

                                            <td>

                                                <strong>
                                                    {
                                                        student.rollNo
                                                    }
                                                </strong>

                                            </td>


                                            <td>
                                                {
                                                    student.name
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        student.active === true

                                                            ? "student-status active"

                                                            : "student-status inactive"
                                                    }
                                                >

                                                    {student.active === true
                                                        ? "Active"
                                                        : "Inactive"}

                                                </span>

                                            </td>


                                            <td>

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        gap:
                                                            "8px",
                                                        alignItems:
                                                            "center",
                                                    }}
                                                >

                                                    {/* EDIT */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                student
                                                            )
                                                        }
                                                        disabled={
                                                            uploading ||
                                                            saving ||
                                                            deleting
                                                        }
                                                        title="Edit student"
                                                        style={{
                                                            width:
                                                                "38px",
                                                            height:
                                                                "38px",
                                                            border:
                                                                "1px solid #e2e8f0",
                                                            borderRadius:
                                                                "8px",
                                                            background:
                                                                "white",
                                                            color:
                                                                "#4f46e5",
                                                            cursor:
                                                                "pointer",
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                        }}
                                                    >

                                                        <FaEdit />

                                                    </button>


                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                student
                                                            )
                                                        }
                                                        disabled={
                                                            uploading ||
                                                            saving ||
                                                            deleting
                                                        }
                                                        title="Delete student"
                                                        style={{
                                                            width:
                                                                "38px",
                                                            height:
                                                                "38px",
                                                            border:
                                                                "1px solid #fecaca",
                                                            borderRadius:
                                                                "8px",
                                                            background:
                                                                "white",
                                                            color:
                                                                "#dc2626",
                                                            cursor:
                                                                "pointer",
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                        }}
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

                <div className="my-class-modal-overlay">

                    <div className="my-class-modal">

                        <div className="my-class-modal-header">

                            <div>

                                <h2>

                                    {editingStudent
                                        ? "Edit Student"
                                        : "Add Student"}

                                </h2>


                                <p>

                                    {editingStudent
                                        ? "Update student details."
                                        : `Add a student to ${classData?.className}.`}

                                </p>

                            </div>


                            <button
                                type="button"
                                className="my-class-close"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    saving
                                }
                            >

                                <FaTimes />

                            </button>

                        </div>


                        <form
                            className="my-class-form"
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
                                    placeholder="Example: 001"
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

                            <div className="assigned-class-field">

                                <span>
                                    Class
                                </span>

                                <strong>
                                    {
                                        classData?.className
                                    }
                                </strong>

                            </div>


                            {/* ACTIVE */}

                            {editingStudent && (

                                <label
                                    style={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        gap:
                                            "10px",
                                        cursor:
                                            "pointer",
                                    }}
                                >

                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={
                                            Boolean(
                                                form.active
                                            )
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        style={{
                                            width:
                                                "18px",
                                            height:
                                                "18px",
                                        }}
                                    />

                                    <span>
                                        Active Student
                                    </span>

                                </label>

                            )}


                            {/* ACTIONS */}

                            <div className="my-class-modal-actions">

                                <button
                                    type="button"
                                    className="my-class-cancel"
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
                                    className="my-class-save"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving
                                        ? "Saving..."
                                        : editingStudent
                                            ? "Save Changes"
                                            : "Create Student"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ======================================
                DELETE CONFIRMATION
            ====================================== */}

            {deletingStudent && (

                <div className="my-class-modal-overlay">

                    <div
                        className="my-class-modal"
                        style={{
                            maxWidth:
                                "450px",
                        }}
                    >

                        <div className="my-class-modal-header">

                            <div>

                                <h2>
                                    Delete Student
                                </h2>


                                <p>
                                    Are you sure you want
                                    to delete this student?
                                </p>

                            </div>


                            <button
                                type="button"
                                className="my-class-close"
                                onClick={
                                    cancelDelete
                                }
                                disabled={
                                    deleting
                                }
                            >

                                <FaTimes />

                            </button>

                        </div>


                        {/* STUDENT INFO */}

                        <div
                            style={{
                                background:
                                    "#f8fafc",
                                border:
                                    "1px solid #e2e8f0",
                                borderRadius:
                                    "10px",
                                padding:
                                    "16px",
                                marginBottom:
                                    "20px",
                            }}
                        >

                            <strong>
                                {
                                    deletingStudent.name
                                }
                            </strong>


                            <div
                                style={{
                                    color:
                                        "#64748b",
                                    marginTop:
                                        "5px",
                                }}
                            >

                                Roll No:{" "}
                                {
                                    deletingStudent.rollNo
                                }

                            </div>

                        </div>


                        {/* WARNING */}

                        <div
                            style={{
                                background:
                                    "#fff1f2",
                                color:
                                    "#b91c1c",
                                border:
                                    "1px solid #fecdd3",
                                borderRadius:
                                    "10px",
                                padding:
                                    "14px",
                                marginBottom:
                                    "20px",
                                fontSize:
                                    "14px",
                            }}
                        >

                            This will permanently delete
                            the student.

                        </div>


                        {/* ACTIONS */}

                        <div className="my-class-modal-actions">

                            <button
                                type="button"
                                className="my-class-cancel"
                                onClick={
                                    cancelDelete
                                }
                                disabled={
                                    deleting
                                }
                            >

                                Cancel

                            </button>


                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    deleting
                                }
                                style={{
                                    border:
                                        "none",
                                    borderRadius:
                                        "8px",
                                    padding:
                                        "11px 20px",
                                    background:
                                        "#dc2626",
                                    color:
                                        "white",
                                    fontWeight:
                                        "600",
                                    cursor:
                                        deleting
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                            >

                                {deleting
                                    ? "Deleting..."
                                    : "Delete Student"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


export default MyClass;