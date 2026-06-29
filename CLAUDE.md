# Project instructions

## Git workflow

For any new project, do all work on a `staging` branch first. `staging` is the integration branch where in-progress and not-yet-verified work lands.

Promote to `main` only once the work is fully tested, bug-free, and issue-less. `main` must stay clean and hold only vetted, release-quality code.

In practice:
- Base feature branches on `staging` (treat `staging` the way standard flow treats `main`).
- Integrate and verify on `staging`.
- Open the promotion to `main` only after the work passes review and tests.
- Before promoting `staging` to `main`, run the `/pr-review` skill and resolve everything it flags. Do not merge until it reports ready.

## Writing style

- Never use em dashes or double hyphens (`--`) as punctuation in any generated text: commit messages, PR bodies, code comments, docs, or chat. Use a comma, colon, parentheses, or a new sentence instead.
- Single `-` list markers and `--flag` style hyphens inside commands or code are fine.

## Commit messages

- Imperative subject, capitalized, no trailing period, no conventional-commit prefix (`feat:`, `fix:`, etc.). Keep it to roughly 70 characters.
- Body: a short paragraph on why the change is needed, then `-` bullets describing what changed, specific to real files, methods, flags, and config keys.
- Do NOT add a `Co-Authored-By: Claude` trailer.

## PR conventions

- Body follows one of two shapes: `Problem / Change / Effect / Test plan` for fixes and infra, or `Summary / per-area sections / Test plan` for feature additions.
- The test plan is real: actual commands plus results, not boilerplate.

## Testing conventions (Playwright)

- Page Object Model: page logic lives in the Page Object, specs read as scenarios, locators defined once.
- Prefer web-first, auto-retrying assertions (`expect(locator).toBeVisible()/toHaveText()/toHaveValue()/toContainText()`, or `expect.poll(...)`) over one-shot reads like `isVisible()`/`textContent()`/`count()` asserted with `expect(value)`. No `waitForTimeout` or hard sleeps. No order-dependent assertions.
- Any spec hitting a live third-party site or API (and its `auth.setup` dependency) must be tagged `@external` so it is excluded from the gating run via `npm run test:no-external`.
