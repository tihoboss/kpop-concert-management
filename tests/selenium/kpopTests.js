const { remote } = require('webdriverio');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const EventsPage = require('../pages/EventsPage');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const config = {
    path: '/',
    port: 9515,
    capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
            binary: CHROME_PATH,
            args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080']
        }
    }
};

async function runTests() {
    console.log('🚀 Запуск Selenium тестов...\n');

    let browser;
    let testsPassed = 0;
    let testsFailed = 0;

    try {
        browser = await remote(config);
        const loginPage = new LoginPage(browser);
        const dashboardPage = new DashboardPage(browser);
        const eventsPage = new EventsPage(browser);

        // ========== ТЕСТ 1 ==========
        console.log('▶️ TC-LOGIN-001: Успешный вход менеджера');
        try {
            await loginPage.open();
            await loginPage.loginAsManager();

            const userName = await dashboardPage.getUserName();
            const userRole = await dashboardPage.getUserRole();

            if (userName.includes('Sergey') && userRole === 'Менеджер') {
                console.log('   ✅ ПРОЙДЕН\n');
                testsPassed++;
            } else {
                console.log('   ❌ НЕ ПРОЙДЕН\n');
                testsFailed++;
            }
        } catch (err) {
            console.log(`   ❌ ОШИБКА: ${err.message}\n`);
            testsFailed++;
        }

        // ========== ТЕСТ 2 ==========
        console.log('▶️ TC-LOGIN-002: Успешный вход администратора');
        try {
            await loginPage.open();
            await loginPage.loginAsAdmin();

            const userName = await dashboardPage.getUserName();
            const userRole = await dashboardPage.getUserRole();

            if (userName === 'Admin User' && userRole === 'Администратор') {
                console.log('   ✅ ПРОЙДЕН\n');
                testsPassed++;
            } else {
                console.log('   ❌ НЕ ПРОЙДЕН\n');
                testsFailed++;
            }
        } catch (err) {
            console.log(`   ❌ ОШИБКА: ${err.message}\n`);
            testsFailed++;
        }

        // ========== ТЕСТ 3 ==========
        console.log('▶️ TC-LOGIN-003: Успешный вход координатора');
        try {
            await loginPage.open();
            await loginPage.loginAsCoordinator();

            const userRole = await dashboardPage.getUserRole();

            if (userRole === 'Координатор') {
                console.log('   ✅ ПРОЙДЕН\n');
                testsPassed++;
            } else {
                console.log('   ❌ НЕ ПРОЙДЕН\n');
                testsFailed++;
            }
        } catch (err) {
            console.log(`   ❌ ОШИБКА: ${err.message}\n`);
            testsFailed++;
        }

        // ========== ТЕСТ 4 ==========
        console.log('▶️ TC-LOGIN-004: Неверный пароль');
        try {
            await loginPage.open();
            await loginPage.selectRole('manager');
            await loginPage.login('manager@jype.com', 'wrongpassword');

            const errorMessage = await loginPage.getErrorMessage();

            if (errorMessage.includes('Неверный пароль')) {
                console.log('   ✅ ПРОЙДЕН\n');
                testsPassed++;
            } else {
                console.log('   ❌ НЕ ПРОЙДЕН\n');
                testsFailed++;
            }
        } catch (err) {
            console.log(`   ❌ ОШИБКА: ${err.message}\n`);
            testsFailed++;
        }

        // ========== ТЕСТ 5 ==========
        console.log('▶️ TC-NAV-001: Навигация по разделам');
        try {
            await loginPage.open();
            await loginPage.loginAsAdmin();

            await dashboardPage.goToEvents();
            await browser.pause(500);

            await dashboardPage.goToGroups();
            await browser.pause(500);

            await dashboardPage.goToVenues();
            await browser.pause(500);

            await dashboardPage.goToTechTeams();
            await browser.pause(500);

            const currentUrl = await browser.getUrl();

            if (currentUrl.includes('dashboard.html')) {
                console.log('   ✅ ПРОЙДЕН\n');
                testsPassed++;
            } else {
                console.log('   ❌ НЕ ПРОЙДЕН\n');
                testsFailed++;
            }
        } catch (err) {
            console.log(`   ❌ ОШИБКА: ${err.message}\n`);
            testsFailed++;
        }

        // ========== ТЕСТ 6 ==========
        console.log('▶️ TC-EVENT-001: Создание мероприятия');
        try {
            await loginPage.open();
            await loginPage.loginAsAdmin();
            await dashboardPage.goToEvents();

            const eventCountBefore = await eventsPage.getEventCount();
            const uniqueSuffix = Date.now();

            await eventsPage.createEvent({
                name: `Тестовый концерт ${uniqueSuffix}`,
                event_type: 'concert',
                status: 'planned',
                start_date: '2025-12-15T19:00',
                end_date: '2025-12-15T22:00',
                group_id: '1',
                venue_id: '1',
                description: 'Автоматический тест'
            });

            const eventCountAfter = await eventsPage.getEventCount();

            if (eventCountAfter === eventCountBefore + 1) {
                console.log('   ✅ ПРОЙДЕН\n');
                testsPassed++;
            } else {
                console.log('   ❌ НЕ ПРОЙДЕН\n');
                testsFailed++;
            }
        } catch (err) {
            console.log(`   ❌ ОШИБКА: ${err.message}\n`);
            testsFailed++;
        }

        // ========== ТЕСТ 7 ==========
        console.log('▶️ TC-NAV-002: Выход из системы');
        try {
            await loginPage.open();
            await loginPage.loginAsAdmin();
            await dashboardPage.logout();

            const currentUrl = await browser.getUrl();

            if (currentUrl.includes('login.html')) {
                console.log('   ✅ ПРОЙДЕН\n');
                testsPassed++;
            } else {
                console.log('   ❌ НЕ ПРОЙДЕН\n');
                testsFailed++;
            }
        } catch (err) {
            console.log(`   ❌ ОШИБКА: ${err.message}\n`);
            testsFailed++;
        }

        // ========== ИТОГИ ==========
        console.log('═══════════════════════════════════════');
        console.log(`📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:`);
        console.log(`   ✅ Пройдено: ${testsPassed}`);
        console.log(`   ❌ Не пройдено: ${testsFailed}`);
        console.log(`   📈 Процент успеха: ${Math.round(testsPassed / (testsPassed + testsFailed) * 100)}%`);
        console.log('═══════════════════════════════════════');

    } catch (err) {
        console.error('❌ Критическая ошибка:', err.message);
    } finally {
        if (browser) {
            await browser.deleteSession();
        }
    }
}

// Запуск тестов
runTests();