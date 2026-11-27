# WishCraft ✨: paid animated cards (₹30, a ₹5 discount on ₹35)

People make an animated wish, proposal or apology card with photos and music, preview it for free,
pay ₹30 through Razorpay, and get a short link (`yoursite.com/w/AbC123xy`) to send.
A card **only opens after it is paid**. The server checks every payment.

```
public/            the website (index.html, style.css, app.js)
api/               server code (runs as Vercel functions)
  cards.js           save a new card, give back upload links
  checkout.js        create the Razorpay order (price is fixed on the server)
  verify.js          confirm the payment signature → mark card paid
  status.js          creator checks if their card is paid / opened
  card.js            recipient loads a card (only if paid)
  razorpay-webhook.js  backup confirmation from Razorpay
  upload.js, media.js  local test mode only
supabase/schema.sql  database + storage setup
dev-server.js        run everything on your computer
```

---

## 1. Try it on your computer (no accounts needed)

You need Node.js 18 or newer.

```bash
npm run dev
```

Open http://localhost:3000. With no keys set, it runs in **TEST MODE**:
- cards and photos are saved in a local `.data/` folder
- the payment step shows a "Pretend to pay ₹30" button (no real money)

Test payments are **automatically disabled online** (on Vercel), so this can never be abused there.

---

## 2. Set up Supabase (database + photo storage), free

Supabase keeps your cards and photos (briefly: they are deleted after 7 days). The site needs it when it is online.

**Step 1: create the project**
1. Go to https://supabase.com and sign up (GitHub or Google works).
2. Click **New project**. Name it `wishcraft`, set a database password (save it somewhere, the site does not need it),
   choose the region **Mumbai** (closest to India) and the **Free** plan. Click **Create**. Wait about 2 minutes.

**Step 2: create the table and the photo bucket**
1. In the left menu open **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this project, copy everything, paste it in, click **Run**. You should see "Success".
3. Open **Storage** in the left menu: you should see a bucket called `wish-media` marked **Private**.

**Step 3: copy two things from Supabase**
Open **Project Settings** (gear icon) → **API** (it may be called **API Keys** or **Data API**).
- **Project URL**, for example `https://abcdefghijklmnopqrst.supabase.co`
- The **secret** key: either the one starting with `sb_secret_`, or the long **service_role** key (click Reveal).
  ⚠️ Do **not** use the "anon" or "publishable" key. Never share the secret key, put it in `public/`, or commit it.

**Step 4: paste them where the site can read them**

*On Vercel (this is what your live site uses):* Project → **Settings → Environment Variables**. Add these, one at a time
(tick Production; no quotes, no spaces, no slash at the end of the URL):

| Name | Value |
|---|---|
| `SUPABASE_URL` | your Project URL |
| `SUPABASE_SERVICE_KEY` | your secret key |
| `SUPABASE_BUCKET` | `wish-media` |
| `PRICE_INR` | `30` |
| `LIST_PRICE_INR` | `35` |
| `CRON_SECRET` | any long random text |

Then go to **Deployments**, open the latest one, and click **Redeploy**. Settings only apply to new deployments.

*On your computer (optional):* the same lines go in the `.env` file:
```
SUPABASE_URL=https://abcdefghijklmnopqrst.supabase.co
SUPABASE_SERVICE_KEY=sb_secret_xxxxxxxxxxxxxxxx
SUPABASE_BUCKET=wish-media
```
Careful: once these are filled in, testing on your computer uses your real Supabase (and real Razorpay if those keys are in
there too). To test safely, keep `.env` empty (the site then uses a local test mode) and use Vercel for the real thing.

**Step 5: check it works**
- Run `npm run check:setup`. It reads your `.env` and tells you in plain words what is missing or wrong.
- On the live site, make a test card with a photo. In Supabase: **Table Editor → cards** shows a new row, and
  **Storage → wish-media** shows a folder with the photo. After 7 days both are deleted automatically.

## 3. Razorpay (payments)

1. Sign up at https://razorpay.com. You can use **Test Mode** right away.
2. **Settings → API Keys → Generate Test Key** → copy Key ID and Key Secret.
3. Test card for test mode: `4111 1111 1111 1111`, any future expiry, any CVV. For UPI test use `success@razorpay`.
4. To accept **real money**, complete KYC (PAN, bank account). Razorpay also checks that your
   website has policy pages. They're already built (see **Policy pages** below). Just fill in your details first.
5. After activation, generate **Live** keys and replace the test keys.

## 4. Put it online with Vercel

1. Push this folder to a GitHub repo (the `.gitignore` already keeps `.env` and `.data` out).
2. At https://vercel.com → **Add New → Project** → import the repo → Deploy. No build settings are needed.
3. **Project → Settings → Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | from step 2 |
   | `SUPABASE_SERVICE_KEY` | from step 2 |
   | `SUPABASE_BUCKET` | `wish-media` |
   | `RAZORPAY_KEY_ID` | from step 3 |
   | `RAZORPAY_KEY_SECRET` | from step 3 |
   | `PRICE_INR` | `30` (what is charged) |
   | `LIST_PRICE_INR` | `35` (shown crossed out) |

4. **Redeploy** so the variables take effect.
5. (Recommended) Razorpay **Settings → Webhooks → Add**:
   URL `https://YOUR-SITE.vercel.app/api/razorpay-webhook`, events `payment.captured` and `order.paid`.
   This confirms payments even if the buyer closes the tab right after paying.

