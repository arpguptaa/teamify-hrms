# TEAMIFY — HRMS Owner Console

Master (owner) portal + client HRMS workspace, built with React, React Router and Tailwind CSS v4.

## This round of changes (employee logins, genealogy, celebrations, payments)
- **Employee login accounts** — every employee added from "Overview & Genealogy" now gets a system-generated **Employee ID** (company-name prefix + running number, e.g. `ORBIT01`, `ORBIT02` … `ORBIT101`) and a default password equal to their **PAN number**. They log in from the same `/login` screen. Only the client owner, or an employee with **Full edit** on "Employee Management", can reset another employee's password (back to their PAN or a custom one); an employee changing their own password must meet the usual complexity rule.
- **Employee portal** (`/employee/...`) — a lightweight workspace for employees: Home (profile + today's birthdays/anniversaries), My Team (their own scoped org chart), My Account (password + theme), and — only if granted "Full edit" on Employee Management — an Employee Management page with the same tools the owner has.
- **Scoped genealogy** — an employee's "My Team" view only shows themselves, everyone reporting up through them, and a single faded card for their own manager. They can never see above their manager. The owner's "Overview & Genealogy" still shows everyone.
- **Zoomable, pannable org chart** — the genealogy view now has its own zoom in/out/fit-to-screen/reset controls and click-and-drag panning, so a large team never gets cut off and you never need to zoom the browser itself.
- **Full employee profile form** — Add/Edit employee is now sectioned into Personal details, Contact & address, Employment & job details, Bank & statutory details, and Qualification & experience, plus a **document checklist** (Aadhaar, PAN, education certificates, relieving letter, salary slips, Form 16, cancelled cheque, photograph) that HR ticks off and attaches scans against.
- **Searchable "Reports to" picker** — a typeahead dropdown instead of one long `<select>`, so it stays usable as the org grows.
- **Employment status tags** — Active / Probation / Notice Period / PIP / Inactive / Resigned, shown as colored chips in the employee list and filterable.
- **Birthday / work-anniversary / marriage-anniversary notifications** — computed automatically each day from an employee's DOB/DOJ/marriage-anniversary fields, with their photo, and posted to the owner's notification bell and dashboard, and to the employee portal's Home page. The message wording is editable per company from **My Account → Celebration messages** (placeholders: `{name}`, `{years}`, `{company}`).
- **Recurring payments from My Account** — the client owner can now trigger the same QR + proof-of-payment flow anytime from their own My Account, not just at signup. The subscription's next-billing date never moves on its own — it only extends once the master **approves** that specific payment from Client Database & Subscription.
- **Client Database & Subscription upgrades** — shows both the requested employee count and the **live** number of employee accounts actually created; a manual date picker to move the next billing date forward or back; and a documents panel split into **Company documents** (uploaded by the client) and **Payment history** (every proof submitted, with an "Approve & extend" action per pending one, and a verified log for the rest).

## Previous round of changes
- **Client Database & Subscription** — an Edit (pencil) button now opens the full company profile for editing; a Plan dropdown lets you move a client between plans directly; a Billing cycle dropdown (monthly/quarterly/half-yearly/annual) recalculates and shows the pro-rated amount due or credited before applying; an Unlock button appears on locked/expired accounts.
- **Excel export** everywhere it's useful — Dashboard, Client Database, Plan Management, Support Tickets all have an "Export to Excel" button producing a real `.xlsx` file.
- **Plan-level discounts** — Plan Management now has a percent/flat discount per plan (applies to every client on it by default); a client's own discount (set from Client Database → Edit) overrides the plan default just for them.
- **Payment & QR flow** — the public signup now walks through Details → Payment: shows the amount due (plan price minus any discount), your UPI QR code, and requires a proof-of-payment upload before the request reaches your Client Database as pending.
- **Client profile fields** — Setup Client Account and the public signup form now capture the fuller company profile (legal entity name, registration no., industry, addresses, GST/PAN/CIN, billing address, payment preference, fiscal year, payroll frequency, working days, holiday notes) — same fields you can edit later from Client Database.
- **Support Tickets** — proper status tracking (Open / In progress / Resolved / Closed), and a real two-way chat thread per ticket with file attachments (PDF/JPG/JPEG/PNG, up to 10MB) — both from the master side and from a client's own new **Helpdesk / Ticketing** page.
- **Billing cycle requests from clients** — a client can request a different billing cycle from their own My Account; you approve it from Client Database, which runs the same pro-ration.
- **Branding fixes** — a client's workspace now shows their own logo with a small "Powered by Teamify" badge; the login page copy is now generic for owner, client, and employee logins alike; the public signup form explicitly notes it's for business owners/authorized reps only.
- **Personalized greetings** — "Hi, {name}" on both the master Dashboard and the client Dashboard.

## What's new in this build
- **Dark mode fixed** — Tailwind v4 needs a custom variant to key `dark:` off a class instead of the OS setting; that's now wired in `src/index.css`.
- **User ID is permanent** — set once at signup/creation, shown read-only everywhere after. Only passwords can be changed.
- **Password policy enforced everywhere** a password is created or changed (signup, Setup Client Account, My Account): minimum 8 characters, one capital letter, one small letter, one number, one special character.
- **Client "My Account" page** — theme toggle + password change + Google Drive storage, same pattern as the master's.
- **Google Drive storage location** — an optional connect flow (master's My Account, and each client's My Account / first login) that lets them pick a Drive folder as their storage location. See "Connecting Google Drive" below — it needs a one-time Google Cloud setup to actually turn on; without it, the UI clearly says so and clients can skip past it.
- **Create Your Organisation** — new client-side page (`Overview & Genealogy` in the sidebar) to add employees, set who reports to whom, upload their documents, and assign per-module access (No access / View only / Full edit) across all 18 HR modules. Includes a visual org-chart tree and a flat list view.
- **Notifications / History bell** — top-right on both the master console and the client workspace, logging activations, status changes, upgrade requests, new employees, etc.

## Tech stack
- React 19 + Vite
- React Router v6
- Tailwind CSS v4 (brand colors/fonts defined in `src/index.css`)
- lucide-react icons
- Data is kept in the browser via `localStorage` (no backend yet — see **Important note** below)

## Run locally
```bash
npm install
npm run dev
```
Visit the printed local URL (usually `http://localhost:5173`).

## Build for production
```bash
npm run build
npm run preview   # to test the production build locally
```
The static output lands in `dist/` — deployable to Vercel, Netlify, GitHub Pages, or any static host.

## Demo logins
**Master account** (your owner login):
- User ID: `arpguptaa`
- Password: `8090501107`
- Change the password anytime from **My Account**. The user ID itself can't be changed — that's by design.

**Sample client account** (to see the client workspace):
- User ID: `orbitretail`
- Password: `Orbit@1234`

A second sample client (`fernway` / `Fernway@2026`) is seeded as **pending**, so you can see the activation flow from **Client Database & Subscription**.

Reset back to this sample data anytime from Master → My Account → "Reset to sample data".

## Connecting Google Drive (optional)
The "Connect Google Drive" button (master My Account, client My Account, and a client's first login) needs a small one-time Google Cloud setup — this can't be wired up with just an API key kept secret on the frontend, since there's no backend in this build:

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a project.
2. Enable the **Google Drive API** and **Google Picker API**.
3. Create an **OAuth 2.0 Client ID** (type: Web application), and add your deployed URL (e.g. `https://teamify-hrms.vercel.app`) under "Authorized JavaScript origins".
4. Create an **API key**, and restrict it to the Drive/Picker APIs.
5. Copy `.env.example` to `.env` and fill in `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_API_KEY`. On Vercel, add these under Project → Settings → Environment Variables instead, then redeploy.

Until this is set up, the Drive card explains it isn't configured yet, and clients can tap "Skip for now" to keep using their workspace — it's not a hard lock.

**What this does and doesn't do:** connecting picks a real Drive folder using Google's own file picker and stores its ID against the master or client record. Actually *writing* HR data (employee records, exports, etc.) into that folder as files needs a small backend or a Drive-write integration — a natural next phase once you're ready to store real files there.

## How the flows work
- **`/login`** — single login screen. Master credentials or any client's user ID/password both work here. A "Chat with us" bubble on this page drops messages into Support Tickets.
- **`/signup`** — public "Create your HRMS account with us" form. Submissions land as a **pending** row in Client Database & Subscription for you to activate.
- **Master → Setup Client Account** — create *and immediately activate* a client from your side.
- **Master → Client Database & Subscription** — activate, extend by a month, lock, pause/resume, or deactivate any client; approve plan-upgrade requests.
- **Client workspace** — once activated, the client logs in and sees their own logo on the home page, an "Overview & Genealogy" page to build their org chart, the 18-module sidebar, and their own My Account page. If their subscription is locked, paused or expired, they see a "buy subscription" screen instead.
- **Plan limit** — a client nearing their plan's employee cap sees an "Upgrade your plan" prompt; the request shows up against their record in your Client Database view.
- **Notifications** — the bell icon (top-right, both portals) logs everything relevant: for the master, new signups, upgrade requests, status changes; for a client, their own account and organisation events.

## ⚠️ Important note before going live
This build stores everything (client records, employee records, passwords, your master password) in the browser's `localStorage`, with no server or database. That's fine for building out the UI and demoing the flow, but **do not launch this to real clients as-is** — passwords are stored in plain text on the client side, and data won't sync across devices or browsers (an employee logging in from a different computer than the one their account was created on won't see their record until you move to a real backend). Before a real launch you'll want a backend (e.g. Supabase, Firebase, or a small Node/Postgres API) to handle auth, hashed passwords, and shared storage. Employee accounts, Employee IDs, module-access permissions and the org chart all now work end-to-end in this build (master, client-owner, and employee logins) — moving the storage layer to a real backend is the main remaining step before go-live.

## Project structure
```
src/
  context/        AuthContext, DataContext, ThemeContext
  components/      Logo, ChatWidget, ProtectedRoute, StatCard,
                    NotificationBell, PasswordField, GoogleDriveCard, OrgTree,
                    EmployeeManager, ReportsToSelect
  lib/             constants.js (plans, modules, employee IDs, notification templates), validation.js (password rules), googleDrive.js
  pages/
    Login.jsx, PublicSignup.jsx
    master/        Dashboard, SetupClient, ClientDatabase, PlanManagement, SupportTickets, MyAccount
    client/        ClientLayout, ClientDashboard, ClientOrganisation, ClientMyAccount, ModulePlaceholder
    employee/       EmployeeLayout, EmployeeHome, EmployeeTeam, EmployeeManage, EmployeeAccount
```

## Push to GitHub
```bash
git init
git add .
git commit -m "Teamify HRMS console"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```
Then deploy the repo on Vercel or Netlify (framework preset: Vite) — no extra config needed unless you're adding Google Drive credentials as environment variables.
