# Contributing

Thanks for your interest in `shopify-scraper-apps-spy`. The actor is small on purpose; contributions that keep it small are welcome.

## How to add an app detector

Most contributions are app detectors. Each is ~10 lines.

1. Open `src/lib/app-patterns.js`.
2. Add an entry to the relevant category (`email`, `reviews`, `subscriptions`, `popups`, `search`, `loyalty`).
3. Each detector is a name + array of regex patterns matching against the homepage HTML or script src URLs.
4. Add a snapshot test in `tests/golden-stores.json` with a real store known to use the app.
5. Run `node tests/smoke-apps-reviews.mjs` to verify.

Example entry:

```js
{
  name: 'YourApp',
  patterns: [
    /cdn\.yourapp\.com/,
    /yourapp\.com\/widget/,
  ],
}
```

## How to run locally

```bash
npm install
node tests/smoke-products.mjs       # smoke test on /products.json
node tests/smoke-apps-reviews.mjs   # smoke test on apps + reviews
```

To run the full actor locally without Apify infra:

```bash
APIFY_LOCAL_STORAGE_DIR=./storage \
APIFY_DEFAULT_DATASET_ID=default \
node src/main.js
```

The input is read from `storage/key_value_stores/default/INPUT.json`.

## Pull request expectations

- Run the smoke tests and paste the output in the PR description.
- For new detectors, link a real store URL where the app is detected.
- Keep PRs small — one detector or one fix per PR.
- The maintainer is solo, so merge happens within ~48h.

## Reporting issues

Bugs, missing detectors, or feature requests → open a GitHub Issue with:

- The store URL where the bug shows up
- The expected vs actual output (paste the dataset row)
- Run ID from your Apify console if applicable

## Code style

- Plain JavaScript (ESM), no TypeScript.
- No headless browser. If your contribution requires one, it probably belongs in a separate actor.
- 2-space indent, single quotes, trailing commas.

## License

By contributing, you agree your contribution is licensed under MIT (see `LICENSE`).
