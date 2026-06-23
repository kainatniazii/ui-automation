const { BasePage } = require('../../shared/BasePage');

// Page object for https://rahulshettyacademy.com/dropdownsPractise/
// (the SpiceJet flight-search practice page).
class DropdownsPage extends BasePage {
  constructor(page) {
    super(page);

    // --- Trip type ---
    this.oneWayRadio   = page.locator('#ctl00_mainContent_rbtnl_Trip_0');
    this.roundTripRadio = page.locator('#ctl00_mainContent_rbtnl_Trip_1');

    // --- Route (real <select> elements) ---
    this.originSelect      = page.locator('#ctl00_mainContent_ddl_originStation1');
    this.destinationSelect = page.locator('#ctl00_mainContent_ddl_destinationStation1');

    // --- Dates ---
    this.departDate = page.locator('#ctl00_mainContent_view_date1');
    this.returnDate = page.locator('#ctl00_mainContent_view_date2');
    this.returnDateBlock = page.locator('#Div1'); // RETURN DATE block (dimmed for one-way)

    // --- Passenger widget ---
    this.paxSummary   = page.locator('#divpaxinfo');     // e.g. "1 Adult"
    this.paxOptions   = page.locator('#divpaxOptions');  // dropdown panel
    this.incAdult     = page.locator('#hrefIncAdt');
    this.decAdult     = page.locator('#hrefDecAdt');
    this.adultCount   = page.locator('#spanAudlt');
    this.incChild     = page.locator('#hrefIncChd');
    this.decChild     = page.locator('#hrefDecChd');
    this.childCount   = page.locator('#spanChild');
    this.incInfant    = page.locator('#hrefIncInf');
    this.decInfant    = page.locator('#hrefDecInf');
    this.infantCount  = page.locator('#spanInfant');
    this.paxDoneButton = page.locator('#btnclosepaxoption');

    // --- Currency + search ---
    this.currencySelect = page.locator('#ctl00_mainContent_DropDownListCurrency');
    this.searchButton   = page.locator('#ctl00_mainContent_btn_FindFlights');
  }

  async navigate() {
    await this.navigateTo('/dropdownsPractise/');
  }

  // ------------------------------------------------------------------ //
  // Trip type
  // ------------------------------------------------------------------ //

  async selectOneWay() {
    await this.oneWayRadio.check();
  }

  async selectRoundTrip() {
    await this.roundTripRadio.check({ force: true });
  }

  // The return-date block is fully opaque (1) for round trips and dimmed
  // (0.5) for one-way. The input itself is always readonly, never disabled,
  // so opacity is the observable signal.
  async isReturnDateActive() {
    const opacity = await this.returnDateBlock.evaluate(
      el => getComputedStyle(el).opacity
    );
    return Number(opacity) === 1;
  }

  // ------------------------------------------------------------------ //
  // Route — origin/destination are <select>, pick by airport code (e.g. 'DEL').
  // The native selects are hidden behind a jQuery widget, so { force: true }
  // is needed to set the value that actually gets submitted.
  // ------------------------------------------------------------------ //

  async selectOrigin(code) {
    await this.originSelect.selectOption(code, { force: true });
  }

  async selectDestination(code) {
    await this.destinationSelect.selectOption(code, { force: true });
  }

  async getSelectedOrigin() {
    return await this.originSelect.inputValue();
  }

  async getSelectedDestination() {
    return await this.destinationSelect.inputValue();
  }

  // ------------------------------------------------------------------ //
  // Passenger multi-select widget
  // ------------------------------------------------------------------ //

  // A floating ad banner overlaps the top pax controls. A forced click still
  // lands on whatever is painted on top, so dispatchEvent is used to deliver
  // the click straight to the element regardless of any overlay.
  async openPassengers() {
    await this.paxSummary.dispatchEvent('click');
    await this.paxOptions.waitFor({ state: 'visible' });
  }

  // Click an increment/decrement control n times.
  async _step(locator, times) {
    for (let i = 0; i < times; i++) {
      await locator.dispatchEvent('click');
    }
  }

  // Set passenger counts. Adults start at 1, children/infants at 0.
  async setPassengers({ adults = 1, children = 0, infants = 0 } = {}) {
    await this._step(this.incAdult, adults - 1);
    await this._step(this.incChild, children);
    await this._step(this.incInfant, infants);
    await this.paxDoneButton.dispatchEvent('click');
    await this.paxOptions.waitFor({ state: 'hidden' });
  }

  async getPassengerCounts() {
    return {
      adults: Number(await this.adultCount.textContent()),
      children: Number(await this.childCount.textContent()),
      infants: Number(await this.infantCount.textContent()),
    };
  }

  async getPassengerSummary() {
    return (await this.paxSummary.textContent()).trim();
  }

  // ------------------------------------------------------------------ //
  // Search
  // ------------------------------------------------------------------ //

  async selectCurrency(code) {
    await this.currencySelect.selectOption(code);
  }

  async searchFlights() {
    // A jQuery datepicker can auto-open over the button after picking a
    // route, so force the click past any overlay.
    await this.searchButton.click({ force: true });
  }
}

module.exports = { DropdownsPage };
