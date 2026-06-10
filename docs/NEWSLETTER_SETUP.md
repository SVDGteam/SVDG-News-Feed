# Weekly Rundown newsletter — Google Sheet setup

The signup forms (footer + `/newsletter` page) post to `/api/subscribe`. On
Vercel the filesystem is read-only, so subscribers are written to a Google
Sheet via a small Apps Script "web app" instead of a local JSON file.

Locally (`npm run dev`), if `GOOGLE_SHEET_WEBHOOK_URL` isn't set, subscribers
are written to `data/subscribers.json` instead — no setup needed for local
testing.

## One-time setup (5–10 min)

1. **Create the sheet.** Make a new Google Sheet called something like
   "Weekly Rundown Subscribers." Add a header row: `Email | Source | Date`.

2. **Open the script editor.** In the sheet, go to
   **Extensions → Apps Script**. Delete any starter code and paste this in:

   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     var data = JSON.parse(e.postData.contents);
     var email = (data.email || '').toLowerCase().trim();

     var lastRow = sheet.getLastRow();
     var existing = lastRow > 1
       ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat()
       : [];
     var alreadySubscribed = existing.indexOf(email) !== -1;

     if (!alreadySubscribed && email) {
       sheet.appendRow([email, data.source || '', data.timestamp || new Date().toISOString()]);
     }

     return ContentService
       .createTextOutput(JSON.stringify({ ok: true, alreadySubscribed: alreadySubscribed }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. **Deploy as a web app.** Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, authorize when prompted, and copy the **Web app URL**
     (ends in `/exec`).

4. **Add the URL to Vercel.** In your Vercel project →
   **Settings → Environment Variables**, add:
   - Name: `GOOGLE_SHEET_WEBHOOK_URL`
   - Value: the `/exec` URL from step 3
   - Environment: Production (and Preview if you want)

   Redeploy (or trigger a new deploy by pushing a commit) so the variable
   takes effect.

## Notes

- Treat the `/exec` URL as semi-secret — anyone with it can append rows to
  the sheet. Don't post it publicly.
- If you ever update the Apps Script code, you'll need to create a **new
  deployment version** (Deploy → Manage deployments → Edit → New version)
  for the changes to take effect on the existing URL.
- To switch providers later (Airtable, Mailchimp, etc.), only
  `src/app/api/subscribe/route.ts` needs to change.

---

## Part 2 — Sending the weekly newsletter automatically

The site renders the digest as a ready-to-send email at
`/api/newsletter/digest` (returns `{ subject, html, text }` for this week's
top 6 stories, same ranking as the `/newsletter` page). The same Apps Script
project from Part 1 fetches that and emails every subscriber via your Google
account — no separate email service needed.

### 1. Add the send functions to the Apps Script

Open the same script from Part 1 (**Extensions → Apps Script** on the
sheet) and add these functions alongside `doPost`:

```javascript
// ── Config ──────────────────────────────────────────────────────────────
// Set these in Project Settings (gear icon) → Script Properties:
//   DIGEST_URL    = https://<your-deployed-site>/api/newsletter/digest
//   DIGEST_SECRET = a random string (also set as NEWSLETTER_DIGEST_SECRET
//                   in Vercel — must match exactly)

var LOGO_URL = 'https://svdg-news-feed.vercel.app/brand/logomark-color.png';

// Swaps the external logo URL for a cid: reference and returns the blob to
// attach inline. Without this, Gmail shows "Images are not displayed" for
// every recipient until they click "Display images below".
function embedLogo_(html) {
  var logoBlob = UrlFetchApp.fetch(LOGO_URL).getBlob().setName('logo');
  return {
    html: html.split(LOGO_URL).join('cid:logo'),
    inlineImages: { logo: logoBlob },
  };
}

// ── Weekly send ─────────────────────────────────────────────────────────
// Run automatically by a time-driven trigger (set up in step 4 below).
// Fetches the rendered digest from the site and emails it to every
// subscriber in the sheet.
function sendWeeklyNewsletter() {
  var props = PropertiesService.getScriptProperties();
  var digestUrl = props.getProperty('DIGEST_URL');
  var secret = props.getProperty('DIGEST_SECRET');

  if (!digestUrl) {
    throw new Error('Set the DIGEST_URL script property first.');
  }

  var url = digestUrl + (secret ? '?key=' + encodeURIComponent(secret) : '');
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) {
    throw new Error('Digest fetch failed: ' + res.getResponseCode() + ' ' + res.getContentText());
  }
  var email = JSON.parse(res.getContentText());
  var embedded = embedLogo_(email.html);

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return; // no subscribers yet

  var emails = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().filter(String);

  emails.forEach(function (to) {
    MailApp.sendEmail({
      to: to,
      subject: email.subject,
      htmlBody: embedded.html,
      body: email.text,
      name: 'SVDG Dispatch',
      inlineImages: embedded.inlineImages,
    });
  });
}

// ── Manual test send ────────────────────────────────────────────────────
// Select this function in the dropdown and click Run to email yourself a
// preview of the current digest, without sending to the full list.
function sendTestNewsletter() {
  var props = PropertiesService.getScriptProperties();
  var digestUrl = props.getProperty('DIGEST_URL');
  var secret = props.getProperty('DIGEST_SECRET');
  var testRecipient = Session.getActiveUser().getEmail();

  var url = digestUrl + (secret ? '?key=' + encodeURIComponent(secret) : '');
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  var email = JSON.parse(res.getContentText());
  var embedded = embedLogo_(email.html);

  MailApp.sendEmail({
    to: testRecipient,
    subject: '[TEST] ' + email.subject,
    htmlBody: embedded.html,
    body: email.text,
    name: 'SVDG Dispatch',
    inlineImages: embedded.inlineImages,
  });
}
```

### 2. Set the script properties

In the Apps Script editor: **Project Settings** (gear icon, left sidebar) →
**Script Properties** → **Add script property**, twice:

- `DIGEST_URL` = `https://<your-deployed-site>/api/newsletter/digest`
- `DIGEST_SECRET` = any random string, e.g. generate one with
  `openssl rand -hex 16`

### 3. Add the matching secret to Vercel

In Vercel → **Settings → Environment Variables**, add:

- Name: `NEWSLETTER_DIGEST_SECRET`
- Value: the **same string** you used for `DIGEST_SECRET` above
- Environment: Production (and Preview if you want)

Redeploy so it takes effect. (If you skip this, `/api/newsletter/digest` is
unauthenticated — fine for testing, but anyone with the URL could read it.)

### 4. New deployment version

Since the script code changed: **Deploy → Manage deployments → Edit (pencil
icon) → Version: New version → Deploy**. (The `/exec` URL from Part 1 stays
the same.)

### 5. Test it

In the Apps Script editor, select **sendTestNewsletter** from the function
dropdown (top toolbar) and click **Run**. Authorize Gmail access if prompted.
Check your inbox — this is the actual rendered email, dark Dispatch theme and
all.

### 6. Set up the weekly trigger

Click the clock icon (**Triggers**) in the left sidebar → **Add Trigger**:

- Function: `sendWeeklyNewsletter`
- Event source: **Time-driven**
- Type: **Week timer**
- Day: Friday (or whichever day fits the team's cadence)
- Time: e.g. 8am–9am

Save. The newsletter now goes out automatically every week to everyone in
the subscriber sheet.

### Notes

- Sending uses your Google account's `MailApp` quota — 100 emails/day for a
  free Gmail account, 1,500/day for Google Workspace. Fine for an internal
  team list; if the subscriber list grows large, switch to a dedicated
  email service (e.g. Resend) instead.
- To send a one-off issue outside the schedule, just run
  `sendWeeklyNewsletter` manually from the editor.
