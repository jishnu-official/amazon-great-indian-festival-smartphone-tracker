# Amazon Great Indian Festival smartphone tracker

Separate Next.js project, independent of the Flipkart tracker. Requires Node.js 20.9+.

```sh
npm install
npm run dev -- --port 4174
```

Open http://localhost:4174. Run `npm test` and `npm run build` to validate. Deploy on a Next.js server host; GitHub Pages cannot run the API routes.

## Included

- Same brand, RAM, storage, primary camera, battery, network and SIM filter choices as the Flipkart project.
- Adjustable ₹0–₹1,00,000 range in ₹500 steps, starting at ₹10,000–₹20,000.
- Product image, title, price and explicit availability labels when readable.
- Automatic skipping of source pages with no matching phones, previous/next matches, refresh, error states.
- Pincode-to-area lookup only; this does not verify Amazon delivery stock for that pincode.

## Source and important current limitation

The user-supplied event page is https://www.amazon.in/events/greatindianfestival/ . Its Mobiles link was inspected and pointed to collection 221992814031. Searches are scoped to that collection. Membership means the item appears in the linked festival collection, not that it has an active discount or an exact Great Indian Festival badge. The collection can change as the event evolves.

**Amazon returned HTTP 503 to server-side requests during development. The live integration is therefore not verified end-to-end and may show an error instead of products.** No proxy evasion, CAPTCHA bypass, browser cookies or invented listings are used. The adapter is best-effort public HTML parsing, not an official Amazon API. Reliable unattended operation needs a permitted data source and verification that it supplies festival membership and required specifications.

Organic search cards are parsed; sponsored cards are excluded. Candidate product detail pages are checked in batches of three. Missing selected specifications exclude the product, so counts are conservative and may be zero. Smartphone category, SIM type, physical RAM, storage, battery, primary camera and cellular network are required for the default filters. Unknown availability is not interpreted as in stock. Product fetch failure is reported as an error rather than an empty catalog. Do not assume all Amazon smartphone listings are included.

No location, account credentials or browser session is copied into this project. Postal lookup sends the manually entered pincode to api.postalpincode.in when requested.

This archive contains source only; dependencies and build output are excluded.
