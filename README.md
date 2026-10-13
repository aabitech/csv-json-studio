# CSV ↔ JSON Studio

A polished, dependency-free, browser-based CSV/JSON converter. It can be opened locally or deployed as a static site with GitHub Pages.

## Features

- Convert CSV to JSON and JSON to CSV.
- RFC 4180-style CSV parsing for quoted fields, escaped quotes, embedded delimiters, and newlines.
- Automatic delimiter detection plus comma, semicolon, tab, and pipe options.
- Optional CSV header row; headerless CSV becomes arrays of arrays.
- JSON output can be pretty-printed or compact.
- Import local CSV/TSV/TXT/JSON files (10 MB limit), copy results, or download output.
- Helpful validation errors, sample data, responsive layout, keyboard shortcut (`Ctrl`/`⌘` + `Enter`), and light/dark themes.
- No backend, analytics, third-party JavaScript, or data uploads. Google Fonts are optional styling only; remove the `@import` in `styles.css` for fully offline/no-third-party requests.
- Search-friendly page title and description, social sharing metadata, a WebApplication JSON-LD description, explanatory content, FAQs, and contextual links to related AabiTech tools.

## Run locally

No build step or package manager is required. Open `index.html` in a modern browser. For a local HTTP server, run:

```sh
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## Deploy to GitHub Pages

1. Create a public GitHub repository and upload `index.html`, `styles.css`, `app.js`, `favicon.svg`, `README.md`, and `LICENSE`.
2. Replace the placeholder `https://github.com/` links in `index.html` with your real repository URL.
3. In **Settings → Pages**, select **Deploy from a branch**.
4. Choose your default branch and `/ (root)`, then save.
5. Wait for GitHub Pages to publish the site.

The page creates a self-referencing canonical URL at runtime on HTTP/HTTPS deployments, so it does not assume a GitHub username or project path. Verify the canonical URL in the rendered page after deployment. Update social metadata or add a social preview image once the final public URL and branding are settled.

## Data and limitations

- Processing occurs locally in the current browser tab. The tool does not send input data to an application server.
- CSV values are emitted as strings; the converter does not guess numbers, booleans, dates, or null values. This avoids silently changing source data.
- JSON input must be an array of objects or an array of arrays. Mixed arrays and primitive top-level array items are rejected because they do not map cleanly to a rectangular CSV.
- When object keys differ between rows, the CSV output includes the union of keys and leaves missing cells empty. Nested object/array values are serialized into JSON text within their CSV cell.
- Browser clipboard support depends on browser permissions and context; a selection-based fallback is provided.

## Quality checks before a release

Manually test: empty input; commas and quotes inside CSV cells; multiline quoted cells; CRLF and LF; duplicate/blank headers; headerless CSV; malformed quote; invalid JSON; empty arrays; objects with different keys; embedded commas/newlines in JSON values; both themes; keyboard conversion; import and download on mobile.

## Contributing

Issues and pull requests are welcome. Keep the tool static, accessible, dependency-free, and local-first. Please add reproducible test cases for parser or conversion changes.

## License

MIT. See [`LICENSE`](LICENSE).
