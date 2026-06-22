const { BasePage } = require('../../shared/BasePage');

// The event detail page (/events/:id) where a booking is filled in and confirmed.
class BookingPage extends BasePage {
  constructor(page) {
    super(page);

    this.nameInput      = page.locator('#customerName');
    this.emailInput     = page.locator('#customer-email');
    this.phoneInput     = page.locator('#phone');
    this.increaseQtyBtn = page.getByRole('button', { name: '+' });
    this.confirmButton  = page.locator('#confirm-booking');

    // Shown after a successful booking.
    this.confirmationMessage = page.getByText('Booking Confirmed');
  }

  async fillAttendeeDetails(name, email, phone) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
  }

  // Default quantity is 1; click "+" (count - 1) times for more (max 10).
  async setTicketQuantity(count) {
    for (let i = 1; i < count; i++) {
      await this.increaseQtyBtn.click();
    }
  }

  async confirm() {
    await this.confirmButton.click();
  }

  async book(name, email, phone) {
    await this.fillAttendeeDetails(name, email, phone);
    await this.confirm();
  }

  async isConfirmed() {
    return await this.confirmationMessage.isVisible();
  }

  // Confirmation shows e.g. "Booking Ref D-GUEXMQ" — pull out the ref code.
  async getBookingRef() {
    const text = await this.page.getByText(/D-[A-Z0-9]+/).first().textContent();
    const match = text.match(/D-[A-Z0-9]+/);
    return match ? match[0] : null;
  }
}

module.exports = { BookingPage };
