# WasteConnect website prototype

A plain HTML, CSS, and JavaScript prototype built around the agreed design standards: industrial green and off-white palette, rectangular controls, no purple gradients, no fake reviews or metrics, no customer counters, no AI-generated-looking photos, no cursor effects, and no scroll-triggered animation.

## Files

- `index.html`: homepage and company registration modal
- `dashboard.html`: company workspace shown after demo registration
- `dashboard.css`: responsive company dashboard styles
- `dashboard.js`: demo Company ID, company profile, navigation, and local material listings
- `styles.css`: shared responsive styling
- `app.js`: local prototype interactions, form validation, and demo profile creation
- `privacy.html`: Privacy Policy starter draft
- `terms.html`: Terms & Conditions starter draft
- `favicon.svg`: WasteConnect favicon

## Run locally

Open `index.html` in a modern browser. For a local web server, run `python -m http.server 8000` from this folder and visit `http://localhost:8000`.

## Prototype limitations

- The email verification flow is simulated. Use demo code `123456`.
- The browser validates the registration steps and creates a unique demo Company ID (for example, `WC-2026-ABC234`). This is a local prototype identifier, not an official or verified account number.
- Non-file profile fields and demo material listings are stored in the browser local storage for the prototype. They are not sent to a server and are not shared with other companies. Do not use real sensitive company details in a public demo.
- File pickers are visual only. Business documents are not uploaded or saved.
- Company verification, genuine accounts, marketplace search, cross-company purchase requests, messages, payments, and transaction records need backend implementation. The dashboard uses empty states instead of invented activity figures.
- A company can add a demo listing from the dashboard. It is visible only in that browser and is marked `Local demo only`.
- Privacy and terms pages are starter drafts. They intentionally flag legal operator details and real service practices that have not been supplied. Have them completed and reviewed before launch.

## Mandatory pre-launch checklist

- [ ] Choose a hosting provider and deploy all site files over HTTPS.
- [ ] Connect the real custom domain and test DNS, HTTPS, canonical URLs, and redirects.
- [x] Include a favicon in the site files.
- [ ] Check the deployed host and remove any platform-generated badge or “Made with AI” label if present and permitted by that platform.
- [ ] Replace the placeholder contact mail link in `index.html` with a real monitored email address.
- [ ] Complete the operator identity, contact, retention, service-provider and user-rights details in `privacy.html`.
- [ ] Complete the operator identity, governing law, fees, transactions and complaint rules in `terms.html` after legal review.
- [ ] Connect secure backend account creation, genuine email verification, server-issued company IDs, access control, server-side validation, secure document upload, and company review.
- [ ] Add real listing, request, messaging, and payment workflows only after they are tested and the relevant policies are published.
- [ ] Test keyboard navigation, screen readers, small screens, broken links, errors, validation, file restrictions, security, backups, and recovery.
- [ ] Replace all prototype notices only after the corresponding production features have been implemented and verified.

**Do not treat this package as production-ready.** A local HTML file cannot connect a custom domain, send real verification email, securely store submitted data, or remove a badge injected by an external hosting platform.