To test with real services on your computer, copy `.env.example` to `.env`, fill it in, and run `npm run dev`.

---

## The teddy bear (and using your own GIFs)

The bear is drawn in code (`public/teddy.js`): no image files, works offline, nothing copyrighted.
It blinks, its eyes follow the cursor or finger, tapping it makes it giggle, and in the proposal
it goes shy → sad → crying as the "No" button runs away.

The form asks which teddy is which (You: Boy/Girl, They: Boy/Girl). The boy teddy has a bow tie, the girl teddy an ear bow and lashes.
In Proposal, Valentine and Sorry, the sender's teddy runs in holding a rose (flowers for Sorry) to the receiver's teddy.
Each time "No" runs away the sender's teddy gets sadder (sad, then sitting and crying with a broken heart, rose drooping).
When they press "Yes" the rose changes hands, both teddies run around happily and then hug.

Want GIFs instead? Put the files in `public/gifs/` and list them in the `GIFS` object near the top of
the experience section in `public/app.js`, for example `intro: '/gifs/hello.gif'`. Any scene
you leave empty keeps the bear. Slots: `intro`, `wrap`, `message`, `photos`, `cake`, `question`, `yes`, `status`.
Only use GIFs you have the right to use. Tenor and Giphy GIFs belong to their creators.

## Policy pages (needed for Razorpay)

`/contact`, `/terms`, `/privacy`, `/refund`, `/shipping` are linked in the site footer and next to the pay button.

1. Open `legal/business.json` and replace every value in `[square brackets]` with your real details
   (legal name, address, support email, phone, grievance officer, website URL, city).
2. Run `npm run legal`. This rewrites the five pages in `public/`. It lists anything still missing,
   and missing details show as yellow boxes on the pages.
3. Redeploy. When applying for live payments, give Razorpay these URLs.

To change the wording itself, edit `legal/pages/*.html` and run `npm run legal` again.
Don't edit `public/terms.html` and the others directly, because they get overwritten.

## SEO (getting found on Google)

What's built in: a proper title and description, social-preview image, favicon and app icons, structured data
(JSON-LD), `robots.txt`, `sitemap.xml`, and one page per occasion (`/proposal-card`, `/birthday-card`, ...)
with its own text, message ideas and questions. Private card links (`/w/...`) and the API are kept out of search results.

**One step needs your real web address:**
1. In `legal/business.json` set `"website"` to your live address, for example `https://yourname.vercel.app`
   (or your own domain). Fill in the other details there too, because the policy pages are public.
2. Run `npm run seo` and `npm run legal`, then commit and push. Vercel redeploys.
3. Check it any time with `node seo/check.mjs`.

**Then tell Google about the site (this is what gets you listed):**
1. Open https://search.google.com/search-console and add your site as a "URL prefix" property.
2. Choose the "HTML tag" verification and copy the `content="..."` value from the tag.
   Paste just that value into `"googleVerification"` in `legal/business.json`, run `npm run seo`, push, then click Verify.
3. Under Sitemaps, submit `sitemap.xml`. Under URL Inspection, paste your home address and press "Request indexing".
4. Wait. A new site usually appears within days to a few weeks. Ranking for general phrases like "birthday card"
   takes longer and depends on how many other sites link to yours.

To change the occasion page wording, edit `seo/content.js` and run `npm run seo`.
To redraw the preview image and icons, run `npm run images`.

## Changing the price

The real price is `PRICE_INR` on the server (`.env` and Vercel). `LIST_PRICE_INR` is the usual price shown crossed out.
The pages ask `/api/price` for these numbers, so the buttons always show what is charged. Static text such as
SEO descriptions comes from `PRICE`/`LIST_PRICE` in `seo/content.js` and `price`/`listPrice`/`discount` in
`legal/business.json`: update those, then run `npm run seo` and `npm run legal`.

## Good to know

- **Fees:** Razorpay takes roughly 2% + GST per payment (about ₹0.7 on ₹30).
- **Hosting terms:** Vercel's free Hobby plan is for non-commercial use. Once you're selling, Vercel
  expects the Pro plan, so check their current pricing.
- **Nothing is kept for long.** Songs are never uploaded (the music is built in). A card and its photos are
  deleted automatically 7 days after payment, and unpaid cards after 24 hours. This is done by `/api/cleanup`,
  which Vercel runs once a day (see "crons" in `vercel.json`), and also whenever a new card is made.
  To use it: add a `CRON_SECRET` environment variable in Vercel (any long random text). To change the 7 days,
  set `CARD_LIFETIME_DAYS` in Vercel, and update the words "7 days" in `legal/business.json` (`cardLifetime`),
  `public/index.html` and `seo/content.js`, then run `npm run legal` and `npm run seo`.
- **Storage:** because photos are deleted after 7 days, Supabase's free 1 GB holds about 700 cards at a time.
  The daily clean-up also counts as activity, which helps stop the free project from being paused for inactivity.
- **Updating an existing Supabase project:** open SQL Editor and run `supabase/schema.sql` again. It adds the new
  `expires_at` column, limits the bucket to photos, and gives already-paid cards a 7-day expiry.
- **Customize:** occasions, messages and colours are in the `OCCASIONS` list at the top of `public/app.js`.
