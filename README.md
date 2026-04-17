# Edge Controls — Work Request Portal

Customer-facing work request portal for Edge Controls field services. Public landing page for submitting service/repair requests and new build inquiries. Customers can also log in to view status on their active projects.

**Live site:** https://edgeadmin-3dg.github.io/work-request-portal/
**Short URL:** https://tinyurl.com/Edge-Controls-Portal

---

## Overview

Two request types customers can submit:

- **Service / Repair** — Existing site, something needs fixing or maintaining. Includes urgency levels (routine / urgent / emergency) and photo/document upload.
- **New Build** — New installation, new control system, retrofit, or upgrade. Two intake modes: traditional form or guided walkthrough.

Customers with an active project can also log in to see a read-only dashboard with project status, milestones, completion percentage, and recent activity.

---

## Architecture

```
GitHub Pages (this repo — static HTML/CSS/JS)
        │ fetch/AJAX (text/plain to avoid CORS preflight)
        ▼
Google Apps Script — Edge Controls Operations project
        │
        ▼
Google Sheets (Work Request Tracking, Projects, Field Sites Master)
        │
        ▼
Google Drive (uploaded files land in per-request folders)
        │
        ▼
Google Chat (manager notifications for new requests)
```

---

## File structure

```
work-request-portal/
├── index.html              ← Landing page + request type selection
├── service-request.html    ← Service/repair request form
├── new-build.html          ← New build form (traditional + inline guided walkthrough)
├── customer-login.html     ← Redirects to project-status.html (legacy URL)
├── project-status.html     ← Customer project status dashboard (auth-gated)
├── css/
│   └── styles.css          ← Global styles (dark industrial theme)
├── js/
│   └── main.js             ← Shared utilities (submitRequest, dropdown loading, file upload)
├── .nojekyll               ← Tells GitHub Pages not to run Jekyll
├── .gitignore
└── README.md
```

The guided walkthrough (TurboTax-style intake) lives **inline inside `new-build.html`**, not in a separate file. The same page handles both traditional and guided modes via a mode selector.

---

## Development

Static site, no build tools required.

### Web editor (quick edits)

1. Navigate to the file on GitHub
2. Click the pencil icon (top right)
3. Edit, then Commit directly to `main`
4. GitHub Pages auto-rebuilds within 1–2 minutes

### Local clone

```bash
git clone https://github.com/EDGEADMIN-3dg/work-request-portal.git
cd work-request-portal

# Make changes, then:
git add .
git commit -m "Description of changes"
git push origin main
```

After a push, hard-refresh the live site (Ctrl+Shift+R) to bust browser cache.

---

## Backend configuration

All form submissions go to a Google Apps Script web app endpoint configured in `js/main.js`:

```javascript
const CONFIG = {
  API_ENDPOINT: 'https://script.google.com/macros/s/.../exec',
  PREFIX_SERVICE: 'WR-SR-',
  PREFIX_NEW_BUILD: 'WR-NB-'
};
```

The backend lives in the **Edge Controls Operations** Apps Script project and must be deployed as a web app with "Anyone" access so the GitHub Pages frontend can reach it cross-origin.

The project status dashboard (`project-status.html`) uses a separate `API_BASE` constant hardcoded in that file — it authenticates customers via company name + password credentials stored in the project record.

If you redeploy the backend and the deployment ID changes, both constants need to be updated and the change pushed to GitHub.

---

## Request numbering

- Service/Repair: `WR-SR-1000`, `WR-SR-1001`, …
- New Build: `WR-NB-1000`, `WR-NB-1001`, …

Sequential numbers are issued by the Apps Script backend, not the frontend. Starts at 1000 to avoid leading-zero weirdness.

---

## Related projects (not in this repo)

- **Dispatch Bot** — Google Chat app that receives converted service requests and dispatches techs. Separate Apps Script project, tied to GCP project 440607986496.
- **Field Sites Locator + Ticket Generator** — Interactive site map and voice-to-Excel ticket generation. Separate Apps Script project. Public URL: `tinyurl.com/Edge-Controls-Locations`.
- **plc-programs** (private repo) — PLC code library.

See the Edge Controls Suite Index document for the full map.

---

## Support

Edge Controls IT / janderson@edgecontrols.com
