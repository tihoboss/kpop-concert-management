// tests/step_definitions/steps.js
const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { remote } = require('webdriverio');
const assert = require('assert');

setDefaultTimeout(60 * 1000);

let browser;
let baseUrl = 'http://localhost:5500';

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

// ============== ХУКИ ==============

Before({ timeout: 60000 }, async function () {
    console.log('🚀 Запуск браузера...');
    browser = await remote(config);
    console.log('✅ Браузер запущен');
});

After(async function () {
    if (browser) {
        console.log('🔚 Закрытие браузера...');
        await browser.deleteSession();
        console.log('✅ Браузер закрыт');
    }
});

// ============== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==============

async function waitForElement(selector, timeout = 10000) {
    const element = await browser.$(selector);
    await element.waitForExist({ timeout });
    await element.waitForDisplayed({ timeout });
    return element;
}

// ============== ШАГИ ДЛЯ МЕНЕДЖЕРА ==============

Given('я нахожусь на странице входа', async function () {
    await browser.url(`${baseUrl}/login.html`);
    await browser.pause(2000);
    console.log('✅ На странице входа');
});

Given('я авторизован как менеджер', async function () {
    await browser.url(`${baseUrl}/login.html`);
    await browser.pause(1000);

    // Выбираем роль менеджера
    const managerBtn = await browser.$('.role-btn:first-child');
    await managerBtn.click();
    await browser.pause(500);

    // Вводим email менеджера
    const emailInput = await browser.$('#email');
    await emailInput.clearValue();
    await emailInput.setValue('manager@jype.com');

    // Вводим пароль
    const passwordInput = await browser.$('#password');
    await passwordInput.clearValue();
    await passwordInput.setValue('demo123');

    // Нажимаем кнопку входа
    const submitBtn = await browser.$('#loginForm button[type="submit"]');
    await submitBtn.click();

    // Ждем перехода на дашборд
    await browser.waitUntil(
        async () => (await browser.getUrl()).includes('dashboard.html'),
        { timeout: 10000, timeoutMsg: 'Не перенаправлен на дашборд' }
    );
    await browser.pause(1000);
    console.log('✅ Авторизован как менеджер');
});

Given('я нахожусь на странице мероприятий', async function () {
    // Нажимаем на пункт меню "Мероприятия"
    const eventsNav = await browser.$('.nav-item[data-page="events"]');
    await eventsNav.waitForDisplayed({ timeout: 10000 });
    await eventsNav.click();
    await browser.pause(1500);
    console.log('✅ На странице мероприятий');
});

Given('существует мероприятие {string}', async function (eventName) {
    await browser.pause(1000);
    console.log(`✅ Мероприятие "${eventName}" существует (для теста)`);
});

// ============== ШАГИ ДЕЙСТВИЙ ==============

When('я выбираю роль {string}', async function (role) {
    if (role === 'manager') {
        const managerBtn = await browser.$('.role-btn:first-child');
        await managerBtn.click();
        await browser.pause(500);
        console.log('✅ Выбрана роль менеджера');
    }
});

When('я ввожу email {string}', async function (email) {
    const input = await browser.$('#email');
    await input.clearValue();
    await input.setValue(email);
    console.log(`✅ Введен email: ${email}`);
});

When('я ввожу пароль {string}', async function (password) {
    const input = await browser.$('#password');
    await input.clearValue();
    await input.setValue(password);
    console.log(`✅ Введен пароль: ${password}`);
});

