# Client Intake System

A lightweight internal dashboard for capturing and organizing incoming client inquiries. Built for freelancers, agencies, and small businesses that need a structured way to track leads before moving them into a CRM or project management workflow.

---

## Overview

When a new client inquiry comes in, it is easy to lose track of it across email threads, notes, or spreadsheets. This tool gives you a single place to log each inquiry, assign it a status, search through your pipeline, and keep a clear picture of where every lead stands.

No backend required. Everything runs in the browser and persists automatically using `localStorage`.

---

## Features

- **Intake form** — captures full name, company, email, phone, service needed, budget range, project summary, and preferred contact method
- **Inquiry dashboard** — displays all submissions as clean, scannable cards
- **Summary cards** — live counts for Total, New, Contacted, Qualified, and Closed inquiries
- **Status management** — update any inquiry's status via an inline dropdown; cards reflect changes immediately
- **Search** — filter inquiries by client name or company name in real time
- **Status filter** — narrow the list to a specific pipeline stage with one click
- **Expandable details** — expand any card to reveal full contact info and project summary
- **Delete** — remove an inquiry with an animated fade-out
- **localStorage persistence** — data survives page refreshes with no backend or database

---

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, CSS Grid, Flexbox) |
| Logic | Vanilla JavaScript (ES6+) |
| Persistence | Browser `localStorage` |
| Dependencies | None |

---

## Project Structure

```
client-intake/
├── index.html      # App shell and markup
├── style.css       # All styling — layout, components, responsive design
├── script.js       # State management, rendering, CRUD, localStorage
└── README.md
```

The JavaScript is organized into clear sections: storage helpers, state, rendering, CRUD operations, form validation, and event listeners. No frameworks, no build step — open `index.html` in a browser and it works.

---

## How to Use

**Run locally**

```bash
git clone https://github.com/your-username/client-intake-system.git
cd client-intake-system
open index.html   # or double-click the file
```

No install, no server, no config needed.

**Workflow**

1. Fill out the intake form when a new inquiry comes in and click **Add Inquiry**
2. The inquiry appears in the dashboard with a default status of **New**
3. Use the status dropdown on each card to move it through your pipeline: New → Contacted → Qualified → Closed
4. Use the search bar or filter pills to find specific inquiries
5. Click the chevron on any card to expand full contact details and the project summary
6. Delete resolved or duplicate inquiries with the trash icon

All changes are saved automatically. Refreshing the page restores your data exactly as you left it.

---

## Future Improvements

- **Edit modal** — pre-populate the form fields to update an existing inquiry in place
- **Export to CSV** — download the full inquiry list as a spreadsheet
- **localStorage → backend** — swap the storage layer for a REST API or a service like Supabase without changing the UI
- **Email notifications** — trigger a webhook (Make, Zapier) when a new inquiry is submitted
- **Sort controls** — sort by date submitted, budget, or status
- **Pagination or infinite scroll** — handle larger inquiry volumes cleanly

The data layer is intentionally isolated in two functions (`saveToStorage` / `loadFromStorage`) so swapping in a real backend requires changes in only one place.

---

## Purpose

This project was built to practice structuring a real-world CRUD interface using only browser APIs — no frameworks, no dependencies. The goals were to keep the code readable and organized, implement proper data persistence, build a UI polished enough to show a client, and write JavaScript that is easy to extend as requirements grow.
