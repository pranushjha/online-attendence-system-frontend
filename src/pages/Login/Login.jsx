import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    FaUserShield,
    FaChalkboardTeacher,
} from "react-icons/fa";
import "./Login.css";

const Login = () => {
    const navigate = useNavigate();

    const {
        adminLogin,
        teacherLogin,
    } = useAuth();

    const [role, setRole] = useState("admin");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ==========================================
    // HANDLE LOGIN
    // ==========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {
            setError(
                "Please enter email and password."
            );
            return;
        }

        try {
            setLoading(true);

            let response;

            // ======================================
            // ADMIN LOGIN
            // ======================================

            if (role === "admin") {
                response = await adminLogin(
                    formData.email,
                    formData.password
                );
            }

            // ======================================
            // TEACHER LOGIN
            // ======================================

            else {
                response = await teacherLogin(
                    formData.email,
                    formData.password
                );
            }

            // ======================================
            // REDIRECT BASED ON ACTUAL ROLE
            // ======================================

            const loggedInRole =
                response?.user?.role;

            if (loggedInRole === "admin") {

                navigate(
                    "/dashboard",
                    { replace: true }
                );

            } else if (
                loggedInRole === "teacher"
            ) {

                navigate(
                    "/teacher-dashboard",
                    { replace: true }
                );

            } else {

                setError(
                    "Invalid user role."
                );

            }

        } catch (err) {

            console.error(
                "Login Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Login failed. Please check your credentials."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                {/* ======================================
                    HEADER
                ====================================== */}

                <div className="login-header">

                    <h1>
                        Online Attendance System
                    </h1>

                    <p>
                        Sign in to continue
                    </p>

                </div>


                {/* ======================================
                    ROLE SELECTOR
                ====================================== */}

                <div className="role-selector">

                    <button
                        type="button"
                        className={
                            role === "admin"
                                ? "role-button active"
                                : "role-button"
                        }
                        onClick={() => {
                            setRole("admin");
                            setError("");
                        }}
                    >

                        <FaUserShield />

                        <span>
                            Admin
                        </span>

                    </button>


                    <button
                        type="button"
                        className={
                            role === "teacher"
                                ? "role-button active"
                                : "role-button"
                        }
                        onClick={() => {
                            setRole("teacher");
                            setError("");
                        }}
                    >

                        <FaChalkboardTeacher />

                        <span>
                            Teacher
                        </span>

                    </button>

                </div>


                {/* ======================================
                    ERROR
                ====================================== */}

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}


                {/* ======================================
                    LOGIN FORM
                ====================================== */}

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >

                    {/* EMAIL */}

                    <div className="form-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />

                    </div>


                    {/* SUBMIT */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing in..."
                            : `Sign in as ${
                                role === "admin"
                                    ? "Admin"
                                    : "Teacher"
                            }`
                        }

                    </button>

                </form>

            </div>

        </div>
    );
};

export default Login;