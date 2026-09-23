import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    BarChart3,
    CircleCheck,
    CircleX,
    Users,
    Percent,
    RefreshCw,
    Filter,
    CalendarDays,
    Presentation,
    X,
    Download,
} from "lucide-react";

import api from "../../services/api";
import NepaliCalendar from "../../components/NepaliCalendar";

import { toEnglishDate, formatNepaliDate } from "../../utils/nepaliDate";
import "./Reports.css";


const AdminReports = () => {

    // ==========================================
    // STATE
    // ==========================================

    const [attendanceData, setAttendanceData] =
        useState([]);

    const [classes, setClasses] =
        useState([]);

    const [teachers, setTeachers] =
        useState([]);

    const [selectedClass, setSelectedClass] =
        useState("all");

    const [selectedTeacher, setSelectedTeacher] =
        useState("all");

    const [selectedDate, setSelectedDate] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");


    // ==========================================
    // GET ID
    // ==========================================

    const getId = (value) => {

        if (!value) {
            return "";
        }

        if (typeof value === "object") {

            return String(
                value._id ||
                value.id ||
                ""
            );
        }

        return String(value);
    };


    // ==========================================
    // GET CLASS ID
    // ==========================================

    const getClassId = (record) => {

        return getId(
            record?.classId
        );
    };


    // ==========================================
    // GET CLASS NAME
    // ==========================================

    const getClassName = (record) => {

        if (
            record?.classId &&
            typeof record.classId === "object"
        ) {

            return (
                record.classId.className ||
                record.classId.name ||
                "Unknown Class"
            );
        }

        return (
            record?.className ||
            record?.class?.className ||
            "Unknown Class"
        );
    };


    // ==========================================
    // GET TEACHER ID
    // ==========================================

    const getTeacherId = (record) => {

        return getId(
            record?.markedBy ||
            record?.teacher
        );
    };


    // ==========================================
    // GET TEACHER NAME
    // ==========================================

    const getTeacherName = (record) => {

        if (
            record?.markedBy &&
            typeof record.markedBy === "object"
        ) {

            return (
                record.markedBy.name ||
                record.markedBy.email ||
                "Unknown Teacher"
            );
        }

        if (
            record?.teacher &&
            typeof record.teacher === "object"
        ) {

            return (
                record.teacher.name ||
                record.teacher.email ||
                "Unknown Teacher"
            );
        }

        return (
            record?.teacherName ||
            "Unknown Teacher"
        );
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const getDate = (record) => {

        if (!record?.date) {
            return "";
        }

        try {
            return formatNepaliDate(
                record.date
            );
        } catch (error) {
            console.error(
                "Nepali report date formatting error:",
                error
            );

            return "";
        }
    };


    // ==========================================
    // GET STUDENT RECORDS
    // ==========================================

    const getStudentRecords = (record) => {

        if (
            Array.isArray(
                record?.students
            )
        ) {

            return record.students;
        }

        return [];
    };


    // ==========================================
    // GET STUDENT ID
    // ==========================================

    const getStudentId = (
        student,
        fallback
    ) => {

        if (!student) {
            return `unknown-${fallback}`;
        }

        if (
            student.studentId &&
            typeof student.studentId === "object"
        ) {

            return String(
                student.studentId._id ||
                student.studentId.id ||
                `unknown-${fallback}`
            );
        }

        if (student.studentId) {
            return String(
                student.studentId
            );
        }

        if (student._id) {
            return String(
                student._id
            );
        }

        if (student.id) {
            return String(
                student.id
            );
        }

        return `unknown-${fallback}`;
    };


    // ==========================================
    // GET STUDENT NAME
    // ==========================================

    const getStudentName = (student) => {

        if (
            student?.studentId &&
            typeof student.studentId === "object"
        ) {

            return (
                student.studentId.name ||
                "Unknown Student"
            );
        }

        return (
            student?.name ||
            "Unknown Student"
        );
    };


    // ==========================================
    // GET STUDENT ROLL
    // ==========================================

    const getStudentRollNo = (student) => {

        if (
            student?.studentId &&
            typeof student.studentId === "object"
        ) {

            return (
                student.studentId.rollNo ||
                "-"
            );
        }

        return (
            student?.rollNo ||
            "-"
        );
    };


    // ==========================================
    // GET STATUS
    // ==========================================

    const getStudentStatus = (student) => {

        return String(
            student?.status ||
            student?.attendanceStatus ||
            ""
        )
            .trim()
            .toLowerCase();
    };


    // ==========================================
    // LOAD CLASSES + TEACHERS
    // ==========================================

    const loadFilterData = async () => {

        const [
            classesResponse,
            teachersResponse,
        ] = await Promise.all([

            api.get(
                "/classes"
            ),

            api.get(
                "/teachers"
            ),
        ]);


        const classesPayload =
            classesResponse.data;

        let classList = [];


        if (
            Array.isArray(
                classesPayload?.classes
            )
        ) {

            classList =
                classesPayload.classes;

        } else if (
            Array.isArray(
                classesPayload?.data
            )
        ) {

            classList =
                classesPayload.data;

        } else if (
            Array.isArray(
                classesPayload
            )
        ) {

            classList =
                classesPayload;
        }


        setClasses(
            classList
        );


        const teachersPayload =
            teachersResponse.data;

        let teacherList = [];


        if (
            Array.isArray(
                teachersPayload?.teachers
            )
        ) {

            teacherList =
                teachersPayload.teachers;

        } else if (
            Array.isArray(
                teachersPayload?.data
            )
        ) {

            teacherList =
                teachersPayload.data;

        } else if (
            Array.isArray(
                teachersPayload
            )
        ) {

            teacherList =
                teachersPayload;
        }


        setTeachers(
            teacherList
        );
    };


    // ==========================================
    // LOAD ATTENDANCE
    // ==========================================

    const loadAttendance = async () => {

        let response;


        if (selectedDate) {

            let url =
                `/attendance/report/date/${encodeURIComponent(toEnglishDate(selectedDate))}`;


            if (
                selectedClass !==
                "all"
            ) {

                url +=
                    `?classId=${selectedClass}`;
            }


            response =
                await api.get(
                    url
                );


            const payload =
                response.data;


            const dateClasses =
                Array.isArray(
                    payload?.classes
                )
                    ? payload.classes
                    : [];


            const convertedRecords =
                dateClasses.map(
                    (classReport) => {

                        return {

                            _id:
                                classReport.attendanceId,

                            attendanceId:
                                classReport.attendanceId,

                            date:
                                classReport.date ||
                                selectedDate,

                            classId: {

                                _id:
                                    classReport.classId,

                                className:
                                    classReport.className,
                            },

                            markedBy:
                                classReport.markedBy,

                            students:
                                Array.isArray(
                                    classReport.students
                                )
                                    ? classReport.students.map(
                                          (
                                              student
                                          ) => ({

                                              studentId: {

                                                  _id:
                                                      student.studentId,

                                                  name:
                                                      student.name,

                                                  rollNo:
                                                      student.rollNo,
                                              },

                                              status:
                                                  student.status,
                                          })
                                      )
                                    : [],
                        };
                    }
                );


            setAttendanceData(
                convertedRecords
            );


            return;
        }


        let url =
            "/attendance";


        const params = [];


        if (
            selectedClass !==
            "all"
        ) {

            params.push(
                `classId=${selectedClass}`
            );
        }


        if (
            params.length > 0
        ) {

            url +=
                `?${params.join("&")}`;
        }


        response =
            await api.get(
                url
            );


        const attendancePayload =
            response.data;


        let attendance = [];


        if (
            Array.isArray(
                attendancePayload?.attendance
            )
        ) {

            attendance =
                attendancePayload.attendance;

        } else if (
            Array.isArray(
                attendancePayload?.data
            )
        ) {

            attendance =
                attendancePayload.data;

        } else if (
            Array.isArray(
                attendancePayload
            )
        ) {

            attendance =
                attendancePayload;
        }


        setAttendanceData(
            attendance
        );
    };


    // ==========================================
    // LOAD EVERYTHING
    // ==========================================

    const loadData = async (
        showLoading = true
    ) => {

        try {

            if (showLoading) {
                setLoading(true);
            }

            setError("");


            await Promise.all([
                loadFilterData(),
                loadAttendance(),
            ]);

        } catch (err) {

            console.error(
                "Admin Reports Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to load admin reports."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        loadData();

    }, []);


    // ==========================================
    // RELOAD FILTERED ATTENDANCE
    // ==========================================

    useEffect(() => {

        if (!loading) {

            loadAttendance()
                .catch(
                    (err) => {

                        console.error(
                            "Filter Attendance Error:",
                            err
                        );

                        setError(
                            err.response?.data?.message ||
                            "Unable to load filtered attendance."
                        );
                    }
                );
        }

    }, [
        selectedClass,
        selectedDate,
    ]);


    // ==========================================
    // REFRESH
    // ==========================================

    const handleRefresh = async () => {

        try {

            setRefreshing(true);
            setError("");


            await loadFilterData();

            await loadAttendance();

        } catch (err) {

            console.error(
                "Refresh Admin Reports Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to refresh reports."
            );

        } finally {

            setRefreshing(false);
        }
    };


    // ==========================================
    // TEACHER FILTER
    // ==========================================

    
    // ==========================================
    // OPTIMIZED EXCEL EXPORT
    // Attendance Matrix
    // ==========================================

    const handleDownloadExcel = async () => {

        try {

            if (!filteredAttendance.length) {
                setError(
                    "There are no attendance records to export."
                );
                return;
            }

            // Load XLSX only when the user actually downloads Excel.
            const XLSX = await import("xlsx");

            const workbook = XLSX.utils.book_new();

            const getExportDate = (record) => {

                if (!record?.date) {
                    return "";
                }

                const date = new Date(record.date);

                if (Number.isNaN(date.getTime())) {
                    return String(record.date).slice(0, 10);
                }

                return date.toISOString().slice(0, 10);
            };

            const formatDateHeader = (date) => {

                if (!date) {
                    return "";
                }

                const parsed = new Date(`${date}T00:00:00`);

                if (Number.isNaN(parsed.getTime())) {
                    return date;
                }

                return parsed.toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                    }
                );
            };

            const cleanSheetName = (value) => {

                return String(value || "Unknown")
                    .replace(/[\\/:*?[\]]/g, "_")
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 31);
            };

            const getStatus = (student) => {

                const status = String(
                    getStudentStatus(student) || ""
                )
                    .trim()
                    .toLowerCase();

                if (status === "present") {
                    return "P";
                }

                if (status === "absent") {
                    return "A";
                }

                return "—";
            };

            const getStudentKey = (student, index) => {
                return String(
                    getStudentId(
                        student,
                        `student-${index}`
                    )
                );
            };

            // ==========================================
            // GROUP ATTENDANCE BY CLASS
            // ==========================================

            const classGroups = new Map();

            filteredAttendance.forEach((record) => {

                const className =
                    getClassName(record) ||
                    "Unknown Class";

                const classKey =
                    String(
                        getClassId(record) ||
                        className
                    );

                const date = getExportDate(record);

                if (!date) {
                    return;
                }

                if (!classGroups.has(classKey)) {

                    classGroups.set(
                        classKey,
                        {
                            className,
                            teacherNames: new Set(),
                            dates: new Set(),
                            students: new Map(),
                        }
                    );

                }

                const group = classGroups.get(classKey);

                group.dates.add(date);

                const teacherName =
                    getTeacherName(record);

                if (teacherName) {
                    group.teacherNames.add(teacherName);
                }

                const students =
                    getStudentRecords(record);

                students.forEach((student, index) => {

                    const studentKey =
                        getStudentKey(
                            student,
                            index
                        );

                    if (!group.students.has(studentKey)) {

                        group.students.set(
                            studentKey,
                            {
                                rollNo:
                                    getStudentRollNo(student),
                                name:
                                    getStudentName(student),
                                attendance: {},
                            }
                        );

                    }

                    group.students.get(
                        studentKey
                    ).attendance[date] =
                        getStatus(student);

                });

            });

            if (!classGroups.size) {

                setError(
                    "No attendance data was found for export."
                );

                return;
            }

            // ==========================================
            // SUMMARY DATA
            // ==========================================

            const summaryRows = [];

            let overallPresent = 0;
            let overallAbsent = 0;
            let overallNotMarked = 0;
            let overallStudentDays = 0;

            const usedSheetNames = new Set();

            // ==========================================
            // CREATE CLASS SHEETS
            // ==========================================

            classGroups.forEach((group) => {

                const dates =
                    Array.from(group.dates).sort();

                const students =
                    Array.from(
                        group.students.values()
                    ).sort((a, b) => {

                        const rollA = Number(a.rollNo);
                        const rollB = Number(b.rollNo);

                        if (
                            !Number.isNaN(rollA) &&
                            !Number.isNaN(rollB)
                        ) {
                            return rollA - rollB;
                        }

                        return String(
                            a.rollNo || ""
                        ).localeCompare(
                            String(b.rollNo || ""),
                            undefined,
                            { numeric: true }
                        );

                    });

                const teacherName =
                    group.teacherNames.size === 0
                        ? "Not Assigned"
                        : group.teacherNames.size === 1
                            ? Array.from(
                                group.teacherNames
                            )[0]
                            : "Multiple Teachers";

                // ==========================================
                // SHEET NAME
                // ==========================================

                const baseName =
                    cleanSheetName(
                        group.className
                    ) || "Class";

                let sheetName = baseName;
                let counter = 2;

                while (
                    usedSheetNames.has(sheetName) ||
                    sheetName === "Summary"
                ) {

                    const suffix = `_${counter}`;

                    sheetName =
                        baseName.slice(
                            0,
                            31 - suffix.length
                        ) + suffix;

                    counter++;
                }

                usedSheetNames.add(sheetName);

                // ==========================================
                // CLASS MATRIX
                // ==========================================

                const rows = [

                    ["ATTENDANCE REPORT"],

                    [
                        "Class",
                        group.className
                    ],

                    [
                        "Teacher",
                        teacherName
                    ],

                    [
                        "Attendance Dates",
                        `${dates[0]} to ${dates[dates.length - 1]}`
                    ],

                    [],

                ];

                const headers = [
                    "Roll No",
                    "Student Name",
                    ...dates.map(formatDateHeader),
                    "Present",
                    "Absent",
                    "Not Marked",
                    "Attendance %",
                ];

                rows.push(headers);

                let classPresent = 0;
                let classAbsent = 0;
                let classNotMarked = 0;

                students.forEach((student) => {

                    let present = 0;
                    let absent = 0;
                    let notMarked = 0;

                    const dailyStatus =
                        dates.map((date) => {

                            const status =
                                student.attendance[date] ||
                                "—";

                            if (status === "P") {
                                present++;
                            } else if (status === "A") {
                                absent++;
                            } else {
                                notMarked++;
                            }

                            return status;

                        });

                    const marked =
                        present + absent;

                    const percentage =
                        marked > 0
                            ? `${(
                                present / marked * 100
                            ).toFixed(2)}%`
                            : "0.00%";

                    rows.push([
                        student.rollNo,
                        student.name,
                        ...dailyStatus,
                        present,
                        absent,
                        notMarked,
                        percentage,
                    ]);

                    classPresent += present;
                    classAbsent += absent;
                    classNotMarked += notMarked;

                });

                overallPresent += classPresent;
                overallAbsent += classAbsent;
                overallNotMarked += classNotMarked;
                overallStudentDays +=
                    students.length * dates.length;

                const worksheet =
                    XLSX.utils.aoa_to_sheet(rows);

                worksheet["!cols"] = [
                    { wch: 12 },
                    { wch: 28 },
                    ...dates.map(() => ({
                        wch: 12
                    })),
                    { wch: 10 },
                    { wch: 10 },
                    { wch: 12 },
                    { wch: 16 },
                ];

                worksheet["!freeze"] = {
                    xSplit: 2,
                    ySplit: 6
                };

                const lastColumn =
                    XLSX.utils.encode_col(
                        headers.length - 1
                    );

                worksheet["!autofilter"] = {
                    ref:
                        `A6:${lastColumn}${rows.length}`
                };

                XLSX.utils.book_append_sheet(
                    workbook,
                    worksheet,
                    sheetName
                );

                // ==========================================
                // DAILY SUMMARY
                // ==========================================

                dates.forEach((date) => {

                    let present = 0;
                    let absent = 0;
                    let notMarked = 0;

                    students.forEach((student) => {

                        const status =
                            student.attendance[date] ||
                            "—";

                        if (status === "P") {
                            present++;
                        } else if (status === "A") {
                            absent++;
                        } else {
                            notMarked++;
                        }

                    });

                    const marked =
                        present + absent;

                    const percentage =
                        marked > 0
                            ? `${(
                                present / marked * 100
                            ).toFixed(2)}%`
                            : "0.00%";

                    summaryRows.push([
                        group.className,
                        teacherName,
                        date,
                        students.length,
                        present,
                        absent,
                        notMarked,
                        percentage,
                    ]);

                });

            });

            // ==========================================
            // SUMMARY SHEET
            // ==========================================

            const overallMarked =
                overallPresent +
                overallAbsent;

            const overallPercentage =
                overallMarked > 0
                    ? `${(
                        overallPresent /
                        overallMarked *
                        100
                    ).toFixed(2)}%`
                    : "0.00%";

            const summarySheetRows = [

                [
                    "ATTENDANCE REPORT SUMMARY"
                ],

                [],

                [
                    "Class Filter",
                    selectedClass === "all"
                        ? "All Classes"
                        : (
                            filteredAttendance[0]
                                ? getClassName(
                                    filteredAttendance[0]
                                )
                                : "Selected Class"
                        )
                ],

                [
                    "Teacher Filter",
                    selectedTeacher === "all"
                        ? "All Teachers"
                        : (
                            filteredAttendance[0]
                                ? getTeacherName(
                                    filteredAttendance[0]
                                )
                                : "Selected Teacher"
                        )
                ],

                [
                    "Generated",
                    new Date().toLocaleString()
                ],

                [],

                [
                    "Class",
                    "Teacher",
                    "Date",
                    "Total Students",
                    "Present",
                    "Absent",
                    "Not Marked",
                    "Attendance %",
                ],

                ...summaryRows,

                [],

                [
                    "Overall",
                    "",
                    "",
                    overallStudentDays,
                    overallPresent,
                    overallAbsent,
                    overallNotMarked,
                    overallPercentage,
                ],

            ];

            const summaryWorksheet =
                XLSX.utils.aoa_to_sheet(
                    summarySheetRows
                );

            summaryWorksheet["!cols"] = [
                { wch: 18 },
                { wch: 24 },
                { wch: 14 },
                { wch: 18 },
                { wch: 12 },
                { wch: 12 },
                { wch: 14 },
                { wch: 18 },
            ];

            summaryWorksheet["!freeze"] = {
                ySplit: 7
            };

            if (summaryRows.length > 0) {

                summaryWorksheet["!autofilter"] = {
                    ref:
                        `A7:H${7 + summaryRows.length}`
                };

            }

            XLSX.utils.book_append_sheet(
                workbook,
                summaryWorksheet,
                "Summary",
                0
            );

            // ==========================================
            // FILE NAME
            // ==========================================

            const allDates =
                filteredAttendance
                    .map(getExportDate)
                    .filter(Boolean)
                    .sort();

            const firstDate =
                allDates[0] || "report";

            const lastDate =
                allDates[allDates.length - 1] ||
                firstDate;

            const fileName =
                firstDate === lastDate
                    ? `Attendance_Report_${firstDate}.xlsx`
                    : `Attendance_Report_${firstDate}_to_${lastDate}.xlsx`;

            XLSX.writeFile(
                workbook,
                fileName
            );

            setError("");

        } catch (err) {

            console.error(
                "Optimized Excel Export Error:",
                err
            );

            setError(
                "Unable to export attendance report."
            );

        }

    };

