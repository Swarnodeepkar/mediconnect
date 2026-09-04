# MediConnect

**One Platform. Four Clinics. Seamless Care.**

A front-end prototype of a unified multi-clinic healthcare platform connecting clinic management, staff operations, doctors, and patients across four branches — built to accompany an investor and development pitch deck.

## What this is

A functional, role-based UI prototype covering all four interfaces described in the platform vision:

- **Admin Web Dashboard** — central command center with live cross-clinic metrics, appointments, patients, staff & attendance, home visits, complaints, and reports/analytics.
- **Patient Mobile App** — appointment booking, medical records (prescriptions & lab reports), bill payments, notifications, and complaint filing.
- **Staff Mobile App** — GPS-style attendance check-in/out, task management, home visit tracking, and leave requests with payslip history.
- **Doctor Module** — daily patient queue, consultation workspace (diagnosis, prescriptions, lab requests), patient history, and prescription log.

All four interfaces share one connected data model — an action taken in one app (e.g. a patient raising a complaint, or a doctor writing a prescription) is immediately reflected across the others.

## Tech stack

- React 19 + Vite
- React Router (role-based routing, one router tree per interface)
- Recharts (dashboard analytics)
- Plain CSS with a shared design-token system (`src/index.css`, `src/components/ui.css`)
- A lightweight localStorage-backed data store (`src/data/store.js`) standing in for a backend — no server required

## Running locally

```bash
npm install
npm run dev
```

Open the printed local URL, then choose a role (Super Admin, Doctor, Staff, or Patient) from the login screen to explore that interface. Data persists in your browser's localStorage between sessions; there is no real backend, and all data is fictional sample data for demonstration purposes only.

## Project structure

```
src/
  data/         seed data + localStorage-backed store
  context/      auth (role/session) and clinic-filter context
  components/   shared UI primitives (cards, badges, tables, modals, etc.)
  pages/
    admin/      Admin Web Dashboard screens
    patient/    Patient Mobile App screens
    staff/      Staff Mobile App screens
    doctor/     Doctor Module screens
```

## Status

This is a prototype for demonstration and pitch purposes — it is not connected to a real backend, does not implement authentication/security controls, and uses fictional patient data throughout.
