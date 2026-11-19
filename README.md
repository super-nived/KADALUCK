# KADALUCK Mystery Drop — React + Firebase PWA

Run: `npm install && npm run dev` · Test: `npm test` · Build: `npm run build`

Firebase project: `kadaluck-mystery-drop` (Spark plan). Auth: Email/Password. Firestore: asia-south1, rules in `firestore.rules` (already published).

## First-time admin setup (one-off, in Firebase console)
1. Authentication → Users → Add user (your email + a strong password).
2. Open `/admin`, sign in. It shows "Not authorised" and your user ID.
3. Firestore → Start collection `admins` → Document ID = that user ID → any field (e.g. `role: "owner"`).
4. Reload `/admin` → Dashboard → "Create today's campaign".

## Security model
- Clients can never write `admins`; only console-created docs grant admin.
- Sponsor/prize/location live in `campaigns/{id}/reveal/details`; rules deny public reads until server `request.time >= revealAt`.
- Winners are public only if `published` and consent flags are set; audit log is append-only.

## Known gaps
- Storage (image upload) needs the Blaze plan; sponsor/winner images are https URLs for now.
- Reveal/sellout writes are admin-client writes (no Cloud Functions on Spark); upgrade path in PLAN.md §9.
- Legal review gate (`settings/public.legalApproved`) must stay off until reviewed.
