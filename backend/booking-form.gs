/* ============================================================================
   Tilli — "Book a 30-minute call" form backend (Google Apps Script)

   The site's form (js/booking-form.js) POSTs here. Each submission is appended
   to the "Leads" tab, an alert email goes out instantly to NOTIFY_TO (Reply-To
   = the lead, so a plain "Reply" reaches them), and the lead gets a "we got
   your request" confirmation with the Calendly + WhatsApp links (Reply-To =
   CONFIRM_REPLY_TO). Both emails are sent from the account that owns the script.

   NOT published with the site (backend/ is in .assetsignore). It lives here so
   the source is versioned; the copy that actually runs is in Google.

   ── One-time setup (signed in as info@tillikids.com) ────────────────────────
   1. sheets.new → name it "Tilli — Website leads".
   2. Extensions → Apps Script → replace Code.gs with this whole file → Save.
   3. In testNotify below, set the test email to an inbox you can check.
      Select `testNotify` in the toolbar → Run → approve the permissions.
      A test row, the alert email and the confirmation email should arrive.
      (Delete the test row after.)
   4. Deploy → New deployment → type "Web app"
        Execute as:      Me
        Who has access:  Anyone
      → Deploy → copy the Web app URL (ends in /exec).
   5. Paste that URL into FORM_ENDPOINT in js/site-config.js.
   6. Share the sheet with kavindya@tillikids.com (Editor) so Kavi can see leads.
      Keep info@ as the OWNER: the web app runs as the account that deployed it,
      so moving ownership can break the live form.

   Editing this script later: Deploy → Manage deployments → ✎ → Version: "New
   version" → Deploy. That keeps the same /exec URL, so the site needs no change.
   ─────────────────────────────────────────────────────────────────────────── */

/* Keep CALENDLY_URL / WHATSAPP_* in step with js/site-config.js. */
const CONFIG = {
  NOTIFY_TO: 'info@tillikids.com,kavindya@tillikids.com',
  CONFIRM_REPLY_TO: 'kavindya@tillikids.com',
  CALENDLY_URL: 'https://calendly.com/kavindya-tilli/conversations-kavi',
  WHATSAPP_NUMBER: '94741889706',
  WHATSAPP_PREFILL: "Hi Kavi! I'd love to learn more about bringing Tilli to our school.",
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
  try { confirm_(lead); } catch (err) { console.error('confirm failed', err); }
  return json_({ ok: true });
}

/* Run once from the editor to authorise + check the email lands. */
function testNotify() {
  doPost({ parameter: {
    name: 'Test Lead', role: 'Principal', school: 'Test School', school_type: 'CBSE',
    email: 'info@tillikids.com', phone: '+94 77 000 0000',
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
      '<p>Someone on tillikids.com couldn’t find a Calendly time that worked and left their ' +
      'details instead, so please reach out to set up the 30-minute call. Their confirmation ' +
      'email also has your Calendly link, so check Calendly first in case they booked after all.</p>' +
      '<table style="border-collapse:collapse;font-size:14px">' + rows + '</table>' +
      '<p style="margin-top:16px">' +
        '<a href="mailto:' + esc_(lead.email) + '">Email them</a>' +
        (wa.length >= 7 ? ' &nbsp;·&nbsp; <a href="https://wa.me/' + wa + '">WhatsApp them</a>' : '') +
        ' &nbsp;·&nbsp; <a href="' + sheetUrl + '">Open the leads sheet</a></p>',
    body: COLUMNS.filter(([key]) => key !== 'received_at' && lead[key])
      .map(([key, label]) => label + ': ' + lead[key]).join('\n') + '\n\nLeads sheet: ' + sheetUrl,
  });
}

/* "We got your request" email to the lead, with Calendly + WhatsApp links. */
function confirm_(lead) {
  const first = lead.name.split(/\s+/)[0];
  const cal = CONFIG.CALENDLY_URL +
    '?name=' + encodeURIComponent(lead.name) + '&email=' + encodeURIComponent(lead.email);
  const wa = 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(CONFIG.WHATSAPP_PREFILL);
  const about = lead.school ? 'bringing Tilli to ' + lead.school : 'bringing Tilli to your school';

  MailApp.sendEmail({
    to: lead.email,
    replyTo: CONFIG.CONFIRM_REPLY_TO,
    name: 'Team Tilli',
    subject: 'We got your request. Talk soon! 🌱',
    htmlBody:
      '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#333;max-width:520px">' +
        '<p>Hi ' + esc_(first) + ',</p>' +
        '<p>Thanks for reaching out about ' + esc_(about) + '. We’ve received your request, and ' +
          'Kavi’s team will be in touch at this email soon.</p>' +
        '<p style="margin:24px 0 8px"><strong>Want to pick a time now?</strong></p>' +
        '<p style="margin:0 0 24px"><a href="' + esc_(cal) + '" style="display:inline-block;background:#E91E8C;' +
          'color:#fff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:999px">' +
          'Book a 30-minute call with Kavi</a></p>' +
        '<p>Prefer to chat? <a href="' + esc_(wa) + '">Message us on WhatsApp</a></p>' +
        '<p style="margin-top:24px">Warmly,<br>Team Tilli</p>' +
      '</div>',
    body:
      'Hi ' + first + ',\n\n' +
      'Thanks for reaching out about ' + about + '. We’ve received your request, and ' +
      'Kavi’s team will be in touch at this email soon.\n\n' +
      'Want to pick a time now? Book a 30-minute call with Kavi:\n' + cal + '\n\n' +
      'Prefer to chat? Message us on WhatsApp:\n' + wa + '\n\n' +
      'Warmly,\nTeam Tilli',
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
