// tests/pages/BasePage.js
class BasePage {
    constructor(driver) {
        this.driver = driver;
        this.timeout = 10000;
    }

    async waitForElement(locator, timeout = this.timeout) {
        const element = await this.driver.$(locator);
        await element.waitForExist({ timeout });
        return element;
    }

    async click(locator) {
        const element = await this.waitForElement(locator);
        await element.click();
    }

    async type(locator, text) {
        const element = await this.waitForElement(locator);
        await element.setValue(text);
    }

    async getText(locator) {
        const element = await this.waitForElement(locator);
        return await element.getText();
    }

    async isVisible(locator) {
        const element = await this.driver.$(locator);
        return await element.isDisplayed();
    }

    async waitForUrlContains(text, timeout = this.timeout) {
        await this.driver.waitUntil(
            async () => (await this.driver.getUrl()).includes(text),
            { timeout }
        );
    }
}

module.exports = BasePage;