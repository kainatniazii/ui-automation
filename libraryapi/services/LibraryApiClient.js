// API client for the Library API (http://216.10.245.166).
// This is the API-testing equivalent of a Page Object: one place that knows
// every endpoint and how to call it, so the tests stay readable.
//
// Each method returns the raw Playwright APIResponse, so tests can assert on
// both the status code and the parsed body.
class LibraryApiClient {
  constructor(request) {
    this.request = request; // Playwright APIRequestContext (the `request` fixture)
  }

  // POST /Library/Addbook.php  -> { Msg, ID }   (ID is isbn + aisle)
  async addBook(book) {
    return this.request.post('/Library/Addbook.php', { data: book });
  }

  // GET /Library/GetBook.php?ID=...  -> [ { book_name, isbn, aisle, author } ]
  async getBookById(id) {
    return this.request.get('/Library/GetBook.php', { params: { ID: id } });
  }

  // GET /Library/GetBook.php?AuthorName=...  -> [ { book_name, isbn, aisle } ]
  async getBooksByAuthor(authorName) {
    return this.request.get('/Library/GetBook.php', { params: { AuthorName: authorName } });
  }

  // POST /Library/DeleteBook.php  -> { msg }
  async deleteBook(id) {
    return this.request.post('/Library/DeleteBook.php', { data: { ID: id } });
  }
}

module.exports = { LibraryApiClient };
