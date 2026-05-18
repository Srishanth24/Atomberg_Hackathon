/**
 * Backend Quarterly Window Validation
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
        return { quarter: 'Q1', isOpen: true };
    }

    // October (month 9)
    if (month === 9) {
        return { quarter: 'Q2', isOpen: true };
    }

    // January (month 0)
    if (month === 0) {
        return { quarter: 'Q3', isOpen: true };
    }

    // March/April Q4 window: Mar 15 - Apr 15
    if ((month === 2 && date >= 15) || (month === 3 && date <= 15)) {
        return { quarter: 'Q4', isOpen: true };
    }

    return { quarter: null, isOpen: false };
};

export const validateCheckInWindow = () => {
    const { isOpen } = getQuarterlyWindow();
    return isOpen;
};

export const getCheckInWindowError = () => {
    const { quarter, isOpen } = getQuarterlyWindow();

    if (isOpen) {
        return null;
    }

    const now = new Date();
    const month = now.getMonth();

    if (month < 6) {
        return 'Check-in window for Q1 is July only. Please try again in July.';
    } else if (month === 6) {
        return 'Q1 check-in window is open (July).';
    } else if (month < 9) {
        return 'Check-in window for Q2 is October only. Please try again in October.';
    } else if (month === 9) {
        return 'Q2 check-in window is open (October).';
    } else if (month === 0) {
        return 'Q3 check-in window is open (January).';
    } else if (month < 2 || (month === 2 && new Date().getDate() < 15)) {
        return 'Check-in window for Q4 is March 15 - April 15 only.';
    } else if ((month === 2 && new Date().getDate() >= 15) || (month === 3 && new Date().getDate() <= 15)) {
        return 'Q4 check-in window is open (Mar 15 - Apr 15).';
    } else {
        return 'No quarterly check-in window is currently open. Windows are: July (Q1), October (Q2), January (Q3), Mar 15-Apr 15 (Q4).';
    }
};
