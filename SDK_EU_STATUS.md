# EU (Ireland) readiness — AtoaWebClientSDK

BUD-119. Branch `bud-119/sdk-country`.

The SDK now takes currency, symbol, locale, available payment methods and trust badges from
`businessCountryInfo` on `get-payment-details`, instead of assuming GB/GBP/`£`/`en-GB`.

Verified end to end against **devapi.atoa.me** with a real Irish business and a real UK business —
live card payment through Rapyd and live bank payments through the ATOA test bank.

---

## Two things the live API changed about the design

**1. `amount.currency` is not on the wire.** `get-payment-details` returns `amount` as `{ amount }`
with no currency, confirmed for both a GB and an IE business. The only currency on the response is
`businessCountryInfo.currency`. So `paymentCurrencyOf()` (`src/core/utils/money.ts`) reads
`amount.currency` first and falls back to the country. Reading `amount.currency` alone would have
sent `undefined` to `secure-payment-auth` — a regression on the hardcoded `"GBP"` it replaced.

**2. The backend already owns the trust badges.** `businessCountryInfo.signupPanel.trustBadges`
returns `["ISO_SOC2","FCA","UK_BANKS"]` for the UK business and `["ISO_SOC2"]` for the Irish one,
and `businessCountryInfo.text.regulatorNote` carries the approved regulator wording. So the SDK
renders the named badges and nothing else — no client-side region table, no invented Irish
regulator claim, and no Ireland artwork needed. This replaced the mock content that was planned.

---

## ✅ Done

- `businessCountryInfo` added to `PaymentDetails` (`src/core/types/BusinessCountryInfo.ts`),
  including `signupPanel.trustBadges` and `text.*`.
- `src/core/utils/money.ts` — the only place money becomes a string. No defaults: an absent
  currency renders **bare digits**, never a guessed `£`. `Intl` places the symbol, so symbol-last
  locales (`fr-FR` → `45,00 €`) are correct.
- `src/composables/useCurrency.ts` — reads the already-provided `paymentRequestDetails`; no second
  provide to drift out of sync.
- All six `£…toFixed(2)` templates replaced, plus the sandbox `MockCardSimulator`.
- **Outbound currency bug fixed** — `secure-payment-auth` sent a hardcoded `"GBP"` on both the bank
  and card payloads, mislabelling every EUR payment. Confirmed fixed on the wire: the Irish card
  payload now carries `"currency":"EUR"`. Three tests cover it and fail if the constant returns.
- Rapyd card mount no longer falls back to `"GBP"`; it waits for the real currency.
- `src/core/utils/paymentRails.ts` — rails gating. An **absent** country allows all rails, so P2P
  and pre-EU backends are unaffected.
- **Card-only countries route straight to the card sheet.** One shared `isCardOnlyCheckout()` used
  by the router, the back button and the "switch to pay by bank" banner, so they cannot disagree.
- Trust badges and the regulator line come from the backend; the explainer line is now
  country-neutral ("Trusted by thousands of businesses").
- Timestamp locale `'en-GB'` → `undefined` (the viewer's own). This is a *paid at* stamp — an event
  on the payer's clock — so it deliberately does **not** use the merchant timezone.

---

## 📋 Reported, not fixed

1. **`RightPane` mounts before the payment fetch resolves.** `PaymentDialog.vue` renders
   `<RightPane>` with no `v-if`, so `getInitialView()` reads `paymentDetails` as `undefined` and
   there is no watcher — which is why the pre-existing `paymentMethod === 'CARD'` route never
   fired. Mount order is **unchanged**, but the new rails watcher also checks `paymentMethod`, so
   that dead route now works again as a side effect. Restructuring the mount is still worth doing.
2. **Dev data:** the UK test business has `servicePercentage: 100`, so the amount breakup renders a
   negative "Amount" (12.34 − 12.34 − 2.47 = −2.47). Pre-existing arithmetic, bad test data, not
   an SDK bug — but worth correcting on dev.
3. **Mock Sandbox and Modelo Sandbox banks are down on dev** ("this bank app is down"). ATB (the
   ATOA test bank) works.
4. `formatDate()` in `src/core/utils/common.ts` hardcodes `"en-US"` and has no importers — dead
   code, left in place.
5. **"VAT" label** in `AmountBreakup.vue` is not region-driven. Ireland also has VAT, so probably
   fine, but it is a hardcoded tax name.

---

## Verification

```
npx vue-tsc -b          # clean
npm test                # 12 passing; 3 failures are PRE-EXISTING on develop (stale deviceOrigin
                        # assertions), identical before and after this work
npm run build:prod
npm run build:types
```

No ESLint config exists in this repo, so there is no lint gate.

### Live end-to-end (devapi.atoa.me) — see `sdk-eu-verification/`

| # | Case | Result |
|---|---|---|
| 1 | **IE — card-only** | `Pay €19.99`, straight to the card sheet, no bank grid, **only the ISO badge** (no FCA, no UK Banks), no "switch to pay by bank" banner |
| 2 | **IE — card payment** | Rapyd EUR checkout, `4111…1111`; PENDING → COMPLETED; "Payment successful"; status API `COMPLETED / 9.99 / EUR` |
| 3 | **UK — bank list** | **Unchanged**: `Pay £31.50`, ISO + FCA + UK Banks badges, full bank grid |
| 4 | **UK — bank PENDING** | "Pending — payment processing is taking longer than usual…" + redirect countdown |
| 5 | **UK — bank COMPLETED** | "Payment successful"; status API `COMPLETED / GBP` |
| 6 | **UK — bank FAILED** | "Failed — declined by their bank" + Retry; status API `FAILED / GBP` |

`onPaymentStatusChange` fired with the correct status in every case.

**Note on test setup:** payment requests created via `process-payment` are production-mode even on
dev, so the SDK must be initialised with `environment: "PRODUCTION"`. With `"SANDBOX"` the status
endpoints scope to the sandbox namespace and return `PAYMENT_NOT_INITIATED`, so the SDK never
leaves the "Scan to pay" screen. That is an environment mismatch, not an SDK defect.

**Not yet covered:** a payment carrying no `businessCountryInfo` at all (P2P / pre-EU backend).
Verified against a stubbed response — bare digits, all rails allowed, nothing crashes — but not
against a live payment of that shape.
