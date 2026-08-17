import { useEffect, useState } from "react";
import {
    FaEdit,
    FaPlus,
    FaTrash,
    FaTimes,
} from "react-icons/fa";

import api from "../../services/api";
import "./Classes.css";

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        className: "",
        classTeacher: "",
    });

    // ==========================================
    // LOAD CLASSES + TEACHERS
    // ==========================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [classesResponse, teachersResponse] =
                await Promise.all([
                    api.get("/classes"),
                    api.get("/teachers"),
                ]);

            setClasses(
                classesResponse.data.classes || []
            );

            setTeachers(
                teachersResponse.data.teachers || []
            );

        } catch (err) {
            console.error("Classes Load Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load classes."
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
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    // ==========================================
    // ADD
    // ==========================================

    const openAddModal = () => {
        setEditingClass(null);

        setForm({
            className: "",
            classTeacher: "",
        });

        setError("");
        setShowModal(true);
    };


    // ==========================================
    // EDIT
    // ==========================================

    const openEditModal = (classItem) => {
        setEditingClass(classItem);

        setForm({
            className: classItem.className || "",
            classTeacher:
                classItem.classTeacher?._id || "",
        });

        setError("");
        setShowModal(true);
    };


    // ==========================================
    // CLOSE
    // ==========================================

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingClass(null);
    };


    // ==========================================
    // SAVE
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const payload = {
                className: form.className.trim(),
                classTeacher:
                    form.classTeacher || null,
            };

            if (editingClass) {
                await api.put(
                    `/classes/${editingClass._id}`,
                    payload
                );
            } else {
                await api.post(
                    "/classes",
                    payload
                );
            }

            closeModal();

            await loadData();

        } catch (err) {
            console.error("Save Class Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to save class."
            );

        } finally {
            setSaving(false);
        }
    };


    // ==========================================
    // DELETE
    // ==========================================

    const handleDelete = async (classItem) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${classItem.className}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(
                `/classes/${classItem._id}`
            );

            await loadData();

        } catch (err) {
            console.error("Delete Class Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to delete class."
            );
        }
    };


    // ==========================================
    // AVAILABLE TEACHERS
    // ==========================================

    const availableTeachers = teachers.filter(
        (teacher) => {

            // No teacher assigned
            if (!teacher.assignedClass) {
                return true;
            }

            // When editing, allow the current teacher
            if (
                editingClass &&
                editingClass.classTeacher?._id ===
                    teacher._id
            ) {
                return true;
            }

            return false;
        }
    );


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="classes-page">
                <div className="page-loading">
                    Loading classes...
                </div>
            </div>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="classes-page">

            {/* ======================================
                HEADER
            ====================================== */}

            <div className="classes-header">

                <div>
                    <p className="page-label">
                        ADMINISTRATION
                    </p>

                    <h1>
                        Classes
                    </h1>

                    <p className="page-description">
                        Manage classes and their assigned teachers.
                    </p>
                </div>

                <button
                    className="add-class-button"
                    onClick={openAddModal}
                >
                    <FaPlus />
                    Add Class
                </button>

            </div>


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (
                <div className="classes-error">
                    {error}
                </div>
            )}


            {/* ======================================
                TABLE
            ====================================== */}

            <div className="classes-card">

                {classes.length === 0 ? (

                    <div className="empty-classes">

                        <h3>
                            No classes found
                        </h3>

                        <p>
                            Add your first class to get started.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="classes-table">

                            <thead>
                                <tr>
                                    <th>Class Name</th>
                                    <th>Class Teacher</th>
                                    <th>Teacher Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {classes.map((classItem) => (

                                    <tr key={classItem._id}>

                                        <td>
                                            <strong>
                                                {classItem.className}
                                            </strong>
                                        </td>

                                        <td>
                                            {classItem.classTeacher
                                                ? classItem.classTeacher.name
                                                : (
                                                    <span className="not-assigned">
                                                        Not assigned
                                                    </span>
                                                )}
                                        </td>

                                        <td>
                                            {classItem.classTeacher
                                                ? classItem.classTeacher.email
                                                : (
                                                    <span className="not-assigned">
                                                        —
                                                    </span>
                                                )}
                                        </td>

                                        <td>

                                            <div className="action-buttons">

                                                <button
                                                    className="edit-button"
                                                    title="Edit class"
                                                    onClick={() =>
                                                        openEditModal(
                                                            classItem
                                                        )
                                                    }
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    title="Delete class"
                                                    onClick={() =>
                                                        handleDelete(
                                                            classItem
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
                MODAL
            ====================================== */}

            {showModal && (

                <div className="modal-overlay">

                    <div className="class-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    {editingClass
                                        ? "Edit Class"
                                        : "Add Class"}
                                </h2>

                                <p>
                                    {editingClass
                                        ? "Update class information."
                                        : "Create a new class."}
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
                            className="class-form"
                            onSubmit={handleSubmit}
                        >

                            <label>
                                Class Name

                                <input
                                    type="text"
                                    name="className"
                                    value={form.className}
                                    onChange={handleChange}
                                    placeholder="Example: BCA-1A"
                                    required
                                />
                            </label>


                            <label>
                                Class Teacher

                                <select
                                    name="classTeacher"
                                    value={form.classTeacher}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        No teacher assigned
                                    </option>

                                    {availableTeachers.map(
                                        (teacher) => (

                                            <option
                                                key={teacher._id}
                                                value={teacher._id}
                                            >
                                                {teacher.name} —{" "}
                                                {teacher.email}
                                            </option>

                                        )
                                    )}

                                </select>

                            </label>


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
                                        : editingClass
                                            ? "Update Class"
                                            : "Create Class"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Classes;