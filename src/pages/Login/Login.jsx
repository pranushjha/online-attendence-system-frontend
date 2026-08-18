import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaUserShield,
    FaChalkboardTeacher,
    FaEye,
    FaEyeSlash,
    FaArrowRight,
    FaGraduationCap,
    FaLock,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

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

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleRoleChange = (newRole) => {

        setRole(newRole);

        setError("");
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        if (
            !formData.email.trim() ||
            !formData.password
        ) {
            setError(
                "Please enter your email and password."
            );

            return;
        }

        try {

            setLoading(true);

            let response;

            if (role === "admin") {

                response =
                    await adminLogin(
                        formData.email,
                        formData.password
                    );

            } else {

                response =
                    await teacherLogin(
                        formData.email,
                        formData.password
                    );
            }

            const loggedInRole =
                response?.user?.role;

            if (
                loggedInRole === "admin"
            ) {

                navigate(
                    "/dashboard",
                    {
                        replace: true,
                    }
                );

            } else if (
                loggedInRole === "teacher"
            ) {

                navigate(
                    "/teacher-dashboard",
                    {
                        replace: true,
                    }
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

        <main className="login-page">

            <div className="login-background-shape shape-one" />
            <div className="login-background-shape shape-two" />

            <section className="login-wrapper">

                {/* BRAND */}
                <div className="login-brand">

                    <div className="login-brand-icon">
                        <FaGraduationCap />
                    </div>

                    <div>
                        <strong>
                            Attendance
                        </strong>

                        <span>
                            Online Attendance System
                        </span>
                    </div>

                </div>


                {/* CARD */}
                <div className="login-card">

                    <div className="login-header">

                        <div className="login-eyebrow">
                            SECURE ACCESS
                        </div>

                        <h1>
                            Welcome back
                        </h1>

                        <p>
                            Sign in to manage attendance
                            and continue to your dashboard.
                        </p>

                    </div>


                    {/* ROLE */}
                    <div className="role-selector">

                        <button
                            type="button"
                            className={
                                role === "admin"
                                    ? "role-button active"
                                    : "role-button"
                            }
                            onClick={() =>
                                handleRoleChange("admin")
                            }
                        >

                            <span className="role-icon">
                                <FaUserShield />
                            </span>

                            <span className="role-content">
                                <strong>
                                    Admin
                                </strong>

                                <small>
                                    Manage system
                                </small>
                            </span>

                        </button>


                        <button
                            type="button"
                            className={
                                role === "teacher"
                                    ? "role-button active"
                                    : "role-button"
                            }
                            onClick={() =>
                                handleRoleChange("teacher")
                            }
                        >

                            <span className="role-icon">
                                <FaChalkboardTeacher />
                            </span>

                            <span className="role-content">
                                <strong>
                                    Teacher
                                </strong>

                                <small>
                                    Manage attendance
                                </small>
                            </span>

                        </button>

                    </div>


                    {/* ERROR */}
                    {error && (

                        <div className="login-error">
                            {error}
                        </div>

                    )}


                    {/* FORM */}
                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">

                            <label htmlFor="email">
                                Email address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@college.com"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />

                        </div>


                        <div className="form-group">

                            <div className="form-label-row">

                                <label htmlFor="password">
                                    Password
                                </label>

                            </div>

                            <div className="password-field">

                                <FaLock className="password-lock-icon" />

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword
                                        ? <FaEyeSlash />
                                        : <FaEye />
                                    }
                                </button>

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            <span>
                                {loading
                                    ? "Signing in..."
                                    : `Sign in as ${
                                        role === "admin"
                                            ? "Admin"
                                            : "Teacher"
                                    }`
                                }
                            </span>

                            {!loading && (
                                <FaArrowRight />
                            )}

                        </button>

                    </form>


                    <div className="login-footer">

                        <span>
                            Secure attendance management
                        </span>

                        <span className="footer-dot">
                            •
                        </span>

                        <span>
                            College Portal
                        </span>

                    </div>

                </div>

            </section>

        </main>
    );
};

export default Login;