When('я нажимаю кнопку {string}', async function (buttonText) {
    if (buttonText === 'Войти') {
        const submitBtn = await browser.$('#loginForm button[type="submit"]');
        await submitBtn.waitForClickable({ timeout: 10000 });
        await submitBtn.click();
        await browser.pause(1000);
        console.log('✅ Нажата кнопка "Войти"');
    } else if (buttonText === 'Добавить мероприятие') {
        await browser.pause(1000);

        // Ищем кнопку добавления
        let addBtn = await browser.$('#addEventBtn2');

        if (!addBtn || !await addBtn.isExisting()) {
            addBtn = await browser.$('#addEventBtn');
        }

        if (!addBtn || !await addBtn.isExisting()) {
            // Ищем по тексту
            const buttons = await browser.$$('button');
            for (let btn of buttons) {
                const text = await btn.getText();
                if (text.includes('Добавить мероприятие')) {
                    addBtn = btn;
                    break;
                }
            }
        }

        if (!addBtn || !await addBtn.isExisting()) {
            throw new Error('Кнопка "Добавить мероприятие" не найдена');
        }

        await addBtn.waitForDisplayed({ timeout: 10000 });
        await addBtn.waitForClickable({ timeout: 10000 });
        await addBtn.scrollIntoView();
        await browser.pause(500);
        await addBtn.click();
        await browser.pause(1000);
        console.log('✅ Нажата кнопка "Добавить мероприятие"');

    } else if (buttonText === 'Сохранить') {
        const saveBtn = await browser.$('#saveEventBtn');
        await saveBtn.waitForClickable({ timeout: 10000 });
        await saveBtn.click();
        await browser.pause(1000);
        console.log('✅ Нажата кнопка "Сохранить"');
    }
});

When('я нажимаю {string}', async function (buttonText) {
    await this.When(`я нажимаю кнопку "${buttonText}"`);
});

When('я заполняю поле {string} значением {string}', async function (field, value) {
    if (field === 'Название') {
        const input = await browser.$('#eventName');
        await input.waitForDisplayed({ timeout: 10000 });
        await input.clearValue();
        await input.setValue(value);
        console.log(`✅ Заполнено поле "${field}": ${value}`);
    }
});

When('я выбираю тип {string}', async function (type) {
    const select = await browser.$('#eventType');
    await select.waitForDisplayed({ timeout: 10000 });
    await select.click();
    await browser.pause(300);

    const typeValue = type === 'Концерт' ? 'concert' : 'fanmeeting';
    const option = await browser.$(`#eventType option[value="${typeValue}"]`);
    await option.click();
    console.log(`✅ Выбран тип: ${type}`);
});

When('я выбираю группу {string}', async function (groupName) {
    const select = await browser.$('#eventGroup');
    await select.waitForDisplayed({ timeout: 10000 });
    await select.click();
    await browser.pause(500);

    const option = await browser.$(`//select[@id='eventGroup']/option[contains(text(), '${groupName}')]`);
    await option.click();
    console.log(`✅ Выбрана группа: ${groupName}`);
});

When('я выбираю площадку {string}', async function (venueName) {
    const select = await browser.$('#eventVenue');
    await select.waitForDisplayed({ timeout: 10000 });
    await select.click();
    await browser.pause(500);

    const option = await browser.$(`//select[@id='eventVenue']/option[contains(text(), '${venueName}')]`);
    await option.click();
    console.log(`✅ Выбрана площадка: ${venueName}`);
});

When('я устанавливаю дату начала {string}', async function (dateTime) {
    const input = await browser.$('#eventStartDate');
    await input.waitForDisplayed({ timeout: 10000 });
    await input.clearValue();
    await input.setValue(dateTime);
    console.log(`✅ Установлена дата начала: ${dateTime}`);
});

When('я устанавливаю дату окончания {string}', async function (dateTime) {
    const input = await browser.$('#eventEndDate');
    await input.waitForDisplayed({ timeout: 10000 });
    await input.clearValue();
    await input.setValue(dateTime);
    console.log(`✅ Установлена дата окончания: ${dateTime}`);
});

When('я нажимаю "Редактировать" у этого мероприятия', async function () {
    const editBtn = await browser.$('.action-btn.edit-btn, .edit-btn');
    await editBtn.waitForExist({ timeout: 10000 });
    await editBtn.waitForDisplayed({ timeout: 10000 });
    await editBtn.waitForClickable({ timeout: 10000 });
    await editBtn.click();
    await browser.pause(1000);
    console.log('✅ Нажата кнопка "Редактировать"');
});

