# Dispatch Clipper browser extension

A small Chrome extension (`/extension`) that lets the team add the article
they're currently reading straight into the shared database. It comes in as
status **New** with `addedBy: "Browser Extension"`, so it shows up for
scoring/review like anything else.

## One-time setup (Simone)

1. **Generate a shared secret**, e.g.:
   ```
   openssl rand -hex 16
   ```

2. **Add it to Vercel.** Project → **Settings → Environment Variables**:
   - Name: `EXTENSION_API_SECRET`
   - Value: the string from step 1
   - Environment: Production (and Preview if you want)

   Redeploy so it takes effect. (If this var isn't set, the endpoint is
   unauthenticated — fine for local testing, not for prod.)

3. **Share the secret with the team** (Slack DM, password manager — not a
   public channel) along with the install steps below.

## Install (each team member)

Send the team to **`https://svdg-dispatch.vercel.app/extension`** — it has a
"Download for Chrome" button and these same steps. Chrome doesn't allow
auto-installing unpacked extensions, so it's a one-time ~1 minute setup:

1. Click **Download for Chrome** and unzip the downloaded file.
2. Go to `chrome://extensions`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the unzipped folder.
5. Pin the "SVDG Dispatch Clipper" icon (puzzle-piece icon → pin).
6. Click the icon → **Settings** (bottom of popup).
7. Set:
   - **Dispatch site URL**: `https://svdg-dispatch.vercel.app` (pre-filled)
   - **API key**: the shared secret Simone sent you
8. Click **Save**.

## Using it

1. On any article, click the Dispatch icon.
2. Title, URL, source, and a description are pre-filled (from the page's
   meta description, or your text selection if you've highlighted something).
3. Edit anything, check relevant categories, optionally add tags.
4. Click **Add to Dispatch**.

Duplicate URLs are detected automatically — clipping the same article twice
just returns the existing entry instead of creating a copy.

## Updating the extension later

If `extension/` files change, everyone needs to reload it: `chrome://extensions`
→ click the refresh icon on the Dispatch Clipper card.
