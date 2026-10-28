/* ============================================================================
   Tilli -- "Book a 30-minute call" form backend (Google Apps Script)

   The site's form (js/booking-form.js) POSTs here. Each submission is appended
   to the "Leads" tab, an alert email goes out instantly to NOTIFY_TO (Reply-To
   = the lead, so a plain "Reply" reaches them), and the lead gets a "we got
   your request" confirmation with the Calendly + WhatsApp links (Reply-To =
   CONFIRM_REPLY_TO). Both emails are sent from the account that owns the script.

   NOT published with the site (backend/ is in .assetsignore). It lives here so
   the source is versioned; the copy that actually runs is in Google.

   -- One-time setup (signed in as info@tillikids.com) ------------------------
   1. sheets.new -> name it "Tilli -- Website leads".
   2. Extensions -> Apps Script -> replace Code.gs with this whole file -> Save.
   3. In testNotify below, set the test email to an inbox you can check.
      Select `testNotify` in the toolbar -> Run -> approve the permissions.
      A test row, the alert email and the confirmation email should arrive.
      (Delete the test row after.)
   4. Deploy -> New deployment -> type "Web app"
        Execute as:      Me
        Who has access:  Anyone
      -> Deploy -> copy the Web app URL (ends in /exec).
   5. Paste that URL into FORM_ENDPOINT in js/site-config.js.
   6. Share the sheet with kavindya@tillikids.com (Editor) so Kavi can see leads.
      Keep info@ as the OWNER: the web app runs as the account that deployed it,
      so moving ownership can break the live form.

   Editing this script later: Deploy -> Manage deployments -> (pencil) -> Version: "New
   version" -> Deploy. That keeps the same /exec URL, so the site needs no change.
   --------------------------------------------------------------------------- */

/* Keep CALENDLY_URL / WHATSAPP_* / KAVI_LINKEDIN in step with js/site-config.js.
   SITE_URL hosts the logo + Kavi's photo shown in the confirmation email:
   update it when the site moves to its final domain, or the images break.
   This file is kept ASCII-only (curly quotes / emoji written as HTML or \u
   escapes) so copy-pasting it into the Apps Script editor can't garble text. */
const CONFIG = {
  NOTIFY_TO: 'info@tillikids.com,kavindya@tillikids.com',
  CONFIRM_REPLY_TO: 'kavindya@tillikids.com',
  SITE_URL: 'https://tillinewwebsite.ishanirai.com',
  KAVI_LINKEDIN: 'https://www.linkedin.com/in/kavindyathennakoon/',
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

/* -- helpers -------------------------------------------------------------- */

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
      '<p>Someone on tillikids.com couldn&rsquo;t find a Calendly time that worked and left their ' +
      'details instead, so please reach out to set up the 30-minute call. Their confirmation ' +
      'email also has your Calendly link, so check Calendly first in case they booked after all.</p>' +
      '<table style="border-collapse:collapse;font-size:14px">' + rows + '</table>' +
      '<p style="margin-top:16px">' +
        '<a href="mailto:' + esc_(lead.email) + '">Email them</a>' +
        (wa.length >= 7 ? ' &nbsp;&middot;&nbsp; <a href="https://wa.me/' + wa + '">WhatsApp them</a>' : '') +
        ' &nbsp;&middot;&nbsp; <a href="' + sheetUrl + '">Open the leads sheet</a></p>',
    body: COLUMNS.filter(([key]) => key !== 'received_at' && lead[key])
      .map(([key, label]) => label + ': ' + lead[key]).join('\n') + '\n\nLeads sheet: ' + sheetUrl,
  });
}

/* "We've got your details" email to the lead, styled like the website's
   booking pop-up: colour rail, logo, Kavi card, Pick a time + WhatsApp.
   Table layout + inline styles so Gmail / Outlook / Apple Mail all render it. */
