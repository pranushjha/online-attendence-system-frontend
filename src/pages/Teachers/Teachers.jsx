import { useEffect, useState } from "react";
import {
    FaEdit,
    FaPlus,
    FaTrash,
    FaTimes,
} from "react-icons/fa";

import api from "../../services/api";
import "./Teachers.css";

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        assignedClass: "",
    });

    const [saving, setSaving] = useState(false);

    // ==========================================
    // LOAD TEACHERS + CLASSES
    // ==========================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [teachersResponse, classesResponse] =
                await Promise.all([
                    api.get("/teachers"),
                    api.get("/classes"),
                ]);

            setTeachers(
                teachersResponse.data.teachers || []
            );

            setClasses(
                classesResponse.data.classes || []
            );

        } catch (err) {
            console.error("Teachers Load Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load teachers."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);


    // ==========================================
    // FORM HANDLING
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    // ==========================================
    // OPEN ADD MODAL
    // ==========================================

    const openAddModal = () => {
        setEditingTeacher(null);

        setForm({
            name: "",
            email: "",
            password: "",
            assignedClass: "",
        });

        setError("");
        setShowModal(true);
    };


    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================

    const openEditModal = (teacher) => {
        setEditingTeacher(teacher);

        setForm({
            name: teacher.name || "",
            email: teacher.email || "",
            password: "",
            assignedClass:
                teacher.assignedClass?._id || "",
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
        setEditingTeacher(null);
    };


    // ==========================================
    // SAVE TEACHER
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
            };

            // Password is required when creating
            if (!editingTeacher) {
                payload.password = form.password;
            }

            // Password is optional when editing
            if (
                editingTeacher &&
                form.password.trim()
            ) {
                payload.password = form.password;
            }

            // Send null when no class is selected
            payload.assignedClass =
                form.assignedClass || null;

            if (editingTeacher) {
                await api.put(
                    `/teachers/${editingTeacher._id}`,
                    payload
                );
            } else {
                await api.post(
                    "/teachers",
                    payload
                );
            }

            closeModal();

            await loadData();

        } catch (err) {
            console.error("Save Teacher Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to save teacher."
            );

        } finally {
            setSaving(false);
        }
    };


    // ==========================================
    // DELETE TEACHER
    // ==========================================

    const handleDelete = async (teacher) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${teacher.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(
                `/teachers/${teacher._id}`
            );

            await loadData();

        } catch (err) {
            console.error("Delete Teacher Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to delete teacher."
            );
        }
    };


    // ==========================================
    // AVAILABLE CLASSES
    // ==========================================

    const availableClasses = classes.filter((classItem) => {

        // New teacher:
        // only classes without a teacher
        if (!editingTeacher) {
            return !classItem.classTeacher;
        }

        // Editing teacher:
        // allow the teacher's current class
        if (
            editingTeacher.assignedClass?._id ===
            classItem._id
        ) {
            return true;
        }

        // Otherwise only unassigned classes
        return !classItem.classTeacher;
    });


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="teachers-page">
                <div className="page-loading">
                    Loading teachers...
                </div>
            </div>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="teachers-page">

            {/* ======================================
                HEADER
            ====================================== */}

            <div className="teachers-header">

                <div>
                    <p className="page-label">
                        ADMINISTRATION
                    </p>

                    <h1>
                        Teachers
                    </h1>

                    <p className="page-description">
                        Manage teachers and their class assignments.
                    </p>
                </div>

                <button
                    className="add-teacher-button"
                    onClick={openAddModal}
                >
                    <FaPlus />
                    Add Teacher
                </button>

            </div>


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (
                <div className="teachers-error">
                    {error}
                </div>
            )}


            {/* ======================================
                TEACHERS TABLE
            ====================================== */}

            <div className="teachers-card">

                {teachers.length === 0 ? (

                    <div className="empty-teachers">
                        <h3>
                            No teachers found
                        </h3>

                        <p>
                            Add your first teacher to get started.
                        </p>
                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="teachers-table">

                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Assigned Class</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {teachers.map((teacher) => (

                                    <tr key={teacher._id}>

                                        <td>
                                            <strong>
                                                {teacher.name}
                                            </strong>
                                        </td>

                                        <td>
                                            {teacher.email}
                                        </td>

                                        <td>
                                            {teacher.assignedClass
                                                ? teacher.assignedClass.className
                                                : (
                                                    <span className="not-assigned">
                                                        Not assigned
                                                    </span>
                                                )}
                                        </td>

                                        <td>
                                            <span className="role-badge">
                                                {teacher.role}
                                            </span>
                                        </td>

                                        <td>

                                            <div className="action-buttons">

                                                <button
                                                    className="edit-button"
                                                    title="Edit teacher"
                                                    onClick={() =>
                                                        openEditModal(
                                                            teacher
                                                        )
                                                    }
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    title="Delete teacher"
                                                    onClick={() =>
                                                        handleDelete(
                                                            teacher
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

                    <div className="teacher-modal">

                        <div className="modal-header">

                            <div>
                                <h2>
                                    {editingTeacher
                                        ? "Edit Teacher"
                                        : "Add Teacher"}
                                </h2>

                                <p>
                                    {editingTeacher
                                        ? "Update teacher information."
                                        : "Create a new teacher account."}
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
                            className="teacher-form"
                            onSubmit={handleSubmit}
                        >

                            <label>
                                Name

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter teacher name"
                                    required
                                />
                            </label>


                            <label>
                                Email

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter teacher email"
                                    required
                                />
                            </label>


                            <label>
                                Password

                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder={
                                        editingTeacher
                                            ? "Leave blank to keep current password"
                                            : "Enter password"
                                    }
                                    required={!editingTeacher}
                                />
                            </label>


                            <label>
                                Assigned Class

                                <select
                                    name="assignedClass"
                                    value={form.assignedClass}
                                    onChange={handleChange}
                                >
                                    <option value="">
                                        No class assigned
                                    </option>

                                    {availableClasses.map(
                                        (classItem) => (
                                            <option
                                                key={classItem._id}
                                                value={classItem._id}
                                            >
                                                {classItem.className}
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
                                        : editingTeacher
                                            ? "Update Teacher"
                                            : "Create Teacher"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Teachers;