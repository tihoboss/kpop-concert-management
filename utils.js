class ValidationUtils {
    static isValidEmail(email) {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPassword(password) {
        if (!password) return false;
        return password.length >= 6;
    }

    static isValidPhone(phone) {
        if (!phone) return true;
        const phoneRegex = /^[\+\d\s\-\(\)]{10,20}$/;
        return phoneRegex.test(phone);
    }

    static isValidDateRange(startDate, endDate) {
        if (!startDate || !endDate) return false;
        const start = new Date(startDate);
        const end = new Date(endDate);
        return end > start;
    }

    static sanitizeString(str) {
        if (!str) return '';
        return str.trim().replace(/[<>]/g, '');
    }

    static getEventTypeText(type) {
        const types = {
            'concert': 'Концерт',
            'fanmeeting': 'Фан-встреча',
            'showcase': 'Презентация',
            'rehearsal': 'Репетиция',
            'recording': 'Запись'
        };
        return types[type] || type;
    }

    static getStatusText(status) {
        const statuses = {
            'planned': 'Запланировано',
            'confirmed': 'Подтверждено',
            'completed': 'Завершено',
            'cancelled': 'Отменено'
        };
        return statuses[status] || status;
    }

    static isUpcoming(eventDate) {
        const now = new Date();
        const event = new Date(eventDate);
        return event > now;
    }

    static canBeCompleted(eventDate) {
        const now = new Date();
        const event = new Date(eventDate);
        return event <= now;
    }

    static getMemberCountCategory(count) {
        if (count <= 4) return 'small';
        if (count <= 7) return 'medium';
        return 'large';
    }

    static getDebutYearCategory(year) {
        const currentYear = new Date().getFullYear();
        const yearsSinceDebut = currentYear - year;
        if (yearsSinceDebut <= 2) return 'rookie';
        if (yearsSinceDebut <= 5) return 'established';
        return 'veteran';
    }
}

module.exports = { ValidationUtils };