<div align="center">

# CSV ↔ JSON Studio

**A fast, free, browser-based converter for CSV and JSON data.**

Convert CSV to JSON or JSON to CSV directly in your browser. No account, backend, or build step required.

</div>

---

## ✨ Features

- **Bidirectional conversion:** Convert CSV to JSON and JSON to CSV.
- **CSV-aware parsing:** Supports quoted fields, escaped quotes, embedded delimiters, and line breaks inside quoted cells.
- **Flexible delimiters:** Detect delimiters automatically or choose comma, semicolon, tab, or pipe.
- **Header options:** Use the first CSV row as column names, or convert headerless CSV into arrays.
- **Readable JSON:** Format output as pretty-printed or compact JSON.
- **File support:** Import CSV, TSV, TXT, and JSON files (up to 10 MB).
- **Easy export:** Copy the result to your clipboard or download it as a file.
- **Helpful feedback:** Get validation messages and start quickly with sample data.
- **Keyboard shortcut:** Run conversion with `Ctrl + Enter` on Windows/Linux or `⌘ + Enter` on macOS.
- **Responsive interface:** Designed for desktop and mobile, with light and dark themes.
- **Static and lightweight:** Built with plain HTML, CSS, and JavaScript—no framework or build tools.
- **Local-first processing:** Your input is processed in the browser and is not uploaded to an application server.

## 🚀 Get started

### Run locally

No installation, package manager, or build step is needed.

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

Alternatively, start a local HTTP server from the project directory:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

### Deploy with GitHub Pages

1. Create a public GitHub repository and add the project files.
2. In your repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your default branch and the `/ (root)` folder, then save.
5. Wait for GitHub Pages to finish deploying and open the published URL.

Before publishing, replace any placeholder repository links in `index.html` with the URL of your actual repository. After deployment, verify the canonical URL and social sharing metadata on the live page.

## 📁 Project structure

```text
csv-json-studio/
├── index.html    # Application interface, SEO metadata, FAQs, and structured data
├── styles.css    # Layout, responsive styling, and light/dark themes
├── app.js        # CSV/JSON conversion logic and interface interactions
├── favicon.svg   # Project favicon
├── README.md     # Project documentation
└── LICENSE       # MIT license
```

## 🔐 Privacy and data handling

Conversion takes place locally in the browser tab. The tool does not send the content you enter or import to an application server. Clipboard access is used only when you choose the copy action.

The stylesheet imports Google Fonts for typography. If you prefer to avoid that third-party request, remove the Google Fonts `@import` from `styles.css`; the interface can use the system font stack instead.

## 📋 Conversion behavior and limitations

- CSV values are treated as strings. The converter does not automatically infer numbers, booleans, dates, or `null`, helping prevent unintended changes to source values.
- JSON input must be an array of objects or an array of arrays. Unsupported mixed arrays and primitive top-level array items are rejected because they do not map reliably to tabular CSV.
- When object rows contain different keys, the CSV output uses the union of those keys and leaves missing cells empty.
- Nested objects and arrays are serialized as JSON text within their CSV cells.
- File imports are limited to 10 MB. Very large inputs may still affect browser responsiveness depending on the device.
- Clipboard functionality depends on browser support and permissions; a fallback is provided where possible.

## 🧪 Suggested release checks

Before releasing changes, test the following cases manually:

- Empty input and malformed CSV or JSON.
- Commas, quotes, and line breaks inside quoted CSV cells.
- Both CRLF and LF line endings.
- Duplicate or blank headers, and CSV files without headers.
- Different object keys across JSON rows, including missing values.
- Nested JSON values and embedded commas or newlines in output cells.
- Each delimiter option and both conversion directions.
- Copy, file import, download, keyboard shortcut, and theme switching.
- Responsive behavior on mobile and desktop.

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. Open an issue describing the problem or proposed change.
2. For code changes, create a focused branch and submit a pull request.
3. Include clear reproduction steps or sample input/output for conversion-related changes.
4. Keep the project dependency-light, accessible, responsive, and local-first.

Please avoid including real or sensitive data in bug reports; use a minimal example instead.

## 📄 License

This project is released under the [MIT License](LICENSE).

---

<div align="center">

**Developed by [AabiTech](https://aabitech.com)**

</div>
