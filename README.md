# WishCraft ✨: paid animated cards (₹35)

People make an animated wish, proposal or apology card with photos and music, preview it for free,
pay ₹35 through Razorpay, and get a short link (`yoursite.com/w/AbC123xy`) to send.
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
- the payment step shows a "Pretend to pay ₹35" button (no real money)

Test payments are **automatically disabled online** (on Vercel), so this can never be abused there.

---

## 2. Supabase (database + photo storage), free

1. Create a project at https://supabase.com (pick the **Mumbai** region).
2. Go to **SQL Editor → New query**, paste everything from `supabase/schema.sql`, click **Run**.
3. Go to **Project Settings → API** and copy:
   - Project URL → `SUPABASE_URL`
   - `service_role` key (or a "secret" key) → `SUPABASE_SERVICE_KEY`
   ⚠️ Keep this key secret. It only goes in `.env` / Vercel settings, never in `public/`.

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
   | `PRICE_INR` | `35` |

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

## Changing the price

Set `PRICE_INR` (server, the real price) **and** `PRICE_INR` at the top of `public/app.js`
plus the "₹35" text in `public/index.html` (display only).

## Good to know

- **Fees:** Razorpay takes roughly 2% + GST per payment (about ₹0.8 on ₹35).
- **Hosting terms:** Vercel's free Hobby plan is for non-commercial use. Once you're selling, Vercel
  expects the Pro plan, so check their current pricing.
- **Storage:** Supabase free tier gives 1 GB of files. Photos are compressed to about 200 KB each, and songs
  are up to 10 MB. Songs use most of the space, so watch usage in the Supabase dashboard.
  Free projects pause after a week with no activity. Opening the site wakes them up.
- **Unpaid cards:** there's an optional cleanup query at the bottom of `supabase/schema.sql`.
- **Customize:** occasions, messages and colours are in the `OCCASIONS` list at the top of `public/app.js`.
