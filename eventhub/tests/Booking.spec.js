const { test, expect }   = require('../fixtures/auth.fixture');
const { BrowseEvent }    = require('../pages/BrowseEvent');
const { BookingPage }    = require('../pages/BookingPage');
const { MyBookingsPage } = require('../pages/MyBookingsPage');
const { getAccount }     = require('../test-data/account');

const ATTENDEE = { name: 'Test User', phone: '+91 9876543210' };

test.describe('EventHub — Booking', () => {

  test('book an event and see confirmation', async ({ loggedInPage }) => {
    const events = new BrowseEvent(loggedInPage);
    await events.navigate();
    await events.bookFirstEvent();

    const booking = new BookingPage(loggedInPage);
    await booking.book(ATTENDEE.name, getAccount().email, ATTENDEE.phone);

    expect(await booking.isConfirmed()).toBe(true);
    const ref = await booking.getBookingRef();
    expect(ref).toMatch(/^D-[A-Z0-9]+$/);

    // Cleanup: cancel the booking we just created so data doesn't accumulate.
    const myBookings = new MyBookingsPage(loggedInPage);
    await myBookings.navigate();
    await myBookings.cancelBookingByRef(ref);
  });

  test('booked event appears in My Bookings and can be cancelled', async ({ loggedInPage }) => {
    const events = new BrowseEvent(loggedInPage);
    await events.navigate();
    await events.bookFirstEvent();

    const booking = new BookingPage(loggedInPage);
    await booking.book(ATTENDEE.name, getAccount().email, ATTENDEE.phone);
    const ref = await booking.getBookingRef();

    // The booking shows up in My Bookings (tracked by its own ref, so this is
    // safe even when other workers book concurrently on the shared account).
    const myBookings = new MyBookingsPage(loggedInPage);
    await myBookings.navigate();
    await expect(myBookings.bookingByRef(ref)).toBeVisible();

    // Cancelling removes exactly that booking.
    await myBookings.cancelBookingByRef(ref);
    await expect(myBookings.bookingByRef(ref)).toHaveCount(0);
  });

});
