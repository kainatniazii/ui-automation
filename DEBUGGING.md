# 🐞 Debugging Guide (for non-coders)

A quick, plain-English guide for when a test fails — especially when you're in a
meeting and need answers fast. No coding experience assumed.

---

## 0. How this project is laid out

```
ui-automation/
├── eventhub/                  ← one website under test
│   ├── tests/                 ← WHAT to check (steps + expectations)
│   ├── pages/                 ← HOW to find buttons/fields on the page
│   └── test-data/             ← emails / passwords / data the tests use
├── saucedemo/                 ← another website, same structure
├── shared/BasePage.js         ← shared helpers both sites reuse
└── playwright.config.js       ← global settings (browsers, retries…)
```

Two file types matter most:
- **`tests/*.spec.js`** = *what should happen* (e.g. "after login, see Logout").
- **`pages/*.js`** = *where the buttons/fields are* (the "selectors").

When something breaks, the fix is almost always in one of these two.

---

## 1. Where do I SEE a failure?

### A) In GitHub (most likely while you're in a meeting)
Every push runs the tests automatically.
1. Repo on **github.com → "Actions" tab**.
2. **Red ✗** = failed, **green ✓** = passed. Click the red run.
3. Click the **"test"** job → open the failing step → read the error at the bottom.
4. Scroll to **"Artifacts"** → download **`playwright-report`** → unzip → open
   `index.html`. This has screenshots + video + trace of what the browser did.

### B) On your own machine
```bash
npm run report        # opens the last HTML report in your browser
```

---

## 2. How to READ the report (the important part)

Open the HTML report, click the red (failed) test. You get:

- **📸 Screenshot** at the moment of failure → often tells the whole story.
- **🎬 Video** of the entire test → watch it like a screen recording.
- **🔍 Trace** (a step-by-step timeline) → hover each step to see the exact
  screen, network calls, and console errors at that moment.

> **90% of debugging = open report → look at the screenshot → "ah, that's it."**

---

## 3. The 4 most common failures & their fixes

### ① "Timeout waiting for locator('#something')" → a field/button moved or was renamed
The website changed an element's `id`/name, so the test can't find it.
**Fix:** open the site in Chrome → right-click the element → **Inspect** → read its
real `id="..."` → update the matching line in the `pages/*.js` file.

### ② "Timeout 30000ms exceeded" → the page was just slow
Often **flaky** (fails once, passes on retry). CI retries twice automatically.
If it fails *every single time*, it's a real problem, not flakiness.

### ③ "expected true, got false" on a visibility/text check → THE FLAKY TRAP
This is the big one (it's what bit us on the invalid-login test).

> ❌ `await locator.isVisible()` → checks **once**, doesn't wait → flaky.
> ✅ `await expect(locator).toBeVisible()` → **waits up to 5s** → reliable.

**Rule of thumb:** to check that something *appears* (error, button, message),
always use `await expect(locator).toBeVisible()` / `.toContainText('...')`.
See the fixed example in `eventhub/tests/Login.spec.js` (invalid-credentials test).

### ④ "expected 'X' to contain 'Y'" → the website's wording changed
e.g. the error text changed from "Invalid email or password" to something else.
**Fix:** update the expected text in the `tests/*.spec.js` file to match.

---

## 4. How to make a change & verify it (step by step)

1. Open the file in VS Code, edit the line, save (`Cmd+S`).
2. Run **just the test you touched** (don't run everything):
   ```bash
   npx playwright test eventhub/tests/Login.spec.js --project=eventhub-chromium
   ```
3. Want to **watch the browser** do it?  add `--headed`
4. Best beginner tool — clickable UI with play buttons & screenshots:
   ```bash
   npx playwright test --ui
   ```
5. **Prove a flaky fix** by running it several times:
   ```bash
   npx playwright test eventhub/tests/Login.spec.js:23 --project=eventhub-chromium --repeat-each=5
   ```
6. Save it to GitHub (this re-runs CI automatically):
   ```bash
   git add . && git commit -m "describe what you fixed" && git push
   ```

---

## 5. Command cheat-sheet

| I want to…                     | Command                                                            |
|--------------------------------|-------------------------------------------------------------------|
| Run all tests                  | `npm test`                                                         |
| Run only eventhub              | `npm run test:eventhub`                                            |
| Run only saucedemo             | `npm run test:saucedemo`                                           |
| Run one test file              | `npx playwright test eventhub/tests/Login.spec.js`                 |
| Run one test by line number    | `npx playwright test eventhub/tests/Login.spec.js:23`             |
| Watch the browser do it        | add `--headed`                                                     |
| Best debugging view            | `npx playwright test --ui`                                         |
| Re-run N times (prove a fix)   | add `--repeat-each=5`                                              |
| Open the last report           | `npm run report`                                                   |

---

## 6. Per-page selector reference (where to look when a page breaks)

If a test on a given page fails with "can't find element", open that page's file
below and check the listed selector against the live website (Inspect).

### EventHub

**`eventhub/pages/LoginPage.js`** — the `/login` page
| Field/button   | Selector                  |
|----------------|---------------------------|
| Email box      | `#email`                  |
| Password box   | `#password`               |
| Sign In button | `#login-btn`              |
| Register link  | `a[href='/register']`     |
| Error toast    | text "Invalid email or password" |

**`eventhub/pages/RegisterPage.js`** — the `/register` page
| Field/button         | Selector                                |
|----------------------|-----------------------------------------|
| Email box            | `#register-email`                       |
| Password box         | `#register-password`                    |
| Confirm password box | placeholder "Repeat your password"      |
| Create Account btn   | `#register-btn`                         |
| Error text           | `.text-red-600`                         |

**`eventhub/pages/BrowseEvent.js`** — the `/events` page
| Element        | Selector                                  |
|----------------|-------------------------------------------|
| Search box     | placeholder "Search events, venues…"      |
| Event cards    | `[data-testid='event-card']`              |
| Book Now btns  | `[data-testid='book-now-btn']`            |

**`eventhub/pages/BookingPage.js`** — the event detail / booking page
| Field/button        | Selector                       |
|---------------------|--------------------------------|
| Name box            | `#customerName`                |
| Email box           | `#customer-email`              |
| Phone box           | `#phone`                       |
| Increase quantity   | button "+"                     |
| Confirm Booking btn | `#confirm-booking`             |
| Success message     | text "Booking Confirmed"       |

**`eventhub/pages/MyBookingsPage.js`** — the `/bookings` page
| Element            | Selector                          |
|--------------------|-----------------------------------|
| Booking cards      | `[data-testid='booking-card']`    |
| Booking IDs        | `[data-testid='booking-id']`      |
| Cancel (in dialog) | `#confirm-dialog-yes`             |

> SauceDemo selectors live in `saucedemo/pages/`.

---

## 7. When you're truly stuck

1. Read the **error message** — it names the file and line (e.g. `Login.spec.js:28`).
2. Open the **report screenshot** — see what the screen actually looked like.
3. Re-run with `--headed` or `--ui` to watch it happen.
4. Check the **per-page selector table** above against the live site.
5. Still stuck? Copy the full error + the test file name and ask for help —
   that's enough for anyone (or me) to jump in.
