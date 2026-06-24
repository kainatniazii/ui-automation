const { test, expect } = require('../fixtures/auth.fixture');
const { BrowseEvent }  = require('../pages/BrowseEvent');

// Tagged @external: hits the live eventhub.rahulshettyacademy.com site.
// Exclude flaky external runs with:  playwright test --grep-invert @external
test.describe('EventHub — Browse Events', { tag: '@external' }, () => {

  test('events page lists events', async ({ loggedInPage }) => {
    const events = new BrowseEvent(loggedInPage);
    await events.navigate();
    // Wait for the list to load (cards arrive asynchronously) before counting,
    // otherwise count() can read 0 on a slow connection like CI.
    await expect(events.eventCards.first()).toBeVisible();
    expect(await events.getEventCount()).toBeGreaterThan(0);
  });

  test('search filters events by name', async ({ loggedInPage }) => {
    const events = new BrowseEvent(loggedInPage);
    await events.navigate();
    await events.search('Diwali');

    // List filters reactively — wait until every shown event matches the term.
    await expect.poll(async () => {
      const titles = await events.getEventTitles();
      return titles.length > 0 && titles.every(t => /diwali/i.test(t));
    }).toBe(true);
  });

  test('search with no match shows no events', async ({ loggedInPage }) => {
    const events = new BrowseEvent(loggedInPage);
    await events.navigate();
    await events.search('zzzznomatch123');
    await expect(events.eventCards).toHaveCount(0);
  });

});
