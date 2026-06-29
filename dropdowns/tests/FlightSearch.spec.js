const { test, expect } = require('@playwright/test');
const { DropdownsPage } = require('../pages/DropdownsPage');
const flights = require('../test-data/flights.json');

test.describe('Flight search', () => {

  test('one-way: return date is dimmed and route selects correctly', async ({ page }) => {
    const flight = new DropdownsPage(page);
    await flight.navigate();

    await flight.selectOneWay();
    await expect(flight.oneWayRadio).toBeChecked();
    // One-way trips don't take a return date, so its block is dimmed.
    // Poll so a CSS opacity transition can't be read mid-flight.
    await expect.poll(() => flight.isReturnDateActive()).toBe(false);

    await flight.selectOrigin(flights.route.origin);
    await flight.selectDestination(flights.route.destination);
    await expect(flight.originSelect).toHaveValue(flights.route.origin);
    await expect(flight.destinationSelect).toHaveValue(flights.route.destination);

    await flight.searchFlights();
  });

  test('round-trip: enables the return date field', async ({ page }) => {
    const flight = new DropdownsPage(page);
    await flight.navigate();

    await flight.selectRoundTrip();
    await expect(flight.roundTripRadio).toBeChecked();
    // Round trips require a return date, so its block becomes fully active.
    // Poll so a CSS opacity transition can't be read mid-flight.
    await expect.poll(() => flight.isReturnDateActive()).toBe(true);

    await flight.selectOrigin(flights.route.origin);
    await flight.selectDestination(flights.route.destination);
    await expect(flight.originSelect).toHaveValue(flights.route.origin);
    await expect(flight.destinationSelect).toHaveValue(flights.route.destination);
  });

});

test.describe('Passenger multi-select dropdown', () => {

  test('setting adults, children and infants updates counts and summary', async ({ page }) => {
    const flight = new DropdownsPage(page);
    await flight.navigate();

    const { adults, children, infants } = flights.passengers;

    await flight.openPassengers();
    await flight.setPassengers({ adults, children, infants });

    // Note: the widget caps total passengers, so the summary reflects the
    // applied counts. Read them back from the spans the widget renders.
    await flight.openPassengers();
    await expect.poll(() => flight.getPassengerCounts()).toEqual({ adults, children, infants });
    await flight.paxDoneButton.dispatchEvent('click');

    // The widget renders a singular label for each type, e.g.
    // "3 Adult, 2 Child, 1 Infant".
    await expect(flight.paxSummary).toContainText(`${adults} Adult`);
    await expect(flight.paxSummary).toContainText(`${children} Child`);
    await expect(flight.paxSummary).toContainText(`${infants} Infant`);
  });

  test('decrement reduces a raised count', async ({ page }) => {
    const flight = new DropdownsPage(page);
    await flight.navigate();

    await flight.openPassengers();
    // Raise adults to 3, then step back down to 2.
    await flight.incAdult.dispatchEvent('click');
    await flight.incAdult.dispatchEvent('click');
    await expect(flight.adultCount).toHaveText('3');

    await flight.decAdult.dispatchEvent('click');
    await expect(flight.adultCount).toHaveText('2');
  });

  test('adult count holds at its floor of 1', async ({ page }) => {
    const flight = new DropdownsPage(page);
    await flight.navigate();

    await flight.openPassengers();
    // The widget refuses to drop adults below 1.
    await flight.decAdult.dispatchEvent('click');
    await flight.decAdult.dispatchEvent('click');

    await expect(flight.adultCount).toHaveText('1');
  });

});
