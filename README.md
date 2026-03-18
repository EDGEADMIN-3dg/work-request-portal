# Edge Controls — Work Request Portal

Customer-facing work request portal for Edge Controls field services. Submit service requests, report issues, and initiate new build projects.

**Live Site:** https://edgecontrols.github.io/work-request-portal/

## Overview

This portal allows Edge Controls customers to submit work requests online instead of calling. Two request types are supported:

- **Service / Repair** — Something is broken or needs maintenance at an existing site
- **New Build** — New installation, new control system, retrofit, or upgrade

## Architecture

```
GitHub Pages (static frontend)
        │
        ▼
Google Apps Script (backend API)
        │
        ▼
Google Sheets (data storage) + Google Drive (file uploads)
        │
        ▼
Google Chat (manager notifications)
```

## File Structure

```
work-request-portal/
├── index.html              ← Landing page + request type selection
├── service-request.html    ← Service/repair request form
├── new-build.html          ← New build request form (traditional)
├── new-build-guided.html   ← New build AI-guided walkthrough
├── confirmation.html       ← Request confirmation page
├── css/
│   └── styles.css          ← Global styles
├── js/
│   ├── main.js             ← Shared utilities
│   ├── service-form.js     ← Service request form logic
│   ├── new-build-form.js   ← New build form logic
│   └── guided-intake.js    ← TurboTax-style guided walkthrough
├── images/
│   └── edge-controls-logo.png
└── README.md
```

## Development

This is a static site — no build tools required. Just edit the HTML/CSS/JS and push.

```bash
# Clone
git clone https://github.com/EdgeControls/work-request-portal.git

# Make changes, then push
git add .
git commit -m "Description of changes"
git push origin main
```

Changes deploy automatically via GitHub Pages (usually within 1-2 minutes).

## Backend Configuration

The forms submit to a Google Apps Script web app endpoint. Update the endpoint URL in `js/main.js`:

```javascript
const API_ENDPOINT = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

## Request Numbering

- Service/Repair: `WR-SR-1000`, `WR-SR-1001`, ...
- New Build: `WR-NB-1000`, `WR-NB-1001`, ...

Sequential numbers are managed by the Apps Script backend.

## Support

Edge Controls IT Department
