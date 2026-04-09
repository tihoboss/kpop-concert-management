const { ValidationUtils } = require('../../utils');

describe('ValidationUtils', () => {

    describe('isValidEmail', () => {
        test('должен вернуть true для корректного email', () => {
            expect(ValidationUtils.isValidEmail('user@example.com')).toBe(true);
            expect(ValidationUtils.isValidEmail('admin@jype.com')).toBe(true);
            expect(ValidationUtils.isValidEmail('test.user@domain.co.kr')).toBe(true);
        });

        test('должен вернуть false для некорректного email', () => {
            expect(ValidationUtils.isValidEmail('invalid')).toBe(false);
            expect(ValidationUtils.isValidEmail('user@')).toBe(false);
            expect(ValidationUtils.isValidEmail('@domain.com')).toBe(false);
            expect(ValidationUtils.isValidEmail('')).toBe(false);
            expect(ValidationUtils.isValidEmail(null)).toBe(false);
        });
    });

    describe('isValidPassword', () => {
        test('должен вернуть true для пароля 6+ символов', () => {
            expect(ValidationUtils.isValidPassword('123456')).toBe(true);
            expect(ValidationUtils.isValidPassword('demo123')).toBe(true);
            expect(ValidationUtils.isValidPassword('verylongpassword')).toBe(true);
        });

        test('должен вернуть false для короткого пароля', () => {
            expect(ValidationUtils.isValidPassword('12345')).toBe(false);
            expect(ValidationUtils.isValidPassword('')).toBe(false);
            expect(ValidationUtils.isValidPassword(null)).toBe(false);
        });
    });

    describe('isValidDateRange', () => {
        test('должен вернуть true когда дата окончания после даты начала', () => {
            expect(ValidationUtils.isValidDateRange('2024-12-10T18:00', '2024-12-10T22:00')).toBe(true);
            expect(ValidationUtils.isValidDateRange('2024-01-01', '2024-12-31')).toBe(true);
        });

        test('должен вернуть false когда дата окончания раньше даты начала', () => {
            expect(ValidationUtils.isValidDateRange('2024-12-10T22:00', '2024-12-10T18:00')).toBe(false);
            expect(ValidationUtils.isValidDateRange('2024-12-10', '2024-12-10')).toBe(false);
        });
    });

    describe('getEventTypeText', () => {
        test('должен вернуть русское название для типа мероприятия', () => {
            expect(ValidationUtils.getEventTypeText('concert')).toBe('Концерт');
            expect(ValidationUtils.getEventTypeText('fanmeeting')).toBe('Фан-встреча');
            expect(ValidationUtils.getEventTypeText('showcase')).toBe('Презентация');
            expect(ValidationUtils.getEventTypeText('rehearsal')).toBe('Репетиция');
            expect(ValidationUtils.getEventTypeText('recording')).toBe('Запись');
        });

        test('должен вернуть исходное значение для неизвестного типа', () => {
            expect(ValidationUtils.getEventTypeText('unknown')).toBe('unknown');
        });
    });

    describe('getStatusText', () => {
        test('должен вернуть русское название для статуса', () => {
            expect(ValidationUtils.getStatusText('planned')).toBe('Запланировано');
            expect(ValidationUtils.getStatusText('confirmed')).toBe('Подтверждено');
            expect(ValidationUtils.getStatusText('completed')).toBe('Завершено');
            expect(ValidationUtils.getStatusText('cancelled')).toBe('Отменено');
        });
    });

    describe('isUpcoming', () => {
        test('должен вернуть true для будущих дат', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7);
            expect(ValidationUtils.isUpcoming(futureDate.toISOString())).toBe(true);
        });

        test('должен вернуть false для прошедших дат', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 7);
            expect(ValidationUtils.isUpcoming(pastDate.toISOString())).toBe(false);
        });
    });

    describe('getMemberCountCategory', () => {
        test('должен вернуть small для 4 и менее участников', () => {
            expect(ValidationUtils.getMemberCountCategory(1)).toBe('small');
            expect(ValidationUtils.getMemberCountCategory(4)).toBe('small');
        });

        test('должен вернуть medium для 5-7 участников', () => {
            expect(ValidationUtils.getMemberCountCategory(5)).toBe('medium');
            expect(ValidationUtils.getMemberCountCategory(7)).toBe('medium');
        });

        test('должен вернуть large для 8+ участников', () => {
            expect(ValidationUtils.getMemberCountCategory(8)).toBe('large');
            expect(ValidationUtils.getMemberCountCategory(13)).toBe('large');
        });
    });
});