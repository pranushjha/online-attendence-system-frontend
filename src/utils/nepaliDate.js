import {
    adToBs,
    bsToAd,
} from "@sbmdkl/nepali-date-converter";


// ==========================================
// AD → BS
// Example:
// 2026-09-02 → 2083-05-17
// ==========================================

export const toNepaliDate = (date) => {
    if (!date) {
        return "";
    }

    try {
        let dateString;

        if (date instanceof Date) {
            const year = date.getFullYear();

            const month = String(
                date.getMonth() + 1
            ).padStart(2, "0");

            const day = String(
                date.getDate()
            ).padStart(2, "0");

            dateString = `${year}-${month}-${day}`;
        } else {
            dateString = String(date).substring(0, 10);
        }

        return adToBs(dateString);

    } catch (error) {
        console.error(
            "Nepali date conversion error:",
            error
        );

        return "";
    }
};


// ==========================================
// BS → AD
// Example:
// 2083-05-17 → 2026-09-02
// ==========================================

export const toEnglishDate = (date) => {
    if (!date) {
        return "";
    }

    try {
        return bsToAd(
            String(date).substring(0, 10)
        );

    } catch (error) {
        console.error(
            "English date conversion error:",
            error
        );

        return "";
    }
};


// ==========================================
// FORMAT BS DATE
// English digits only
// Example:
// 2083-05-17
// ==========================================

export const formatNepaliDate = (date) => {
    const bsDate = toNepaliDate(date);

    if (!bsDate) {
        return "";
    }

    const [
        year,
        month,
        day,
    ] = bsDate.split("-");

    return `${year}-${month}-${day}`;
};


