import { useEffect, useState } from "react";
import {
    FaEdit,
    FaPlus,
    FaTrash,
    FaTimes,
} from "react-icons/fa";

import api from "../../services/api";
import "./Students.css";

const Students = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        rollNo: "",
        name: "",
        classId: "",
        active: true,
    });

    // ==========================================
    // LOAD STUDENTS + CLASSES
    // ==========================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [studentsResponse, classesResponse] =
                await Promise.all([
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
            console.error("Students Load Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load students."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);


    // ==========================================
    // FORM
    // ==========================================

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox"
                ? checked
                : value,
        }));
    };


    // ==========================================
    // ADD STUDENT
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
    // EDIT STUDENT
    // ==========================================

    const openEditModal = (student) => {
        setEditingStudent(student);

        setForm({
            rollNo: student.rollNo || "",
            name: student.name || "",
            classId: student.classId?._id || "",
            active: student.active ?? true,
        });

        setError("");
        setShowModal(true);
    };


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const closeModal = () => {
        if (saving) return;

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

            const payload = {
                rollNo: form.rollNo.trim(),
                name: form.name.trim(),
                classId: form.classId,
                active: form.active,
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

            closeModal();

            await loadData();

        } catch (err) {
            console.error("Save Student Error:", err);

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
        const confirmed = window.confirm(
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
            console.error("Delete Student Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to delete student."
            );
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

                <button
                    className="add-student-button"
                    onClick={openAddModal}
                >
                    <FaPlus />
                    Add Student
                </button>

            </div>


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
                                    <th>Roll No</th>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {students.map((student) => (

                                    <tr key={student._id}>

                                        <td>
                                            <strong>
                                                {student.rollNo}
                                            </strong>
                                        </td>

                                        <td>
                                            {student.name}
                                        </td>

                                        <td>
                                            {student.classId
                                                ? student.classId.className
                                                : (
                                                    <span className="not-assigned">
                                                        —
                                                    </span>
                                                )}
                                        </td>

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

                                ))}

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


                        <form
                            className="student-form"
                            onSubmit={handleSubmit}
                        >

                            <label>
                                Roll Number

                                <input
                                    type="text"
                                    name="rollNo"
                                    value={form.rollNo}
                                    onChange={handleChange}
                                    placeholder="Example: BCA002"
                                    required
                                />
                            </label>


                            <label>
                                Student Name

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter student name"
                                    required
                                />
                            </label>


                            <label>
                                Class

                                <select
                                    name="classId"
                                    value={form.classId}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select class
                                    </option>

                                    {classes.map((classItem) => (

                                        <option
                                            key={classItem._id}
                                            value={classItem._id}
                                        >
                                            {classItem.className}
                                        </option>

                                    ))}

                                </select>

                            </label>


                            {editingStudent && (

                                <label className="active-checkbox">

                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={form.active}
                                        onChange={handleChange}
                                    />

                                    <span>
                                        Student is active
                                    </span>

                                </label>

                            )}


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-button"
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