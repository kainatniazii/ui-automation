const { BasePage } = require('../../shared/BasePage');

class BrowseEvent extends BasePage {
  constructor(page) {
    super(page);

    this.searchInput    = page.locator("input[placeholder='Search events, venues…']");
    this.eventCards     = page.locator("[data-testid='event-card']");
    this.bookNowButtons = page.locator("[data-testid='book-now-btn']");
  }

  async navigate() {
    await this.navigateTo('/events');
  }

  async getEventCount() {
    return await this.eventCards.count();
  }

  async getEventTitles() {
    return await this.eventCards.locator('h2, h3').allTextContents();
  }

  async search(term) {
    await this.searchInput.fill(term);
  }

  async bookFirstEvent() {
    await this.bookNowButtons.first().click();
  }

  async bookEventByName(name) {
    const card = this.eventCards.filter({ hasText: name });
    await card.locator("[data-testid='book-now-btn']").click();
  }
}

module.exports = { BrowseEvent };
