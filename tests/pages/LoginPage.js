const BasePage = require('./BasePage');

class LoginPage extends BasePage {
    constructor(driver) {
        super(driver);
        this.url = 'http://localhost:5500/login.html';
    }

    // Locators
    get emailInput() { return '#email'; }
    get passwordInput() { return '#password'; }
    get loginButton() { return '#loginForm button[type="submit"]'; }
    get roleManagerBtn() { return '.role-btn:first-child'; }
    get roleAdminBtn() { return '.role-btn:nth-child(2)'; }
    get roleCoordinatorBtn() { return '.role-btn:last-child'; }
    get errorMessage() { return '#errorMessage'; }
    get registerTab() { return '.tab:last-child'; }
    get companyNameInput() { return '#companyName'; }
    get adminFullNameInput() { return '#adminFullName'; }
    get adminEmailInput() { return '#adminEmail'; }
    get adminPasswordInput() { return '#adminPassword'; }
    get confirmPasswordInput() { return '#adminConfirmPassword'; }
    get registerButton() { return '#registerBtn'; }

    async open() {
        await this.driver.url(this.url);
    }

    async selectRole(role) {
        switch(role) {
            case 'manager':
                await this.click(this.roleManagerBtn);
                break;
            case 'admin':
                await this.click(this.roleAdminBtn);
                break;
            case 'coordinator':
                await this.click(this.roleCoordinatorBtn);
                break;
        }
    }

    async login(email, password) {
        await this.type(this.emailInput, email);
        await this.type(this.passwordInput, password);
        await this.click(this.loginButton);
    }

    async loginAsManager() {
        await this.selectRole('manager');
        await this.login('manager@jype.com', 'demo123');
        await this.waitForUrlContains('dashboard.html');
    }

    async loginAsAdmin() {
        await this.selectRole('admin');
        await this.login('admin@jype.com', 'demo123');
        await this.waitForUrlContains('dashboard.html');
    }

    async loginAsCoordinator() {
        await this.selectRole('coordinator');
        await this.login('coordinator@jype.com', 'demo123');
        await this.waitForUrlContains('dashboard.html');
    }

    async getErrorMessage() {
        const error = await this.driver.$(this.errorMessage);
        await error.waitForExist({ timeout: 5000 });
        return await error.getText();
    }

    async registerCompany(companyData) {
        await this.click(this.registerTab);
        await this.type(this.companyNameInput, companyData.companyName);
        await this.type(this.adminFullNameInput, companyData.adminFullName);
        await this.type(this.adminEmailInput, companyData.adminEmail);
        await this.type(this.adminPasswordInput, companyData.adminPassword);
        await this.type(this.confirmPasswordInput, companyData.adminPassword);
        if (companyData.adminPhone) {
            await this.type('#adminPhone', companyData.adminPhone);
        }
        await this.click(this.registerButton);
    }
}

module.exports = LoginPage;