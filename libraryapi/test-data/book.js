// Builds a fresh book with a unique ISBN every call.
//
// Why unique: the API derives a book's ID from isbn + aisle and rejects a
// repeat with "Book Already Exists". A unique ISBN per run keeps tests
// independent and re-runnable without manual cleanup of leftovers.
function uniqueBook(overrides = {}) {
  const isbn = `pw${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    name: 'Playwright API Testing',
    isbn,
    aisle: '227',
    author: 'QA Team',
    ...overrides,
  };
}

// The server's book ID is just the isbn and aisle concatenated.
function idFor(book) {
  return `${book.isbn}${book.aisle}`;
}

module.exports = { uniqueBook, idFor };
