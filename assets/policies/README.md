# Policy documents

Client-supplied policies, linked from **Investor Relations → Policies and Procedures**
(`page-policies`) and **Miscellaneous → Useful Downloads** (`page-downloads`).

Source: the client's `Rallys Policies and Procedures/` folder (July 2026). Filenames were
slugified because the originals contain spaces and brackets, which would need URL-encoding
in every `href`.

| Slug in `assets/policies/` | Original filename | Title shown on the site |
|---|---|---|
| `client-access-online-trading.pdf` | Allowing Client Access to Online Trading Service.pdf | Allowing Client Access to Online Trading Services |
| `aml-cft-policy.pdf` | Anti-Money Laundering Countering Financing.pdf | Anti-Money Laundering (AML) & Countering Financing of Terrorism (CFT) |
| `authorization-order-placement.pdf` | Authorization For Order Placement.pdf | Authorization for Order Placement |
| `complaint-policy.pdf` | Complaint Policies.pdf | Complaint Policy |
| `conflict-of-interest-policy.pdf` | Conflict of Interest- Resolution Policy.pdf | Conflict of Interest — Resolution Policy |
| `customer-grievance-redressal.pdf` | Customer Grievance Redressal Policy.pdf | Customer Grievance Redressal Policy |
| `disaster-recovery-contingency-plan.pdf` | Disaster Recovery and Contingency Plan.pdf | Disaster Recovery & Contingency Plan |
| `internal-controls-policy.pdf` | Internal Controls Policy of Rallys Equities (Pvt) Limited.pdf | Internal Controls Policy |
| `orders-recording-policy.pdf` | Orders Recording Policy.pdf | Orders Recording Policy |
| `unethical-conduct-market-abuse.pdf` | Policy on Unethical Conduct and Market Abuse.pdf | Policy on Unethical Conduct & Market Abuse |
| `record-retention-policy.pdf` | Record Retention Policy.pdf | Record Retention Policy |

## Replacing or revising a policy

`vercel.json` serves `/assets/(.*)` with `Cache-Control: public, max-age=31536000, immutable`.
Overwriting a file **keeps the old filename**, so returning visitors can be served the stale PDF
for up to a year.

When a policy is revised, **give it a new filename** (e.g. `aml-cft-policy-2026-08.pdf`) and update
the `href` in `index.html`. Only overwrite in place if the change is trivial and stale copies are
acceptable.

## View-only viewer

The client asked that policies open as **view-only** documents that visitors cannot download.
Clicking a policy calls `openDoc(slug)` (`index.html`), which shows the PDF in an in-page overlay
(`#docOv`) instead of a new tab.

**Be clear about what this does and does not achieve.** A browser must receive a file in order to
render it, so anyone can still retrieve these PDFs from the network panel, or by requesting
`/assets/policies/<slug>.pdf` directly. **No website can prevent that.** What the viewer does is
remove every download *affordance*:

- opens in-page, so the browser's own PDF toolbar — with its download and print buttons — never
  appears. `#toolbar=0&navpanes=0` is honoured by **Chrome and Edge**; **Firefox's** built-in
  pdf.js viewer **ignores it** and still shows its toolbar. iOS Safari may refuse to render a PDF
  in an iframe at all.
- the list items are `<button>`s carrying a slug — not `<a href>` links — so there is no
  "Save link as" on the list and the file path is not surfaced in the UI.
- context menu, and Ctrl/Cmd+S and Ctrl/Cmd+P, are suppressed while the viewer is open.

Titles and paths resolve through the `POLICY_DOCS` whitelist in `index.html`, so the markup can
never point the viewer at an arbitrary URL. **Adding a policy means adding it to that map as well
as to this folder.**

If stronger protection is ever required, the options are: render pages to `<canvas>` with pdf.js so
no PDF file is handed over (raises the effort bar, still not absolute), or put the documents behind
a login and serve them through a short-lived signed URL.

## Notes

- All 11 files are **image-only scans** (no text layer), so they are not searchable or
  screen-reader accessible. The site offers an accessible copy on request.
- Policies the client listed but did **not** supply a document for: Risk Disclosure, KYC/CDD,
  Whistleblowing, Confidentiality & Data Protection, Segregation of Client Money & Assets,
  Communication & Disclosure, Code of Conduct & Ethics, Information Security & Cybersecurity.
  These are deliberately **not** listed on the site — nothing is shown that isn't downloadable.
