(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const source = $('#source-input');
  const result = $('#result-output');
  const inputFormat = $('#input-format');
  const outputFormat = $('#output-format');
  const modeCsvJson = $('#mode-csv-json');
  const modeJsonCsv = $('#mode-json-csv');
  const csvOptions = $('#csv-options');
  const jsonFormat = $('#json-format');
  const delimiterSelect = $('#delimiter-select');
  const hasHeaders = $('#has-headers');
  const copyButton = $('#copy-output');
  const downloadButton = $('#download-output');
  const errorNotice = $('#error-notice');
  const errorMessage = $('#error-message');
  const successStrip = $('#success-strip');
  const successMessage = $('#success-message');
  const toast = $('#toast');
  let direction = 'csv-json';
  let toastTimer;
  let lastOutputType = 'json';

  const samples = {
    csv: 'name,email,role,active\nAmina Khan,amina@example.com,Designer,true\nOmar Ali,omar@example.com,Developer,true\nSara Ahmed,sara@example.com,"Product, Research",false',
    json: '[\n  {\n    "name": "Amina Khan",\n    "email": "amina@example.com",\n    "role": "Designer",\n    "active": true\n  },\n  {\n    "name": "Omar Ali",\n    "email": "omar@example.com",\n    "role": "Developer",\n    "active": true\n  },\n  {\n    "name": "Sara Ahmed",\n    "email": "sara@example.com",\n    "role": "Product, Research",\n    "active": false\n  }\n]'
  };

  function setStatus(element, state, message) {
    element.classList.remove('is-good', 'is-error');
    if (state) element.classList.add(state);
    const text = element.querySelector('span:last-child');
    if (text) text.textContent = message;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorNotice.hidden = false;
    successStrip.hidden = true;
    setStatus($('#output-status'), 'is-error', 'Conversion failed');
    result.value = '';
    updateOutputCounts();
    copyButton.disabled = true;
    downloadButton.disabled = true;
  }

  function showSuccess(message) {
    errorNotice.hidden = true;
    successMessage.textContent = message;
    successStrip.hidden = false;
    setStatus($('#output-status'), 'is-good', 'Conversion successful');
  }

  function updateInputCounts() {
    const text = source.value;
    const lines = text.length ? text.split(/\r\n|\r|\n/).length : 1;
    $('#line-count').textContent = `${lines} ${lines === 1 ? 'line' : 'lines'}`;
    $('#char-count').textContent = `${text.length.toLocaleString()} chars`;
    setStatus($('#input-status'), text.trim() ? '' : '', text.trim() ? 'Input ready' : 'Ready for input');
  }

  function updateOutputCounts() {
    const text = result.value;
    const lines = text.length ? text.split(/\r\n|\r|\n/).length : 0;
    $('#output-lines').textContent = `${lines} ${lines === 1 ? 'line' : 'lines'}`;
    $('#output-chars').textContent = `${text.length.toLocaleString()} chars`;
  }

  function resolveDelimiter(text) {
    const selected = delimiterSelect.value;
    if (selected !== 'auto') return selected === '\\t' ? '\t' : selected;
    const firstLine = (text.split(/\r\n|\r|\n/).find((line) => line.trim()) || '');
    const candidates = [',', '\t', ';', '|'];
    let best = ',', bestCount = -1;
    for (const delimiter of candidates) {
      let count = 0, quoted = false;
      for (let i = 0; i < firstLine.length; i += 1) {
        if (firstLine[i] === '"') {
          if (quoted && firstLine[i + 1] === '"') i += 1;
          else quoted = !quoted;
        } else if (firstLine[i] === delimiter && !quoted) count += 1;
      }
      if (count > bestCount) { bestCount = count; best = delimiter; }
    }
    return best;
  }

  // RFC 4180-style CSV parser. Quoted cells can contain delimiters and newlines.
  function parseCsv(text, delimiter) {
    const rows = [];
    let row = [], cell = '', quoted = false;
    const input = text.replace(/^\uFEFF/, '');
    for (let i = 0; i < input.length; i += 1) {
      const char = input[i];
      if (quoted) {
        if (char === '"' && input[i + 1] === '"') { cell += '"'; i += 1; }
        else if (char === '"') quoted = false;
        else cell += char;
      } else if (char === '"') {
        if (cell.length) throw new Error(`Unexpected quote at character ${i + 1}. Quote marks must enclose a complete field.`);
        quoted = true;
      } else if (char === delimiter) {
        row.push(cell); cell = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && input[i + 1] === '\n') i += 1;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else {
        cell += char;
      }
    }
    if (quoted) throw new Error('The CSV contains an unclosed quoted field. Add a closing double quote.');
    if (cell.length || row.length || (input.length && !/[\r\n]$/.test(input))) { row.push(cell); rows.push(row); }
    while (rows.length && rows[rows.length - 1].every((value) => value.trim() === '')) rows.pop();
    return rows;
  }

  function uniqueHeaders(headers) {
    const used = new Set();
    const counts = new Map();
    return headers.map((raw, index) => {
      const base = raw.trim() || `column_${index + 1}`;
      let name = base;
      let suffix = counts.get(base) || 1;
      while (used.has(name)) {
        suffix += 1;
        name = `${base}_${suffix}`;
      }
      counts.set(base, suffix);
      used.add(name);
      return name;
    });
  }

  function csvToJson(text) {
    const delimiter = resolveDelimiter(text);
    const rows = parseCsv(text, delimiter);
    if (!rows.length) throw new Error('Add some CSV data before converting.');
    const useHeaders = hasHeaders.checked;
    let headers;
    if (useHeaders) headers = uniqueHeaders(rows.shift());
    else headers = Array.from({ length: Math.max(...rows.map((row) => row.length)) }, (_, i) => `column_${i + 1}`);
    if (!headers.length) throw new Error('No columns were found in the CSV data.');
    const data = rows.filter((row) => !(row.length === 1 && row[0].trim() === '')).map((row, rowIndex) => {
      if (row.length > headers.length) throw new Error(`Row ${rowIndex + (useHeaders ? 2 : 1)} has ${row.length} fields, but only ${headers.length} columns are defined.`);
      const values = headers.map((_, index) => row[index] ?? '');
      if (!useHeaders) return values;
      return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
    });
    return { data, delimiter };
  }

  function escapeCsv(value, delimiter) {
    let text;
    if (value === null || value === undefined) text = '';
    else if (typeof value === 'object') text = JSON.stringify(value);
    else text = String(value);
    if (text.includes('"')) text = text.replace(/"/g, '""');
    if (text.includes(delimiter) || /["\r\n]/.test(text) || /^\s|\s$/.test(text)) text = `"${text}"`;
    return text;
  }

  function jsonToCsv(text) {
    let data;
    try { data = JSON.parse(text.replace(/^\uFEFF/, '')); }
    catch (error) { throw new Error(`Invalid JSON: ${error.message}`); }
    if (!Array.isArray(data)) throw new Error('The JSON root must be an array of objects or arrays.');
    if (!data.length) return '';
    if (data.some((item) => item === null || typeof item !== 'object')) throw new Error('Every array item must be an object or an array. Primitive values cannot be mapped to CSV columns.');
    const objectRows = data.some((item) => !Array.isArray(item));
    if (objectRows && data.some((item) => Array.isArray(item))) throw new Error('Use a consistent array: all items must be objects or all items must be arrays.');
    const delimiter = resolveDelimiter('');
    if (!objectRows) return data.map((row) => row.map((value) => escapeCsv(value, delimiter)).join(delimiter)).join('\r\n');
    const headers = [...new Set(data.flatMap((item) => Object.keys(item)))];
    if (!headers.length) throw new Error('No object properties were found to use as CSV columns.');
    const lines = [headers.map((header) => escapeCsv(header, delimiter)).join(delimiter)];
    for (const item of data) lines.push(headers.map((header) => escapeCsv(item[header], delimiter)).join(delimiter));
    return lines.join('\r\n');
  }

  function convert() {
    errorNotice.hidden = true;
    successStrip.hidden = true;
    const text = source.value;
    if (!text.trim()) { showError(`Paste or import ${direction === 'csv-json' ? 'CSV' : 'JSON'} data first.`); source.focus(); return; }
    try {
      if (direction === 'csv-json') {
        const { data, delimiter } = csvToJson(text);
        result.value = JSON.stringify(data, null, jsonFormat.value === 'pretty' ? 2 : 0);
        lastOutputType = 'json';
        $('#output-note').textContent = `Delimiter: ${delimiter === '\t' ? 'Tab' : delimiter}`;
        showSuccess(`Converted ${data.length} ${data.length === 1 ? 'row' : 'rows'} to JSON.`);
      } else {
        const output = jsonToCsv(text);
        result.value = output;
        lastOutputType = 'csv';
        $('#output-note').textContent = `Delimiter: ${resolveDelimiter('') === '\t' ? 'Tab' : resolveDelimiter('')}`;
        const count = output ? output.split(/\r\n/).length : 0;
        showSuccess(`Converted JSON to CSV${count ? ` (${Math.max(0, count - 1)} data rows)` : ''}.`);
      }
      updateOutputCounts();
      copyButton.disabled = !result.value;
      downloadButton.disabled = !result.value;
      $('#format-badge').textContent = lastOutputType.toUpperCase();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Something went wrong while converting this data.');
    }
  }

  function setDirection(nextDirection) {
    direction = nextDirection;
    const csvToJson = direction === 'csv-json';
    modeCsvJson.classList.toggle('active', csvToJson);
    modeJsonCsv.classList.toggle('active', !csvToJson);
    modeCsvJson.setAttribute('aria-pressed', String(csvToJson));
    modeJsonCsv.setAttribute('aria-pressed', String(!csvToJson));
    inputFormat.textContent = csvToJson ? 'CSV' : 'JSON';
    outputFormat.textContent = csvToJson ? 'JSON' : 'CSV';
    source.placeholder = csvToJson ? 'Paste your CSV data here…' : 'Paste your JSON array here…';
    $('#input-meta').textContent = csvToJson ? 'Paste or type your data' : 'Use an array of objects or arrays';
    csvOptions.hidden = !csvToJson;
    $('#json-format').parentElement.hidden = !csvToJson;
    $('#output-note').textContent = csvToJson ? 'UTF-8 text' : 'CSV text';
    result.value = '';
    updateInputCounts(); updateOutputCounts();
    copyButton.disabled = true; downloadButton.disabled = true;
    errorNotice.hidden = true; successStrip.hidden = true;
    setStatus($('#output-status'), '', 'Waiting for conversion');
    $('#format-badge').textContent = csvToJson ? 'JSON' : 'CSV';
  }

  async function copyOutput() {
    if (!result.value) return;
    try {
      await navigator.clipboard.writeText(result.value);
      showToast('Copied to clipboard');
    } catch (_) {
      result.focus(); result.select();
      const copied = document.execCommand('copy');
      if (copied) showToast('Copied to clipboard');
      else showToast('Copy unavailable — select the output and copy manually.');
      result.setSelectionRange(0, 0);
    }
  }

  function downloadOutput() {
    if (!result.value) return;
    const mime = lastOutputType === 'json' ? 'application/json;charset=utf-8' : 'text/csv;charset=utf-8';
    const extension = lastOutputType === 'json' ? 'json' : 'csv';
    const blob = new Blob([result.value], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `converted-data.${extension}`;
    document.body.appendChild(link); link.click(); link.remove();
    URL.revokeObjectURL(url);
    showToast(`Downloaded converted-data.${extension}`);
  }

  modeCsvJson.addEventListener('click', () => setDirection('csv-json'));
  modeJsonCsv.addEventListener('click', () => setDirection('json-csv'));
  $('#convert-button').addEventListener('click', convert);
  source.addEventListener('input', () => { updateInputCounts(); errorNotice.hidden = true; successStrip.hidden = true; });
  source.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); convert(); } });
  $('#load-sample').addEventListener('click', () => { source.value = direction === 'csv-json' ? samples.csv : samples.json; updateInputCounts(); convert(); source.focus(); });
  $('#clear-input').addEventListener('click', () => { source.value = ''; result.value = ''; updateInputCounts(); updateOutputCounts(); errorNotice.hidden = true; successStrip.hidden = true; copyButton.disabled = true; downloadButton.disabled = true; setStatus($('#output-status'), '', 'Waiting for conversion'); source.focus(); });
  $('#file-input').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showError('For browser responsiveness, please import a file smaller than 10 MB.'); event.target.value = ''; return; }
    try {
      const text = await file.text();
      const looksJson = file.name.toLowerCase().endsWith('.json') || file.type === 'application/json';
      if (looksJson && direction === 'csv-json') setDirection('json-csv');
      else if (!looksJson && direction === 'json-csv') setDirection('csv-json');
      source.value = text; updateInputCounts(); convert();
    } catch (_) { showError('The selected file could not be read. Try a UTF-8 encoded CSV or JSON file.'); }
    event.target.value = '';
  });
  copyButton.addEventListener('click', copyOutput);
  downloadButton.addEventListener('click', downloadOutput);
  jsonFormat.addEventListener('change', () => { if (direction === 'csv-json' && source.value.trim()) convert(); });
  delimiterSelect.addEventListener('change', () => { if (source.value.trim()) convert(); });
  hasHeaders.addEventListener('change', () => { if (direction === 'csv-json' && source.value.trim()) convert(); });
  $('#dismiss-success').addEventListener('click', () => { successStrip.hidden = true; });
  $('#theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('csv-json-studio-theme', next); } catch (_) { /* Storage can be unavailable in private contexts. */ }
  });
  try {
    const savedTheme = localStorage.getItem('csv-json-studio-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') document.documentElement.dataset.theme = savedTheme;
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.dataset.theme = 'dark';
  } catch (_) { /* Default to light theme if storage is unavailable. */ }

  // A pasted value updates counts immediately; conversion is intentionally explicit.
  updateInputCounts(); updateOutputCounts();
})();
