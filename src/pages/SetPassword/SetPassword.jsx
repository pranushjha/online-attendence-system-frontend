import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";

const SetPassword = () => {
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

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
            setMessage("Invitation token is missing.");
            return;
        }

        if (password.length < 6) {
            setStatus("error");
            setMessage(
                "Password must be at least 6 characters long."
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
                "/auth/set-teacher-password",
                {
                    token,
                    password,
                }
            );

            setStatus("success");
            setMessage(
                response.data?.message ||
                "Password created successfully."
            );

            setPassword("");
            setConfirmPassword("");

        } catch (error) {
            setStatus("error");
            setMessage(
                error.response?.data?.message ||
                "Unable to set password. The invitation may be invalid or expired."
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
                <h1>Set your password</h1>

                <p
                    style={{
                        marginTop: "10px",
                        lineHeight: "1.6",
                    }}
                >
                    Create a password to activate your teacher account.
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
                        <div style={{ marginBottom: "16px" }}>
                            <label htmlFor="password">
                                Password
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
                                Confirm password
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
                                ? "Creating password..."
                                : "Set Password"}
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

export default SetPassword;
