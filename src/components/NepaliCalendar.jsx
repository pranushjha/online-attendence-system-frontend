import { useEffect, useMemo, useRef, useState } from "react";
import {
    adToBs,
    bsToAd,
} from "@sbmdkl/nepali-date-converter";
import "./NepaliCalendar.css";

const MONTH_NAMES = [
    "Baisakh",
    "Jestha",
    "Ashadh",
    "Shrawan",
    "Bhadra",
    "Ashwin",
    "Kartik",
    "Mangsir",
    "Poush",
    "Magh",
    "Falgun",
    "Chaitra",
];

const WEEK_DAYS = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
];

const pad = (value) =>
    String(value).padStart(2, "0");

const parseBS = (value) => {
    const parts = String(value || "")
        .substring(0, 10)
        .split("-")
        .map(Number);

    if (
        parts.length !== 3 ||
        parts.some((part) => Number.isNaN(part))
    ) {
        return null;
    }

    return {
        year: parts[0],
        month: parts[1],
        day: parts[2],
    };
};

const formatBS = (year, month, day) =>
    `${year}-${pad(month)}-${pad(day)}`;

const getBSPartsFromAD = (date) => {
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    return adToBs(
        `${year}-${month}-${day}`
    );
};

const getTodayBS = () => {
    const today = new Date();

    return getBSPartsFromAD(today);
};

const getMonthDays = (year, month) => {
    const firstAD = bsToAd(
        formatBS(year, month, 1)
    );

    if (!firstAD) {
        return [];
    }

    const [adYear, adMonth, adDay] =
        firstAD.split("-").map(Number);

    const firstDate = new Date(
        adYear,
        adMonth - 1,
        adDay
    );

    const days = [];

    for (let i = 0; i < 40; i++) {
        const current = new Date(firstDate);
        current.setDate(
            firstDate.getDate() + i
        );

        const bsDate =
            getBSPartsFromAD(current);

        const parts = parseBS(bsDate);

        if (!parts) {
            continue;
        }

        if (
            parts.year !== year ||
            parts.month !== month
        ) {
            break;
        }

        days.push({
            day: parts.day,
            value: formatBS(
                parts.year,
                parts.month,
                parts.day
            ),
            date: current,
        });
    }

    return days;
};

