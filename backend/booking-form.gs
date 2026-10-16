/* ============================================================================
   Tilli — "Book a 30-minute call" form backend (Google Apps Script)

   The site's form (js/site-chrome.js) POSTs here. Each submission is appended
   to the "Leads" tab and an alert email goes out instantly to NOTIFY_TO, with
   Reply-To set to the lead so a plain "Reply" reaches them.

   NOT published with the site (backend/ is in .assetsignore). It lives here so
   the source is versioned; the copy that actually runs is in Google.

   ── One-time setup (signed in as kavindya@tillikids.com) ────────────────────
   1. sheets.new → name it "Tilli — Website leads".
   2. Extensions → Apps Script → replace Code.gs with this whole file → Save.
   3. Select `testNotify` in the toolbar → Run → approve the permissions.
      A test row + test email should arrive. (Delete the test row after.)
   4. Deploy → New deployment → type "Web app"
        Execute as:      Me
        Who has access:  Anyone
      → Deploy → copy the Web app URL (ends in /exec).
   5. Paste that URL into FORM_ENDPOINT in js/site-config.js.

   Editing this script later: Deploy → Manage deployments → ✎ → Version: "New
   version" → Deploy. That keeps the same /exec URL, so the site needs no change.
   ─────────────────────────────────────────────────────────────────────────── */

const CONFIG = {
  NOTIFY_TO: 'info@tillikids.com,kavindya@tillikids.com',
  SHEET_NAME: 'Leads',
};

const COLUMNS = [
  ['received_at', 'Received'],
  ['name', 'Name'],
  ['role', 'Role'],
  ['school', 'School / organisation'],
  ['school_type', 'Kind of school'],
  ['email', 'Email'],
  ['phone', 'Phone (WhatsApp)'],
  ['message', 'Message'],
  ['page', 'Page'],
  ['repeat', 'Submitted before?'],
];

function doPost(e) {
  const p = (e && e.parameter) || {};
  // Honeypot: the hidden "website" field is only ever filled by bots.
  if (p.website) return json_({ ok: true });

  const lead = {};
  COLUMNS.forEach(([key]) => { lead[key] = clean_(p[key]); });
  lead.received_at = new Date();
  if (!lead.name || !lead.email) return json_({ ok: false, error: 'missing fields' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = sheet_();
    lead.repeat = findRepeat_(sheet, lead);
    sheet.appendRow(COLUMNS.map(([key]) => cell_(lead[key])));
  } finally {
    lock.releaseLock();
  }

  // The row is saved; a mail failure must not lose it or error the form.
  try { notify_(lead); } catch (err) { console.error('notify failed', err); }
  return json_({ ok: true });
}

/* Run once from the editor to authorise + check the email lands. */
function testNotify() {
  doPost({ parameter: {
    name: 'Test Lead', role: 'Principal', school: 'Test School', school_type: 'CBSE',
    email: 'test@example.com', phone: '+94 77 000 0000',
    message: 'Test submission from the Apps Script editor.', page: '/test',
  }});
}

/* ── helpers ────────────────────────────────────────────────────────────── */

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.SHEET_NAME);
    sh.appendRow(COLUMNS.map(([, label]) => label));
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
  }
  return sh;
}

/* "Yes (12 Oct 2026)" if the same email or phone is already in the sheet. */
function findRepeat_(sheet, lead) {
  const n = sheet.getLastRow() - 1;
  if (n < 1) return '';
  const col = (key) => COLUMNS.findIndex(([k]) => k === key);
  const rows = sheet.getRange(2, 1, n, COLUMNS.length).getValues();
  const email = lead.email.toLowerCase();
  const phone = digits_(lead.phone);
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    const sameEmail = String(r[col('email')]).toLowerCase() === email;
    const samePhone = phone.length >= 7 && digits_(r[col('phone')]) === phone;
    if (sameEmail || samePhone) {
      const when = r[col('received_at')];
      return 'Yes' + (when instanceof Date
        ? ' (' + Utilities.formatDate(when, Session.getScriptTimeZone(), 'd MMM yyyy') + ')' : '');
    }
  }
  return '';
}

function notify_(lead) {
  const wa = digits_(lead.phone);
  const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const rows = COLUMNS
    .filter(([key]) => key !== 'received_at' && lead[key])
    .map(([key, label]) =>
      '<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">' + label + '</td>' +
      '<td style="padding:4px 0">' + esc_(lead[key]).replace(/\n/g, '<br>') + '</td></tr>')
    .join('');

  const subject = (lead.repeat ? '[Repeat] ' : '') +
    'New call request: ' + lead.name + (lead.school ? ' (' + lead.school + ')' : '');

  MailApp.sendEmail({
    to: CONFIG.NOTIFY_TO,
    replyTo: lead.email,
    name: 'Tilli website',
    subject: subject,
    htmlBody:
      '<p>Someone just asked to book a 30-minute call on tillikids.com. They were shown your ' +
      'Calendly link right after submitting, so check Calendly before following up.</p>' +
      '<table style="border-collapse:collapse;font-size:14px">' + rows + '</table>' +
      '<p style="margin-top:16px">' +
        '<a href="mailto:' + esc_(lead.email) + '">Email them</a>' +
        (wa.length >= 7 ? ' &nbsp;·&nbsp; <a href="https://wa.me/' + wa + '">WhatsApp them</a>' : '') +
        ' &nbsp;·&nbsp; <a href="' + sheetUrl + '">Open the leads sheet</a></p>',
    body: COLUMNS.filter(([key]) => key !== 'received_at' && lead[key])
      .map(([key, label]) => label + ': ' + lead[key]).join('\n') + '\n\nLeads sheet: ' + sheetUrl,
  });
}

function clean_(v) { return String(v == null ? '' : v).trim().slice(0, 2000); }
function digits_(v) { return String(v || '').replace(/\D/g, ''); }
/* Leading = + - @ would be parsed as a formula ("+94 …" phones included). */
function cell_(v) { return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v; }
function esc_(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
