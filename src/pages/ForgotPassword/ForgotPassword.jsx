import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setSuccess(false);
        setMessage("");

        try {
            const response = await api.post(
                "/auth/forgot-password",
                {
                    email: email.trim(),
                    role,
                }
            );

            setSuccess(true);
            setMessage(
                response.data?.message ||
                "If the account exists, a password reset email has been sent."
            );

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to process the request."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
            }}
        >
            <section
                style={{
                    width: "100%",
                    maxWidth: "480px",
                    padding: "40px",
                    borderRadius: "16px",
                    background: "#ffffff",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                }}
            >
                <h1>Forgot password?</h1>

                <p
                    style={{
                        marginTop: "10px",
                        lineHeight: "1.6",
                    }}
                >
                    Enter your account details and we'll send you a
                    password reset link.
                </p>

                {message && (
                    <div
                        style={{
                            marginTop: "20px",
                            padding: "12px",
                            borderRadius: "8px",
                            background: success
                                ? "#ecfdf5"
                                : "#fef2f2",
                        }}
                    >
                        {message}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    style={{
                        marginTop: "24px",
                    }}
                >
                    <label htmlFor="role">
                        Account type
                    </label>

                    <select
                        id="role"
                        value={role}
                        onChange={(event) =>
                            setRole(event.target.value)
                        }
                        required
                        style={{
                            display: "block",
                            width: "100%",
                            marginTop: "8px",
                            padding: "12px",
                            boxSizing: "border-box",
                            background: "#ffffff",
                        }}
                    >
                        <option value="">
                            Select account type
                        </option>

                        <option value="admin">
                            Admin
                        </option>

                        <option value="teacher">
                            Teacher
                        </option>
                    </select>

                    <label
                        htmlFor="email"
                        style={{
                            display: "block",
                            marginTop: "20px",
                        }}
                    >
                        Email address
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        autoComplete="email"
                        placeholder="you@college.com"
                        required
                        style={{
                            display: "block",
                            width: "100%",
                            marginTop: "8px",
                            padding: "12px",
                            boxSizing: "border-box",
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            marginTop: "20px",
                            padding: "12px",
                            cursor: loading
                                ? "not-allowed"
                                : "pointer",
                        }}
                    >
                        {loading
                            ? "Sending..."
                            : "Send Reset Link"}
                    </button>
                </form>

                <Link
                    to="/login"
                    style={{
                        display: "block",
                        marginTop: "24px",
                        textAlign: "center",
                    }}
                >
                    Back to Login
                </Link>
            </section>
        </main>
    );
};

export default ForgotPassword;
