const { test, expect } = require('@playwright/test');
const { LibraryApiClient } = require('../services/LibraryApiClient');
const { uniqueBook, idFor } = require('../test-data/book');

// Tagged @external: these hit a real third-party server (216.10.245.166).
// Exclude them from a run with:  playwright test --grep-invert @external
test.describe('Library API', { tag: '@external' }, () => {
  let api;
  const createdIds = [];

  test.beforeEach(({ request }) => {
    api = new LibraryApiClient(request);
  });

  // Clean up anything a test created, so the live server doesn't accumulate
  // books and re-runs stay independent.
  test.afterEach(async () => {
    while (createdIds.length) {
      await api.deleteBook(createdIds.pop());
    }
  });

  test('add a book returns success and an ID of isbn + aisle', async () => {
    const book = uniqueBook();

    const res = await api.addBook(book);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.Msg).toBe('successfully added');
    expect(body.ID).toBe(idFor(book));
    createdIds.push(body.ID);
  });

  test('get a book by ID returns the details that were added', async () => {
    const book = uniqueBook();
    const id = (await (await api.addBook(book)).json()).ID;
    createdIds.push(id);

    const res = await api.getBookById(id);
    expect(res.status()).toBe(200);

    // The endpoint returns an array, even for a single book.
    const [found] = await res.json();
    expect(found.book_name).toBe(book.name);
    expect(found.isbn).toBe(book.isbn);
    expect(found.aisle).toBe(book.aisle);
  });

  test('get books by author returns the book just added', async () => {
    const author = `Author_${Date.now()}`;
    const book = uniqueBook({ author });
    const id = (await (await api.addBook(book)).json()).ID;
    createdIds.push(id);

    const res = await api.getBooksByAuthor(author);
    expect(res.status()).toBe(200);

    const books = await res.json();
    expect(Array.isArray(books)).toBe(true);
    expect(books.map(b => b.isbn)).toContain(book.isbn);
  });

  test('delete a book returns the success message', async () => {
    const book = uniqueBook();
    const id = (await (await api.addBook(book)).json()).ID;

    const res = await api.deleteBook(id);
    expect(res.status()).toBe(200);
    expect((await res.json()).msg).toBe('book is successfully deleted');
    // Deleted here, so don't queue it for afterEach cleanup.
  });

  test('full lifecycle: add -> get -> delete -> gone (404)', async () => {
    const book = uniqueBook();

    // add
    const id = (await (await api.addBook(book)).json()).ID;

    // get
    const [found] = await (await api.getBookById(id)).json();
    expect(found.isbn).toBe(book.isbn);

    // delete
    expect((await (await api.deleteBook(id)).json()).msg)
      .toBe('book is successfully deleted');

    // gone — the API answers 404 for an unknown ID
    const after = await api.getBookById(id);
    expect(after.status()).toBe(404);
  });

  test('adding the same book twice is rejected as already existing', async () => {
    const book = uniqueBook();

    const first = await (await api.addBook(book)).json();
    expect(first.Msg).toBe('successfully added');
    createdIds.push(first.ID);

    // The API answers 200 here (not a 4xx), so we assert on the message.
    const second = await api.addBook(book);
    expect(second.status()).toBe(200);
    expect((await second.json()).Msg).toBe('Book Already Exists');
  });

  test('getting an unknown ID returns 404', async () => {
    const res = await api.getBookById('definitely_not_a_real_id_zzz');
    expect(res.status()).toBe(404);
  });
});
