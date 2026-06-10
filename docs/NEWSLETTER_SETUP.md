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
