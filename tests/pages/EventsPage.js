const BasePage = require('./BasePage');

class EventsPage extends BasePage {
    constructor(driver) {
        super(driver);
    }

    // Locators
    get addEventBtn() { return '#addEventBtn2'; }
    get eventsTable() { return '#eventsTable'; }
    get eventRows() { return '#eventsTable tr'; }
    get filterToggleBtn() { return '#filterToggleBtn'; }
    get filterStatus() { return '#filterStatus'; }
    get filterType() { return '#filterType'; }
    get applyFiltersBtn() { return '#applyFiltersBtn'; }
    get resetFiltersBtn() { return '#resetFiltersBtn'; }

    // Modal locators
    get modal() { return '#eventModal'; }
    get modalTitle() { return '.modal-title'; }
    get eventNameInput() { return '#eventName'; }
    get eventTypeSelect() { return '#eventType'; }
    get eventStatusSelect() { return '#eventStatus'; }
    get eventStartDate() { return '#eventStartDate'; }
    get eventEndDate() { return '#eventEndDate'; }
    get eventGroupSelect() { return '#eventGroup'; }
    get eventVenueSelect() { return '#eventVenue'; }
    get eventDescription() { return '#eventDescription'; }
    get saveEventBtn() { return '#saveEventBtn'; }
    get closeModalBtn() { return '#closeModalBtn'; }

    async openAddEventModal() {
        await this.click(this.addEventBtn);
        await this.driver.pause(500);
    }

    async createEvent(eventData) {
        await this.openAddEventModal();
        await this.type(this.eventNameInput, eventData.name);
        await this.type(this.eventTypeSelect, eventData.event_type);
        await this.type(this.eventStatusSelect, eventData.status || 'planned');
        await this.type(this.eventStartDate, eventData.start_date);
        await this.type(this.eventEndDate, eventData.end_date);
        await this.type(this.eventGroupSelect, eventData.group_id);
        await this.type(this.eventVenueSelect, eventData.venue_id);
        if (eventData.description) {
            await this.type(this.eventDescription, eventData.description);
        }
        await this.click(this.saveEventBtn);
        await this.driver.pause(1000);
    }

    async getEventCount() {
        const rows = await this.driver.$$(this.eventRows);
        return rows.length - 1; // subtract header row
    }

    async getFirstEventName() {
        const firstRow = await this.driver.$(this.eventRows);
        const cells = await firstRow.$$('td');
        if (cells.length > 0) {
            return await cells[0].getText();
        }
        return '';
    }

    async applyFilter(filterType, filterValue) {
        await this.click(this.filterToggleBtn);
        await this.driver.pause(300);

        if (filterType === 'status') {
            await this.type(this.filterStatus, filterValue);
        } else if (filterType === 'type') {
            await this.type(this.filterType, filterValue);
        }

        await this.click(this.applyFiltersBtn);
        await this.driver.pause(1000);
    }

    async resetFilters() {
        await this.click(this.filterToggleBtn);
        await this.driver.pause(300);
        await this.click(this.resetFiltersBtn);
        await this.driver.pause(1000);
    }

    async closeModal() {
        const modal = await this.driver.$(this.modal);
        if (await modal.isDisplayed()) {
            await this.click(this.closeModalBtn);
        }
    }
}

module.exports = EventsPage;