const NAMES = ['player 1', 'player 2', 'player 3', 'player 4'];
const FORMS = ['reflection', 'mandala', 'spike'];
const DRAFT_SHEET = 'drafts';
const DRAFT_HEADER = ['key', 'name', 'form', 'savedAt', 'json'];
const MAX_CELL_CHARS = 2000;
const MAX_ROW_CELLS = 100;
const MAX_DRAFT_CHARS = 45000;

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    switch (p.action) {
      case 'ping': return json({ ok: true, serverTime: new Date().toISOString() });
      case 'names': return json({ ok: true, names: NAMES });
      case 'draft': return json(readDraft(requireName(p.name), requireForm(p.form)));
      default: return json({ ok: false, error: 'unknown action' });
    }
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    switch (body.action) {
      case 'submit': return json(appendSubmission(requireName(body.name), requireForm(body.form), body.header, body.row));
      case 'saveDraft': return json(upsertDraft(requireName(body.name), requireForm(body.form), body.savedAt, body.json));
      case 'deleteDraft': return json(removeDraft(requireName(body.name), requireForm(body.form)));
      default: return json({ ok: false, error: 'unknown action' });
    }
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function requireName(name) {
  if (NAMES.indexOf(name) < 0) throw new Error('unknown name');
  return name;
}

function requireForm(form) {
  if (FORMS.indexOf(form) < 0) throw new Error('unknown form');
  return form;
}

function cleanCell(v) {
  const s = v === null || v === undefined ? '' : String(v);
  if (s.length > MAX_CELL_CHARS) throw new Error('cell too long');
  return /^\s*[=+\-@]/.test(s) ? "'" + s : s;
}

function sheetFor(name, header) {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(header);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function withLock(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function appendSubmission(name, form, header, row) {
  if (!Array.isArray(row) || row.length > MAX_ROW_CELLS) throw new Error('bad row');
  if (!Array.isArray(header) || header.length !== row.length) throw new Error('header/row mismatch');
  const cells = row.map(cleanCell);
  const head = header.map(cleanCell);
  return withLock(function () {
    const sheet = sheetFor(form, head);
    sheet.appendRow(cells);
    return { ok: true, row: sheet.getLastRow() };
  });
}

function upsertDraft(name, form, savedAt, jsonText) {
  if (typeof jsonText !== 'string' || jsonText.length > MAX_DRAFT_CHARS) throw new Error('bad draft');
  const key = name + '|' + form;
  return withLock(function () {
    const sheet = sheetFor(DRAFT_SHEET, DRAFT_HEADER);
    const keys = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
    let at = -1;
    for (let i = 0; i < keys.length; i++) if (keys[i][0] === key) { at = i + 2; break; }
    const values = [[key, name, form, String(savedAt), jsonText]];
    if (at > 0) sheet.getRange(at, 1, 1, 5).setValues(values);
    else sheet.appendRow(values[0]);
    return { ok: true, updated: at > 0 };
  });
}

function readDraft(name, form) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(DRAFT_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return { ok: true, draft: null };
  const key = name + '|' + form;
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === key) return { ok: true, draft: { savedAt: rows[i][3], json: rows[i][4] } };
  }
  return { ok: true, draft: null };
}

function removeDraft(name, form) {
  const key = name + '|' + form;
  return withLock(function () {
    const sheet = SpreadsheetApp.getActive().getSheetByName(DRAFT_SHEET);
    if (!sheet || sheet.getLastRow() < 2) return { ok: true, removed: false };
    const keys = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < keys.length; i++) {
      if (keys[i][0] === key) { sheet.deleteRow(i + 2); return { ok: true, removed: true }; }
    }
    return { ok: true, removed: false };
  });
}