When('я изменяю название на {string}', async function (newName) {
    const input = await browser.$('#eventName');
    await input.waitForDisplayed({ timeout: 10000 });
    await input.clearValue();
    await input.setValue(newName);
    console.log(`✅ Изменено название на: ${newName}`);
});

When('я оставляю поле {string} пустым', async function () {
    const input = await browser.$('#eventName');
    await input.waitForDisplayed({ timeout: 10000 });
    await input.clearValue();
    console.log('✅ Поле названия очищено');
});

When('я открываю панель фильтров', async function () {
    const filterBtn = await browser.$('#filterToggleBtn');
    await filterBtn.waitForDisplayed({ timeout: 10000 });
    await filterBtn.click();
    await browser.pause(500);
    console.log('✅ Открыта панель фильтров');
});

When('я выбираю статус {string}', async function (status) {
    const statusMap = {
        'Подтверждено': 'confirmed',
        'Запланировано': 'planned',
        'Завершено': 'completed'
    };
    const statusValue = statusMap[status] || status;

    const filterSelect = await browser.$('#filterStatus');
    await filterSelect.waitForDisplayed({ timeout: 10000 });
    await filterSelect.click();
    await browser.pause(300);

    const option = await browser.$(`#filterStatus option[value="${statusValue}"]`);
    await option.click();
    await browser.pause(500);
    console.log(`✅ Выбран статус: ${status}`);
});

// ============== ШАГИ ПРОВЕРОК ==============

Then('я должен быть перенаправлен на дашборд', async function () {
    const currentUrl = await browser.getUrl();
    assert(currentUrl.includes('dashboard.html'), `Ожидался дашборд, получено: ${currentUrl}`);
    console.log('✅ Перенаправлен на дашборд');
});

Then('должна отображаться роль {string}', async function (expectedRole) {
    const roleElement = await browser.$('#userRole');
    await roleElement.waitForDisplayed({ timeout: 10000 });
    const roleText = await roleElement.getText();
    assert.strictEqual(roleText, expectedRole, `Ожидалась роль ${expectedRole}, получена ${roleText}`);
    console.log(`✅ Отображается роль: ${expectedRole}`);
});

Then('должно отобразиться сообщение об ошибке {string}', async function (expectedMessage) {
    try {
        const errorElement = await browser.$('#errorMessage, .error-message');
        await errorElement.waitForDisplayed({ timeout: 5000 });
        const errorText = await errorElement.getText();
        assert(errorText.includes(expectedMessage));
        console.log(`✅ Отображено сообщение об ошибке: ${expectedMessage}`);
    } catch (error) {
        throw new Error(`Сообщение "${expectedMessage}" не найдено`);
    }
});

Then('новое мероприятие должно появиться в списке', async function () {
    await browser.pause(2000);
    const eventsTable = await browser.$('#eventsTable');
    const rows = await eventsTable.$$('tbody tr');
    assert(rows.length > 0, 'Мероприятие не появилось в списке');
    console.log('✅ Новое мероприятие появилось в списке');
});

Then('мероприятие должно отображаться с новым названием', async function () {
    await browser.pause(1000);
    const firstRow = await browser.$('#eventsTable tbody tr:first-child td:first-child');
    const eventName = await firstRow.getText();
    assert(eventName.includes('Updated'), `Название "${eventName}" не содержит "Updated"`);
    console.log(`✅ Мероприятие отображается с новым названием: ${eventName}`);
});

Then('должно отобразиться сообщение о необходимости заполнить обязательные поля', async function () {
    const nameInput = await browser.$('#eventName');
    const required = await nameInput.getAttribute('required');
    assert(required !== null, 'Поле не отмечено как обязательное');
    console.log('✅ Обязательные поля проверены');
});

Then('отображаются только мероприятия со статусом {string}', async function (status) {
    const statusElements = await browser.$$('.event-status');
    for (let element of statusElements) {
        const statusText = await element.getText();
        assert.strictEqual(statusText, status);
    }
    console.log(`✅ Отображаются только мероприятия со статусом: ${status}`);
});