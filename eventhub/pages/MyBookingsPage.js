const { BasePage } = require('../../shared/BasePage');

// The My Bookings page (/bookings) listing the user's bookings, with cancel.
class MyBookingsPage extends BasePage {
  constructor(page) {
    super(page);

    this.bookingCards        = page.locator("[data-testid='booking-card']");
    this.bookingIds          = page.locator("[data-testid='booking-id']");
    this.confirmCancelButton = page.locator('#confirm-dialog-yes');
  }

  async navigate() {
    await this.navigateTo('/bookings');
  }

  async getBookingCount() {
    return await this.bookingCards.count();
  }

  // A single booking card identified by its ref code (e.g. "D-GUEXMQ").
  bookingByRef(ref) {
    return this.bookingCards.filter({ hasText: ref });
  }

  // Cancel a specific booking and confirm in the "Yes, cancel it" dialog.
  async cancelBookingByRef(ref) {
    await this.bookingByRef(ref).locator("[data-testid='cancel-booking-btn']").click();
    await this.confirmCancelButton.click();
  }
}

module.exports = { MyBookingsPage };
