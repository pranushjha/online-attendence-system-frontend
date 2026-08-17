import { useEffect, useState } from "react";
import api from "../../services/api";

const MyClass = () => {
    const [classData, setClassData] = useState(null);
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadMyClass = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/classes/my-class");

                setClassData(response.data.class);
                setStudents(response.data.students || []);

            } catch (err) {
                console.error("My Class Error:", err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load your class."
                );
            } finally {
                setLoading(false);
            }
        };

        loadMyClass();
    }, []);

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div style={{ padding: "40px" }}>
                <h1>My Class</h1>
                <p>Loading class information...</p>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div style={{ padding: "40px" }}>
                <h1>My Class</h1>

                <div
                    style={{
                        marginTop: "20px",
                        padding: "20px",
                        background: "#fff1f2",
                        color: "#b91c1c",
                        borderRadius: "10px",
                    }}
                >
                    {error}
                </div>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div style={{ padding: "40px" }}>

            <div style={{ marginBottom: "30px" }}>
                <div
                    style={{
                        color: "#4f46e5",
                        fontWeight: "600",
                        marginBottom: "8px",
                    }}
                >
                    MY CLASS
                </div>

                <h1
                    style={{
                        margin: 0,
                        fontSize: "36px",
                    }}
                >
                    {classData.className}
                </h1>

                <p
                    style={{
                        color: "#64748b",
                        fontSize: "16px",
                    }}
                >
                    Your assigned class and students.
                </p>
            </div>

            {/* ==========================================
                CLASS INFORMATION
            ========================================== */}

            <div
                style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "25px",
                    marginBottom: "30px",
                }}
            >
                <h2 style={{ marginTop: 0 }}>
                    Class Information
                </h2>

                <p>
                    <strong>Class:</strong>{" "}
                    {classData.className}
                </p>

                <p>
                    <strong>Teacher:</strong>{" "}
                    {classData.classTeacher?.name || "You"}
                </p>

                <p>
                    <strong>Total Students:</strong>{" "}
                    {students.length}
                </p>
            </div>

            {/* ==========================================
                STUDENTS
            ========================================== */}

            <div
                style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "25px",
                }}
            >
                <h2>
                    Students
                </h2>

                {students.length === 0 ? (
                    <p
                        style={{
                            color: "#64748b",
                        }}
                    >
                        No active students are assigned to this
                        class.
                    </p>
                ) : (
                    <div>

                        {students.map((student, index) => (
                            <div
                                key={student._id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "16px 0",
                                    borderBottom:
                                        index !== students.length - 1
                                            ? "1px solid #e2e8f0"
                                            : "none",
                                }}
                            >

                                <div>
                                    <strong>
                                        {student.name}
                                    </strong>

                                    <div
                                        style={{
                                            color: "#64748b",
                                            marginTop: "4px",
                                        }}
                                    >
                                        Roll No:{" "}
                                        {student.rollNo}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        color: "#64748b",
                                    }}
                                >
                                    {student.email || ""}
                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
};

export default MyClass;