function confirm_(lead) {
  const first = lead.name.split(/\s+/)[0];
  const cal = CONFIG.CALENDLY_URL +
    '?name=' + encodeURIComponent(lead.name) + '&email=' + encodeURIComponent(lead.email);
  const wa = 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(CONFIG.WHATSAPP_PREFILL);
  const img = CONFIG.SITE_URL + '/assets/ds/';
  const font = "font-family:Montserrat,'Helvetica Neue',Arial,sans-serif;";
  const rail = ['#56C02B', '#E866B0', '#26BDE2', '#FCC30B']
    .map((c) => '<td style="height:6px;background:' + c + ';font-size:0;line-height:0">&nbsp;</td>').join('');
  const btn = (href, label, primary) =>
    '<a href="' + esc_(href) + '" style="' + font + 'display:block;text-align:center;text-decoration:none;' +
    'font-size:15px;font-weight:700;padding:14px 12px;border-radius:999px;' +
    (primary ? 'background:#E91E8C;color:#ffffff;border:2px solid #E91E8C'
             : 'background:#ffffff;color:#3D3D3D;border:2px solid #C7CDD8') + '">' + label + '</a>';

  const html =
    '<div style="background:#F8F9FB;padding:24px 12px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;' +
      'background:#ffffff;border-radius:24px;overflow:hidden;border-collapse:separate">' +
      '<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' + rail + '</tr></table></td></tr>' +
      '<tr><td style="padding:28px 32px 8px;' + font + '">' +
        '<img src="' + img + 'tilli-logo.png" width="96" alt="Tilli" style="display:block;border:0;margin:0 0 24px">' +
        '<div style="width:48px;height:48px;border-radius:50%;background:#56C02B;color:#ffffff;font-size:26px;' +
          'line-height:48px;text-align:center;font-weight:700;margin:0 0 16px">&#10003;</div>' +
        '<h1 style="' + font + 'font-size:26px;line-height:1.2;font-weight:800;color:#141414;margin:0 0 10px">' +
          'Thank you, ' + esc_(first) + '! We&rsquo;ve got your details.</h1>' +
        '<p style="' + font + 'font-size:16px;line-height:1.6;color:#656565;margin:0">' +
          'Kavi&rsquo;s team will reach out soon to find a time for your 30-minute call' +
          (lead.school ? ' about bringing Tilli to ' + esc_(lead.school) : '') + '.</p>' +
      '</td></tr>' +
      // Kavi card
      '<tr><td style="padding:20px 32px 0">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FB;border-radius:16px">' +
          '<tr><td width="88" style="padding:14px 0 14px 16px;vertical-align:middle">' +
            '<img src="' + img + 'kavi.jpg" width="72" height="72" alt="Kavi" style="display:block;border:0;border-radius:50%">' +
          '</td><td style="padding:14px 16px;vertical-align:middle;' + font + '">' +
            '<div style="font-size:17px;font-weight:800;color:#3D3D3D">Kavindya Tennakoon</div>' +
            '<div style="font-size:14px;color:#656565;margin-top:3px">Founder &amp; CEO, Tilli &middot; Stanford researcher</div>' +
            '<a href="' + esc_(CONFIG.KAVI_LINKEDIN) + '" style="display:inline-block;margin-top:4px;font-size:14px;' +
              'font-weight:600;color:#0F94B5;text-decoration:none">View LinkedIn</a>' +
          '</td></tr></table>' +
      '</td></tr>' +
      // Buttons
      '<tr><td style="padding:24px 32px 0;' + font + '">' +
        '<p style="font-size:16px;font-weight:800;color:#3D3D3D;margin:0 0 12px">Found a time that works after all?</p>' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
          '<td width="50%" style="padding-right:5px">' + btn(cal, 'Pick a time', true) + '</td>' +
          '<td width="50%" style="padding-left:5px">' + btn(wa, 'Chat on WhatsApp', false) + '</td>' +
        '</tr></table>' +
      '</td></tr>' +
      '<tr><td style="padding:28px 32px 28px;' + font + 'font-size:16px;line-height:1.6;color:#3D3D3D">' +
        'Warmly,<br><strong>Team Tilli</strong></td></tr>' +
    '</table>' +
    '<p style="' + font + 'max-width:560px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#8A91A0;text-align:center">' +
      'You&rsquo;re getting this because you asked for a call on the Tilli website. ' +
      'Just reply to this email to reach Kavi.</p>' +
    '</div>';

  MailApp.sendEmail({
    to: lead.email,
    replyTo: CONFIG.CONFIRM_REPLY_TO,
    name: 'Team Tilli',
    subject: 'Thank you, ' + first + '! We\u2019ve got your details',
    htmlBody: html,
    body:
      'Thank you, ' + first + '! We\'ve got your details.\n\n' +
      'Kavi\'s team will reach out soon to find a time for your 30-minute call' +
      (lead.school ? ' about bringing Tilli to ' + lead.school : '') + '.\n\n' +
      'Found a time that works after all?\n' +
      'Pick a time: ' + cal + '\n' +
      'Chat on WhatsApp: ' + wa + '\n\n' +
      'Warmly,\nTeam Tilli',
  });
}

function clean_(v) { return String(v == null ? '' : v).trim().slice(0, 2000); }
function digits_(v) { return String(v || '').replace(/\D/g, ''); }
/* Leading = + - @ would be parsed as a formula ("+94 ..." phones included). */
function cell_(v) { return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v; }
function esc_(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
