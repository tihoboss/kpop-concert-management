// tests/pages/DashboardPage.js
const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
    constructor(driver) {
        super(driver);
    }

    // Locators
    get userName() { return '#userName'; }
    get userRole() { return '#userRole'; }
    get logoutBtn() { return '#logoutBtn'; }
    get navEvents() { return '.nav-item[data-page="events"]'; }
    get navGroups() { return '.nav-item[data-page="groups"]'; }
    get navVenues() { return '.nav-item[data-page="venues"]'; }
    get navTechTeams() { return '.nav-item[data-page="tech-teams"]'; }
    get navProfile() { return '.nav-item[data-page="profile"]'; }
    get addEventBtn() { return '#addEventBtn'; }
    get eventsGrid() { return '#eventsGrid'; }
    get eventCards() { return '.event-card'; }
    get totalEventsStat() { return '#totalEvents'; }
    get upcomingEventsStat() { return '#upcomingEvents'; }
    get totalGroupsStat() { return '#totalGroups'; }
    get totalVenuesStat() { return '#totalVenues'; }

    async getUserName() {
        return await this.getText(this.userName);
    }

    async getUserRole() {
        return await this.getText(this.userRole);
    }

    async logout() {
        await this.click(this.logoutBtn);
        await this.waitForUrlContains('login.html');
    }

    async goToEvents() {
        await this.click(this.navEvents);
        await this.driver.pause(500);
    }

    async goToGroups() {
        await this.click(this.navGroups);
        await this.driver.pause(500);
    }

    async goToVenues() {
        await this.click(this.navVenues);
        await this.driver.pause(500);
    }

    async goToTechTeams() {
        await this.click(this.navTechTeams);
        await this.driver.pause(500);
    }

    async getStats() {
        const totalEvents = await this.getText(this.totalEventsStat);
        const upcomingEvents = await this.getText(this.upcomingEventsStat);
        const totalGroups = await this.getText(this.totalGroupsStat);
        const totalVenues = await this.getText(this.totalVenuesStat);

        return {
            totalEvents: parseInt(totalEvents),
            upcomingEvents: parseInt(upcomingEvents),
            totalGroups: parseInt(totalGroups),
            totalVenues: parseInt(totalVenues)
        };
    }

    async getEventCount() {
        const events = await this.driver.$$(this.eventCards);
        return events.length;
    }
}

module.exports = DashboardPage;