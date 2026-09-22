import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [role, setRole] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setStatus("");
        setMessage("");

        if (!token) {
            setStatus("error");
            setMessage("Password reset token is missing.");
            return;
        }

        if (!role) {
            setStatus("error");
            setMessage("Please select your account type.");
            return;
        }

        if (password.length < 8) {
            setStatus("error");
            setMessage(
                "Password must be at least 8 characters long."
            );
            return;
        }

        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/reset-password",
                {
                    token,
                    password,
                    role,
                }
            );

            setStatus("success");
            setMessage(
                response.data?.message ||
                "Password reset successfully."
            );

            setPassword("");
            setConfirmPassword("");

        } catch (error) {
            setStatus("error");
            setMessage(
                error.response?.data?.message ||
                "Unable to reset password. The link may be invalid or expired."
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
                <h1>Reset password</h1>

                <p
                    style={{
                        marginTop: "10px",
                        lineHeight: "1.6",
                    }}
                >
                    Create a new password for your account.
                </p>

                {message && (
                    <div
                        style={{
                            marginTop: "20px",
                            padding: "12px",
                            borderRadius: "8px",
                            background:
                                status === "success"
                                    ? "#ecfdf5"
                                    : "#fef2f2",
                        }}
                    >
                        {message}
                    </div>
                )}

                {status !== "success" && (
                    <form
                        onSubmit={handleSubmit}
                        style={{
                            marginTop: "24px",
                        }}
                    >
                        <div style={{ marginBottom: "20px" }}>
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
                        </div>

                        <div style={{ marginBottom: "16px" }}>
                            <label htmlFor="password">
                                New password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                autoComplete="new-password"
                                required
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginTop: "8px",
                                    padding: "12px",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label htmlFor="confirmPassword">
                                Confirm new password
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                                }
                                autoComplete="new-password"
                                required
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginTop: "8px",
                                    padding: "12px",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "12px",
                                cursor: loading
                                    ? "not-allowed"
                                    : "pointer",
                            }}
                        >
                            {loading
                                ? "Resetting..."
                                : "Reset Password"}
                        </button>
                    </form>
                )}

                {status === "success" && (
                    <Link
                        to="/login"
                        style={{
                            display: "block",
                            marginTop: "24px",
                            textAlign: "center",
                        }}
                    >
                        Go to Login
                    </Link>
                )}
            </section>
        </main>
    );
};

export default ResetPassword;
