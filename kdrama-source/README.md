# K-DRAMA Hanoi — Orange Edition

This is the approved Framer `KDramaHanoi.tsx` design, moved into a standalone React source project. The original layout, orange/cream/charcoal palette, four-language copy, menu dialogs, mobile dock, reservation and franchise forms are preserved. Desktop menu entries now match mobile, and native input events keep reservation values synchronized. It does not require Framer hosting.

## Edit and build

```sh
cd kdrama-source
npm ci
npm run check
npm run build
```

Edit `src/KDramaHanoi.tsx` for the component and translations, or `src/config.ts` for restaurant details, colours and image paths. The build updates `../kdrama/index.html`, four language directories, and `../kdrama/assets/kdrama-app.js`. Commit source and generated files together. The root Neo K Culture site is separate and is not changed by this build.

The existing hosting setup can serve `kdrama/` directly as static files; it does not need a server-side React process or a hosting build command. Keep existing image assets in `kdrama/assets/`.

## Reservations

The form validates the visit time in Hanoi time, copies the reservation summary and opens the existing Zalo contact. The customer must paste and send the message, and the restaurant must confirm the booking. It does not automatically submit a reservation or call a Zalo messaging API. Franchise enquiries use the same explicit copy-and-send flow.

## Review before publication

This migration is prepared for review. A push or pull request may trigger Vercel preview deployment; verify hosting behaviour and obtain the requested publication approval before pushing a deployment-triggering change or merging into `main`.