const filteredAttendance =
        useMemo(() => {

            return attendanceData.filter(
                (record) => {

                    if (
                        selectedTeacher !==
                        "all"
                    ) {

                        if (
                            getTeacherId(
                                record
                            ) !==
                            String(
                                selectedTeacher
                            )
                        ) {

                            return false;
                        }
                    }

                    return true;
                }
            );

        }, [
            attendanceData,
            selectedTeacher,
        ]);


    // ==========================================
    // SUMMARY
    // ==========================================

    const summary =
        useMemo(() => {

            let present = 0;
            let absent = 0;

            const studentIds =
                new Set();


            filteredAttendance.forEach(
                (record) => {

                    const students =
                        getStudentRecords(
                            record
                        );


                    students.forEach(
                        (
                            student,
                            index
                        ) => {

                            const studentId =
                                getStudentId(
                                    student,
                                    index
                                );


                            studentIds.add(
                                String(
                                    studentId
                                )
                            );


                            const status =
                                getStudentStatus(
                                    student
                                );


                            if (
                                status ===
                                "present"
                            ) {
                                present++;
                            }


                            if (
                                status ===
                                "absent"
                            ) {
                                absent++;
                            }
                        }
                    );
                }
            );


            const total =
                present +
                absent;


            const percentage =
                total > 0
                    ? (
                          present /
                          total
                      ) * 100
                    : 0;


            return {

                totalStudents:
                    studentIds.size,

                attendanceDays:
                    filteredAttendance.length,

                present,

                absent,

                percentage,
            };

        }, [
            filteredAttendance,
        ]);


    // ==========================================
    // CLASS REPORTS
    // ==========================================

    const classReports =
        useMemo(() => {

            const grouped = {};


            filteredAttendance.forEach(
                (record) => {

                    const classId =
                        getClassId(
                            record
                        ) ||
                        getClassName(
                            record
                        );


                    if (
                        !grouped[classId]
                    ) {

                        grouped[classId] = {

                            classId,

                            className:
                                getClassName(
                                    record
                                ),

                            teacherName:
                                getTeacherName(
                                    record
                                ),

                            days:
                                0,

                            present:
                                0,

                            absent:
                                0,
                        };
                    }


                    grouped[
                        classId
                    ].days++;


                    const students =
                        getStudentRecords(
                            record
                        );


                    students.forEach(
                        (student) => {

                            const status =
                                getStudentStatus(
                                    student
                                );


                            if (
                                status ===
                                "present"
                            ) {

                                grouped[
                                    classId
                                ].present++;
                            }


                            if (
                                status ===
                                "absent"
                            ) {

                                grouped[
                                    classId
                                ].absent++;
                            }
                        }
                    );
                }
            );


            return Object.values(
                grouped
            ).map(
                (item) => {

                    const total =
                        item.present +
                        item.absent;


                    const percentage =
                        total > 0
                            ? (
                                  item.present /
                                  total
                              ) * 100
                            : 0;


                    return {
                        ...item,
                        percentage,
                    };
                }
            );

        }, [
            filteredAttendance,
        ]);


    // ==========================================
    // ATTENDANCE ACTIVITY
    // ==========================================

    const attendanceActivity =
        useMemo(() => {

            return filteredAttendance
                .map(
                    (record) => {

                        const students =
                            getStudentRecords(
                                record
                            );


                        let present = 0;
                        let absent = 0;


                        students.forEach(
                            (student) => {

                                const status =
                                    getStudentStatus(
                                        student
                                    );


                                if (
                                    status ===
                                    "present"
                                ) {
                                    present++;
                                }


                                if (
                                    status ===
                                    "absent"
                                ) {
                                    absent++;
                                }
                            }
                        );


                        return {

                            ...record,

                            totalStudents:
                                students.length,

                            present,

                            absent,
                        };
                    }
                );

        }, [
            filteredAttendance,
        ]);


    // ==========================================
    // PERCENTAGE CLASS
    // ==========================================

    const getPercentageClass = (
        percentage
    ) => {

        if (
            percentage >= 75
        ) {
            return "percentage-good";
        }


        if (
            percentage >= 50
        ) {
            return "percentage-warning";
        }


        return "percentage-danger";
    };


    // ==========================================
    // CLEAR FILTERS
    // ==========================================

    const clearFilters = () => {

        setSelectedClass("all");

        setSelectedTeacher("all");

        setSelectedDate("");
    };


    // ==========================================
    // FILTER ACTIVE CHECK
    // ==========================================

    const hasActiveFilters =
        selectedClass !== "all" ||
        selectedTeacher !== "all" ||
        selectedDate !== "";


    // ==========================================
    // SELECTED CLASS NAME
    // ==========================================

    const selectedClassName =
        selectedClass === "all"
            ? "All Classes"
            : classes.find(
                  (item) =>
                      String(
                          item._id
                      ) ===
                      String(
                          selectedClass
                      )
              )?.className ||
              "Selected Class";


    // ==========================================
    // SELECTED TEACHER NAME
    // ==========================================

    const selectedTeacherName =
        selectedTeacher === "all"
            ? "All Teachers"
            : teachers.find(
                  (teacher) =>
                      String(
                          teacher._id
                      ) ===
                      String(
                          selectedTeacher
                      )
              )?.name ||
              "Selected Teacher";


    // ==========================================
    // LOADING
    // ==========================================

    if (
        loading &&
        attendanceData.length === 0
    ) {

        return (

            <div className="reports-page">

                <div className="reports-loading">

                    Loading admin reports...

                </div>

            </div>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="reports-page">


            {/* ======================================
                HEADER
            ====================================== */}

            <div className="reports-header">

                <div>

                    <p className="reports-label">
                        ADMIN REPORTS
                    </p>


                    <h1>
                        Attendance Reports
                    </h1>


                    <p className="reports-description">
                        View attendance performance by
                        class and date.
                    </p>

                </div>


                <button
                    className="refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >

                    <RefreshCw
                        className={
                            refreshing
                                ? "refresh-spinning"
                                : ""
                        }
                    />


                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"
                    }

                </button>
                <button
                    type="button"
                    className="refresh-button"
                    onClick={handleDownloadExcel}
                    disabled={
                        refreshing ||
                        loading ||
                        filteredAttendance.length === 0
                    }
                    title="Download attendance report as Excel"
                >

                    <Download />

                    Download Excel

                </button>


            </div>


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (

                <div className="reports-error">

                    <strong>
                        Unable to load reports
                    </strong>


                    <span>
                        {error}
                    </span>

                </div>
            )}


            {/* ======================================
                FILTER CARD
            ====================================== */}

            <div className="admin-filter-card">

                <div className="admin-filter-header">

                    <div className="admin-filter-heading">

                        <div className="admin-filter-icon">
                            <Filter />
                        </div>


                        <div>

                            <h2>
                                Report Filters
                            </h2>

                            <p>
                                Narrow down attendance
                                records by class, date,
                                or teacher.
                            </p>

                        </div>

                    </div>


                    {hasActiveFilters && (

                        <button
                            type="button"
                            className="clear-filter-button"
                            onClick={clearFilters}
                        >

                            <X />

                            Clear Filters

                        </button>

                    )}

                </div>


                <div className="admin-filter-divider" />


                <div className="admin-filter-grid">


                    {/* ==================================
                        CLASS
                    ================================== */}

                    <div className="admin-filter-field">

                        <label htmlFor="report-class">

                            <span className="filter-label-icon">
                                <Users />
                            </span>

                            Class

                        </label>


                        <div className="filter-input-wrapper">

                            <select
                                id="report-class"
                                value={
                                    selectedClass
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSelectedClass(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="all">
                                    All Classes
                                </option>


                                {classes.map(
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
                                                classItem.className ||
                                                classItem.name
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>


                    {/* ==================================
                        DATE
                    ================================== */}

                    <div className="admin-filter-field">

                        <label htmlFor="report-date">

                            <span className="filter-label-icon">
                                <CalendarDays />
                            </span>

                            Date

                        </label>


                        <div className="filter-input-wrapper">

                            <NepaliCalendar
                                value={selectedDate}
                                onChange={setSelectedDate}
                                placeholder="Select report date"
/>

                        </div>

                    </div>


                    {/* ==================================
                        TEACHER
                    ================================== */}

                    <div className="admin-filter-field">

                        <label htmlFor="report-teacher">

                            <span className="filter-label-icon">
                                <Presentation />
                            </span>

                            Teacher

                        </label>


                        <div className="filter-input-wrapper">

                            <select
                                id="report-teacher"
                                value={
                                    selectedTeacher
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSelectedTeacher(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="all">
                                    All Teachers
                                </option>


                                {teachers.map(
                                    (teacher) => (

                                        <option
                                            key={
                                                teacher._id
                                            }
                                            value={
                                                teacher._id
                                            }
                                        >

                                            {
                                                teacher.name ||
                                                teacher.email
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    ACTIVE FILTERS
                ================================== */}

                {hasActiveFilters && (

                    <div className="active-filter-row">

                        <span className="active-filter-label">
                            Active filters
                        </span>


                        {selectedClass !== "all" && (

                            <span className="filter-chip">

                                <Users />

                                {selectedClassName}

                            </span>

                        )}


                        {selectedDate && (

                            <span className="filter-chip">

                                <CalendarDays />

                                {(() => {
                                    const parts = String(selectedDate || "").split("-");
                                    if (parts.length !== 3) return selectedDate;
                                    const months = [
                                        "Baisakh", "Jestha", "Ashadh", "Shrawan",
                                        "Bhadra", "Ashwin", "Kartik", "Mangsir",
                                        "Poush", "Magh", "Falgun", "Chaitra"
                                    ];
                                    return `${Number(parts[2])} ${months[Number(parts[1]) - 1]} ${parts[0]}`;
                                })()}

                            </span>

                        )}


                        {selectedTeacher !== "all" && (

                            <span className="filter-chip">

                                <Presentation />

                                {selectedTeacherName}

                            </span>

                        )}

                    </div>

                )}

            </div>


            {/* ======================================
                SUMMARY
            ====================================== */}

            <div className="summary-grid">


                <div className="summary-card">

                    <div className="summary-icon">
                        <Users />
                    </div>


                    <div>

                        <span>
                            Students
                        </span>


                        <strong>
                            {
                                summary.totalStudents
                            }
                        </strong>

                    </div>

                </div>


                <div className="summary-card">

                    <div className="summary-icon">
                        <BarChart3 />
                    </div>


                    <div>

                        <span>
                            Attendance Days
                        </span>


                        <strong>
                            {
                                summary.attendanceDays
                            }
                        </strong>

                    </div>

                </div>


                <div className="summary-card">

                    <div className="summary-icon">
                        <CircleCheck />
                    </div>


                    <div>

                        <span>
                            Present
                        </span>


                        <strong>
                            {
                                summary.present
                            }
                        </strong>

                    </div>

                </div>


                <div className="summary-card">

                    <div className="summary-icon">
                        <CircleX />
                    </div>


                    <div>

                        <span>
                            Absent
                        </span>


                        <strong>
                            {
                                summary.absent
                            }
                        </strong>

                    </div>

                </div>


                <div className="summary-card">

                    <div className="summary-icon">
                        <Percent />
                    </div>


                    <div>

                        <span>
                            Overall Attendance
                        </span>


                        <strong
                            className={
                                getPercentageClass(
                                    summary.percentage
                                )
                            }
                        >

                            {
                                summary.percentage.toFixed(
                                    1
                                )
                            }%

                        </strong>

                    </div>

                </div>

            </div>


            {/* ======================================
                CLASS REPORTS
            ====================================== */}

            <div className="student-report-card">

                <div className="section-heading">

                    <div>

                        <p className="card-label">
                            CLASS PERFORMANCE
                        </p>


                        <h2>
                            Class Reports
                        </h2>

                    </div>

                </div>


                {classReports.length === 0 ? (

                    <div className="report-empty">

                        <BarChart3 />

                        <h3>
                            No attendance records
                        </h3>

                        <p>
                            No attendance records match
                            the selected filters.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Class
                                    </th>

                                    <th>
                                        Teacher
                                    </th>

                                    <th>
                                        Attendance Days
                                    </th>

                                    <th>
                                        Present
                                    </th>

                                    <th>
                                        Absent
                                    </th>

                                    <th>
                                        Attendance
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {classReports.map(
                                    (report) => (

                                        <tr
                                            key={
                                                report.classId
                                            }
                                        >

                                            <td>

                                                <strong>
                                                    {
                                                        report.className
                                                    }
                                                </strong>

                                            </td>


                                            <td>
                                                {
                                                    report.teacherName
                                                }
                                            </td>


                                            <td>
                                                {
                                                    report.days
                                                }
                                            </td>


                                            <td className="present-cell">
                                                {
                                                    report.present
                                                }
                                            </td>


                                            <td className="absent-cell">
                                                {
                                                    report.absent
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        `percentage-badge ${
                                                            getPercentageClass(
                                                                report.percentage
                                                            )
                                                        }`
                                                    }
                                                >

                                                    {
                                                        report.percentage.toFixed(
                                                            1
                                                        )
                                                    }%

                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ======================================
                ATTENDANCE ACTIVITY
            ====================================== */}

            <div className="student-report-card">

                <div className="section-heading">

                    <div>

                        <p className="card-label">
                            ATTENDANCE ACTIVITY
                        </p>


                        <h2>
                            Attendance Records
                        </h2>

                    </div>

                </div>


                {attendanceActivity.length === 0 ? (

                    <div className="report-empty">

                        <BarChart3 />

                        <h3>
                            No records found
                        </h3>

                        <p>
                            Try changing the filters.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Class
                                    </th>

                                    <th>
                                        Teacher
                                    </th>

                                    <th>
                                        Students
                                    </th>

                                    <th>
                                        Present
                                    </th>

                                    <th>
                                        Absent
                                    </th>

                                    <th>
                                        Attendance
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {attendanceActivity.map(
                                    (
                                        record,
                                        index
                                    ) => {

                                        const total =
                                            record.present +
                                            record.absent;


                                        const percentage =
                                            total > 0
                                                ? (
                                                      record.present /
                                                      total
                                                  ) *
                                                  100
                                                : 0;


                                        return (

                                            <tr
                                                key={
                                                    record._id ||
                                                    record.attendanceId ||
                                                    index
                                                }
                                            >

                                                <td>
                                                    {
                                                        getDate(
                                                            record
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        getClassName(
                                                            record
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        getTeacherName(
                                                            record
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        record.totalStudents
                                                    }
                                                </td>


                                                <td className="present-cell">
                                                    {
                                                        record.present
                                                    }
                                                </td>


                                                <td className="absent-cell">
                                                    {
                                                        record.absent
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `percentage-badge ${
                                                                getPercentageClass(
                                                                    percentage
                                                                )
                                                            }`
                                                        }
                                                    >

                                                        {
                                                            percentage.toFixed(
                                                                1
                                                            )
                                                        }%

                                                    </span>

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

        </div>
    );
};


export default AdminReports;