export default function NepaliCalendar({
    value,
    onChange,
    placeholder = "Select date",
}) {
    const wrapperRef = useRef(null);

    const initialBS =
        parseBS(value) ||
        parseBS(getTodayBS());

    const [isOpen, setIsOpen] =
        useState(false);

    const [viewYear, setViewYear] =
        useState(initialBS.year);

    const [viewMonth, setViewMonth] =
        useState(initialBS.month);

    useEffect(() => {
        const selected =
            parseBS(value);

        if (selected) {
            setViewYear(selected.year);
            setViewMonth(selected.month);
        }
    }, [value]);

    useEffect(() => {
        const handleOutsideClick =
            (event) => {
                if (
                    wrapperRef.current &&
                    !wrapperRef.current.contains(
                        event.target
                    )
                ) {
                    setIsOpen(false);
                }
            };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    const days = useMemo(
        () =>
            getMonthDays(
                viewYear,
                viewMonth
            ),
        [viewYear, viewMonth]
    );

    const firstDayOffset =
        days.length > 0
            ? days[0].date.getDay()
            : 0;

    const calendarCells = [
        ...Array(firstDayOffset).fill(null),
        ...days,
    ];

    while (
        calendarCells.length % 7 !== 0
    ) {
        calendarCells.push(null);
    }

    const selectedDate =
        parseBS(value);

    const today =
        parseBS(getTodayBS());

    const handleSelect = (date) => {
        onChange(date);
        setIsOpen(false);
    };

    const goPreviousMonth = () => {
        if (viewMonth === 1) {
            setViewMonth(12);
            setViewYear(
                (year) => year - 1
            );
        } else {
            setViewMonth(
                (month) => month - 1
            );
        }
    };

    const goNextMonth = () => {
        if (viewMonth === 12) {
            setViewMonth(1);
            setViewYear(
                (year) => year + 1
            );
        } else {
            setViewMonth(
                (month) => month + 1
            );
        }
    };

    const goToday = () => {
        const todayBS =
            parseBS(getTodayBS());

        if (!todayBS) return;

        setViewYear(todayBS.year);
        setViewMonth(todayBS.month);

        handleSelect(
            formatBS(
                todayBS.year,
                todayBS.month,
                todayBS.day
            )
        );
    };

    const displayValue = () => {
        const selected =
            parseBS(value);

        if (!selected) {
            return "";
        }

        return `${selected.day} ${
            MONTH_NAMES[selected.month - 1]
        } ${selected.year}`;
    };

    return (
        <div
            className="bs-calendar-wrapper"
            ref={wrapperRef}
        >
            <button
                type="button"
                className={`bs-date-input ${
                    isOpen
                        ? "bs-date-input-open"
                        : ""
                }`}
                onClick={() =>
                    setIsOpen(
                        (open) => !open
                    )
                }
            >
                <span className="bs-calendar-icon">
                    📅
                </span>

                <span
                    className={
                        displayValue()
                            ? "bs-date-value"
                            : "bs-date-placeholder"
                    }
                >
                    {displayValue() ||
                        placeholder}
                </span>

                <span className="bs-calendar-arrow">
                    {isOpen ? "▲" : "▼"}
                </span>
            </button>

            {isOpen && (
                <div className="bs-calendar-popup">
                    <div className="bs-calendar-header">
                        <button
                            type="button"
                            className="bs-nav-button"
                            onClick={
                                goPreviousMonth
                            }
                            aria-label="Previous month"
                        >
                            ‹
                        </button>

                        <div className="bs-month-title">
                            <div className="bs-month-name">
                                {
                                    MONTH_NAMES[
                                        viewMonth - 1
                                    ]
                                }
                            </div>

                            <div className="bs-year-name">
                                {viewYear}
                            </div>
                        </div>

                        <button
                            type="button"
                            className="bs-nav-button"
                            onClick={
                                goNextMonth
                            }
                            aria-label="Next month"
                        >
                            ›
                        </button>
                    </div>

                    <div className="bs-weekdays">
                        {WEEK_DAYS.map(
                            (day) => (
                                <div
                                    key={day}
                                    className="bs-weekday"
                                >
                                    {day}
                                </div>
                            )
                        )}
                    </div>

                    <div className="bs-days-grid">
                        {calendarCells.map(
                            (item, index) => {
                                if (!item) {
                                    return (
                                        <div
                                            key={`empty-${index}`}
                                            className="bs-day empty"
                                        />
                                    );
                                }

                                const itemParts =
                                    parseBS(
                                        item.value
                                    );

                                const isSelected =
                                    selectedDate &&
                                    itemParts &&
                                    selectedDate.year ===
                                        itemParts.year &&
                                    selectedDate.month ===
                                        itemParts.month &&
                                    selectedDate.day ===
                                        itemParts.day;

                                const isToday =
                                    today &&
                                    itemParts &&
                                    today.year ===
                                        itemParts.year &&
                                    today.month ===
                                        itemParts.month &&
                                    today.day ===
                                        itemParts.day;

                                return (
                                    <button
                                        type="button"
                                        key={item.value}
                                        className={`bs-day ${
                                            isSelected
                                                ? "selected"
                                                : ""
                                        } ${
                                            isToday
                                                ? "today"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleSelect(
                                                item.value
                                            )
                                        }
                                    >
                                        {item.day}
                                    </button>
                                );
                            }
                        )}
                    </div>

                    <div className="bs-calendar-footer">
                        <button
                            type="button"
                            className="bs-today-button"
                            onClick={goToday}
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
