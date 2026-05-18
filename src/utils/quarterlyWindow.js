/**
 * Quarterly Window Logic for GoalSync
 * 
 * Check-in windows:
 * - Q1: Only in July
 * - Q2: Only in October
 * - Q3: Only in January
 * - Q4: Only in March/April (Mar 15 - Apr 15)
 */

export const getQuarterlyWindow = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const date = now.getDate();

    // July (month 6)
    if (month === 6) {
        return { quarter: 'Q1', windowOpen: true, windowName: 'July (Q1)' };
    }

    // October (month 9)
    if (month === 9) {
        return { quarter: 'Q2', windowOpen: true, windowName: 'October (Q2)' };
    }

    // January (month 0)
    if (month === 0) {
        return { quarter: 'Q3', windowOpen: true, windowName: 'January (Q3)' };
    }

    // March/April Q4 window: Mar 15 - Apr 15
    if ((month === 2 && date >= 15) || (month === 3 && date <= 15)) {
        return { quarter: 'Q4', windowOpen: true, windowName: 'Mar 15 - Apr 15 (Q4)' };
    }

    // Outside all windows
    return { quarter: null, windowOpen: false, windowName: 'Quarterly check-in window closed' };
};

export const canSubmitCheckIn = () => {
    return getQuarterlyWindow().windowOpen;
};

export const getNextCheckInWindow = () => {
    const now = new Date();
    const month = now.getMonth();
    const date = now.getDate();
    const year = now.getFullYear();

    // If in July, next is October
    if (month === 6) {
        return new Date(year, 9, 1); // October 1
    }
    if (month < 6) {
        return new Date(year, 6, 1); // July 1
    }

    // If in October, next is January
    if (month === 9) {
        return new Date(year + 1, 0, 1); // January 1 next year
    }
    if (month < 9) {
        return new Date(year, 9, 1); // October 1 this year
    }

    // If in January, next is March 15
    if (month === 0) {
        return new Date(year, 2, 15); // March 15
    }
    if (month === 1) {
        return new Date(year, 2, 15); // March 15
    }

    // If in March/April window (before/during), next is July
    if (month === 2 || month === 3) {
        return new Date(year, 6, 1); // July 1
    }

    // Default fallback
    return new Date(year, 6, 1); // July 1
};

export const getWindowDescription = () => {
    const { quarter, windowOpen, windowName } = getQuarterlyWindow();

    if (!windowOpen) {
        const next = getNextCheckInWindow();
        const nextMonth = next.toLocaleString('default', { month: 'long', year: 'numeric' });
        return `${windowName}. Next window opens in ${nextMonth}.`;
    }

    return `Quarterly check-in window open: ${windowName}`;
};
