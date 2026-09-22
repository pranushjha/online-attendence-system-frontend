import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState("");

    // Prevent duplicate verification requests in React development mode
    const verificationStarted = useRef(false);

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage("Verification token is missing.");
            return;
        }

        if (verificationStarted.current) {
            return;
        }

        verificationStarted.current = true;

        const verify = async () => {
            try {
                const response = await api.get(
                    "/auth/verify-email",
                    {
                        params: { token },
                    }
                );

                setStatus("success");
                setMessage(
                    response.data?.message ||
                    "Email verified successfully."
                );

            } catch (error) {
                setStatus("error");
                setMessage(
                    error.response?.data?.message ||
                    "This verification link is invalid or expired."
                );
            }
        };

        verify();
    }, [searchParams]);

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
                    textAlign: "center",
                    padding: "40px",
                    borderRadius: "16px",
                    background: "#ffffff",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                }}
            >
                <h1>
                    {status === "verifying"
                        ? "Verifying your email..."
                        : status === "success"
                            ? "Email verified"
                            : "Verification failed"}
                </h1>

                <p
                    style={{
                        marginTop: "16px",
                        lineHeight: "1.6",
                    }}
                >
                    {status === "verifying"
                        ? "Please wait while we verify your email address."
                        : message}
                </p>

                {status === "success" && (
                    <Link
                        to="/login"
                        style={{
                            display: "inline-block",
                            marginTop: "24px",
                            textDecoration: "none",
                        }}
                    >
                        Go to Login
                    </Link>
                )}

                {status === "error" && (
                    <Link
                        to="/login"
                        style={{
                            display: "inline-block",
                            marginTop: "24px",
                            textDecoration: "none",
                        }}
                    >
                        Back to Login
                    </Link>
                )}
            </section>
        </main>
    );
};

export default VerifyEmail;
