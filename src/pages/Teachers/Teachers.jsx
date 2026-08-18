import { useEffect, useState } from "react";

import {
    FaEdit,
    FaPlus,
    FaTrash,
    FaTimes,
    FaUserTie,
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

    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        assignedClass: "",
    });


    // =========================================================
    // LOAD TEACHERS + CLASSES
    // =========================================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                teachersResponse,
                classesResponse,
            ] = await Promise.all([
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

            console.error(
                "Teachers Load Error:",
                err
            );

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


    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

    };


    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {

        setForm({
            name: "",
            email: "",
            password: "",
            assignedClass: "",
        });

    };


    // =========================================================
    // OPEN ADD MODAL
    // =========================================================

    const openAddModal = () => {

        setEditingTeacher(null);

        resetForm();

        setError("");

        setShowModal(true);

    };


    // =========================================================
    // OPEN EDIT MODAL
    // =========================================================

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


    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        setEditingTeacher(null);

        resetForm();

    };


    // =========================================================
    // SAVE TEACHER
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        const name = form.name.trim();
        const email = form.email.trim();
        const password = form.password.trim();


        if (!name) {

            setError(
                "Teacher name is required."
            );

            return;
        }


        if (!email) {

            setError(
                "Teacher email is required."
            );

            return;
        }


        if (!editingTeacher && !password) {

            setError(
                "Password is required when creating a teacher."
            );

            return;
        }


        try {

            setSaving(true);


            const payload = {
                name,
                email,
                assignedClass:
                    form.assignedClass || null,
            };


            // Password is required when creating.
            if (!editingTeacher) {

                payload.password = password;

            }


            // Password is optional when editing.
            if (
                editingTeacher &&
                password
            ) {

                payload.password = password;

            }


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


            setShowModal(false);

            setEditingTeacher(null);

            resetForm();

            await loadData();

        } catch (err) {

            console.error(
                "Save Teacher Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to save teacher."
            );

        } finally {

            setSaving(false);

        }

    };


    // =========================================================
    // DELETE TEACHER
    // =========================================================

    const handleDelete = async (teacher) => {

        const confirmed =
            window.confirm(
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

            console.error(
                "Delete Teacher Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to delete teacher."
            );

        }

    };


    // =========================================================
    // AVAILABLE CLASSES
    // =========================================================

    const availableClasses =
        classes.filter((classItem) => {

            // Creating teacher:
            // only show unassigned classes.

            if (!editingTeacher) {

                return !classItem.classTeacher;

            }


            // Editing teacher:
            // keep their currently assigned class available.

            if (
                editingTeacher.assignedClass?._id ===
                classItem._id
            ) {

                return true;

            }


            // Other classes must be unassigned.

            return !classItem.classTeacher;

        });


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div className="teachers-page">

                <div className="teachers-loading">

                    <div className="teachers-loading-spinner" />

                    <span>
                        Loading teachers...
                    </span>

                </div>

            </div>
        );

    }


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="teachers-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="teachers-header">

                <div className="teachers-heading">

                    <p className="teachers-label">
                        ADMINISTRATION
                    </p>

                    <h1>
                        Teachers
                    </h1>

                    <p className="teachers-description">
                        Manage teachers and their class assignments.
                    </p>

                </div>


                <button
                    type="button"
                    className="add-teacher-button"
                    onClick={openAddModal}
                >

                    <FaPlus />

                    <span>
                        Add Teacher
                    </span>

                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="teachers-error">

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* =================================================
                TABLE CARD
            ================================================= */}

            <div className="teachers-card">

                {teachers.length === 0 ? (

                    <div className="teachers-empty">

                        <div className="teachers-empty-icon">
                            <FaUserTie />
                        </div>

                        <h3>
                            No teachers found
                        </h3>

                        <p>
                            Add your first teacher to get started.
                        </p>

                        <button
                            type="button"
                            onClick={openAddModal}
                        >
                            <FaPlus />
                            Add Teacher
                        </button>

                    </div>

                ) : (

                    <div className="teachers-table-wrapper">

                        <table className="teachers-table">

                            <thead>

                                <tr>

                                    <th>
                                        Teacher
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Assigned Class
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {teachers.map(
                                    (teacher) => {

                                        const initials =
                                            teacher.name
                                                ?.split(" ")
                                                .map(
                                                    (part) =>
                                                        part[0]
                                                )
                                                .join("")
                                                .slice(0, 2)
                                                .toUpperCase() ||
                                            "T";


                                        return (

                                            <tr
                                                key={
                                                    teacher._id
                                                }
                                            >

                                                <td>

                                                    <div className="teacher-name-cell">

                                                        <div className="teacher-list-avatar">
                                                            {initials}
                                                        </div>

                                                        <strong>
                                                            {
                                                                teacher.name
                                                            }
                                                        </strong>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span className="teacher-email">
                                                        {
                                                            teacher.email
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    {teacher.assignedClass
                                                        ? (
                                                            <span className="assigned-class-badge">
                                                                {
                                                                    teacher
                                                                        .assignedClass
                                                                        .className
                                                                }
                                                            </span>
                                                        )
                                                        : (
                                                            <span className="teacher-not-assigned">
                                                                Not assigned
                                                            </span>
                                                        )}

                                                </td>


                                                <td>

                                                    <span className="teacher-role-badge">
                                                        {
                                                            teacher.role ||
                                                            "teacher"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="teacher-action-buttons">

                                                        <button
                                                            type="button"
                                                            className="teacher-edit-button"
                                                            title="Edit teacher"
                                                            aria-label="Edit teacher"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    teacher
                                                                )
                                                            }
                                                        >
                                                            <FaEdit />
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="teacher-delete-button"
                                                            title="Delete teacher"
                                                            aria-label="Delete teacher"
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

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                MODAL
            ================================================= */}

            {showModal && (

                <div className="teacher-modal-overlay">

                    <div
                        className="teacher-modal"
                        role="dialog"
                        aria-modal="true"
                    >


                        {/* HEADER */}

                        <div className="teacher-modal-header">

                            <div>

                                <p className="teacher-modal-label">
                                    {editingTeacher
                                        ? "UPDATE ACCOUNT"
                                        : "NEW ACCOUNT"}
                                </p>

                                <h2>
                                    {editingTeacher
                                        ? "Edit Teacher"
                                        : "Add Teacher"}
                                </h2>

                                <p>
                                    {editingTeacher
                                        ? "Update teacher information and class assignment."
                                        : "Create a new teacher account and assign a class."}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="teacher-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Close modal"
                            >
                                <FaTimes />
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            className="teacher-form"
                            onSubmit={handleSubmit}
                        >


                            <label>

                                Teacher Name

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter teacher name"
                                    autoComplete="name"
                                    required
                                />

                            </label>


                            <label>

                                Email Address

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter teacher email"
                                    autoComplete="email"
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
                                    autoComplete={
                                        editingTeacher
                                            ? "new-password"
                                            : "new-password"
                                    }
                                    required={!editingTeacher}
                                />

                                {editingTeacher && (
                                    <small className="teacher-form-help">
                                        Leave blank if you do not want to change the password.
                                    </small>
                                )}

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


                            {availableClasses.length === 0 &&
                                !form.assignedClass && (

                                    <p className="teacher-class-warning">
                                        No unassigned classes are currently available.
                                    </p>

                                )}


                            {/* ACTIONS */}

                            <div className="teacher-modal-actions">

                                <button
                                    type="button"
                                    className="teacher-cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="teacher-save-button"
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