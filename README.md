# GoalSync AI 🎯
> **Enterprise-Grade Goal Setting & Performance Tracking Portal**

[Submission Portfolio (Hackathon Ready)](SUBMISSION_PORTFOLIO.md)

<div align="center">
  <img src="./docs/architecture.png" alt="GoalSync AI Architecture" width="800" />
</div>

<p align="center">
  <em>An intelligent SaaS portal bridging the gap between strategic organizational KPIs and individual employee performance tracking.</em>
</p>

---

## 📖 Project Overview
Organizations relying on manual goal-tracking methods (spreadsheets, emails, fragmented tools) suffer from misalignment, blind spots, and lack of accountability. 

**GoalSync AI** eliminates these pain points by providing a structured, digitally synchronized environment. It supports the entire lifecycle of enterprise goals—from creation and managerial alignment to quarterly check-ins and live data visualization. Designed specifically for HR leaders, Managers, and Employees, the portal enforces deep organizational alignment natively.

---

## 📸 Platform Screenshots
<details open>
<summary><strong>Employee Experience</strong></summary>

<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin-top:16px;">
   <figure style="margin:0;">
      <img src="./Pictures/screencapture-localhost-5173-employee-2026-05-19-10_09_42.png" alt="Employee dashboard overview" width="100%" />
      <figcaption style="font-size:0.9rem; color:#6b7280; margin-top:8px;">Overview dashboard with goals, progress, and performance cards.</figcaption>
   </figure>
   <figure style="margin:0;">
      <img src="./Pictures/screencapture-localhost-5173-employee-2026-05-19-10_10_19.png" alt="Employee goals workspace" width="100%" />
      <figcaption style="font-size:0.9rem; color:#6b7280; margin-top:8px;">My Goals view with approved objectives and locked action states.</figcaption>
   </figure>
   <figure style="margin:0;">
      <img src="./Pictures/screencapture-localhost-5173-employee-2026-05-19-10_10_30.png" alt="Employee quarterly check-ins" width="100%" />
      <figcaption style="font-size:0.9rem; color:#6b7280; margin-top:8px;">Quarterly check-in form with auto-computed scores and submission flow.</figcaption>
   </figure>
</div>
</details>

<details>
<summary><strong>Manager Experience</strong></summary>

<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin-top:16px;">
   <figure style="margin:0;">
      <img src="./Pictures/screencapture-localhost-5173-manager-2026-05-19-10_10_44.png" alt="Manager dashboard overview" width="100%" />
      <figcaption style="font-size:0.9rem; color:#6b7280; margin-top:8px;">Team overview with KPIs, priority actions, and member status.</figcaption>
   </figure>
   <figure style="margin:0;">
      <img src="./Pictures/screencapture-localhost-5173-manager-2026-05-19-10_10_56.png" alt="Manager pending approvals" width="100%" />
      <figcaption style="font-size:0.9rem; color:#6b7280; margin-top:8px;">Approval workflow showing inline goal edits and review timeline.</figcaption>
   </figure>
   <figure style="margin:0;">
      <img src="./Pictures/screencapture-localhost-5173-manager-2026-05-19-10_11_08.png" alt="Manager shared goals" width="100%" />
      <figcaption style="font-size:0.9rem; color:#6b7280; margin-top:8px;">Shared KPI page for syncing departmental goals across the team.</figcaption>
   </figure>
</div>
</details>

<details>
<summary><strong>Admin & Analytics</strong></summary>

<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin-top:16px;">
   <figure style="margin:0;">
      <img src="./Pictures/screencapture-localhost-5173-admin-2026-05-19-10_12_08.png" alt="Admin governance analytics" width="100%" />
      <figcaption style="font-size:0.9rem; color:#6b7280; margin-top:8px;">Governance analytics with org-wide health, hotspots, and escalation signals.</figcaption>
   </figure>
   <figure style="margin:0;">
      <img src="./Pictures/screencapture-localhost-5173-admin-2026-05-19-10_12_21.png" alt="Admin workspace overview" width="100%" />
      <figcaption style="font-size:0.9rem; color:#6b7280; margin-top:8px;">Admin workspace overview with cycle controls and recent audit activity.</figcaption>
   </figure>
   <figure style="margin:0;">
      <img src="./Pictures/screencapture-localhost-5173-admin-2026-05-19-10_12_31.png" alt="Admin audit trail" width="100%" />
      <figcaption style="font-size:0.9rem; color:#6b7280; margin-top:8px;">Audit trail table for monitoring system actions and compliance events.</figcaption>
   </figure>
   <figure style="margin:0;">
      <img src="./Pictures/screencapture-localhost-5173-admin-2026-05-19-10_12_43.png" alt="Admin reports builder" width="100%" />
      <figcaption style="font-size:0.9rem; color:#6b7280; margin-top:8px;">Reports builder for exporting filtered organizational reports.</figcaption>
   </figure>
   <figure style="margin:0;">
      <img src="./Pictures/screencapture-localhost-5173-analytics-2026-05-19-10_11_51.png" alt="Analytics command center" width="100%" />
      <figcaption style="font-size:0.9rem; color:#6b7280; margin-top:8px;">Analytics command center with AI signals, charts, and escalation trends.</figcaption>
   </figure>
   <figure style="margin:0;">
      <img src="./Pictures/screencapture-localhost-5173-analytics-2026-05-19-10_13_03.png" alt="Analytics insights dashboard" width="100%" />
      <figcaption style="font-size:0.9rem; color:#6b7280; margin-top:8px;">Additional governance analytics view for comparison and insight tracking.</figcaption>
   </figure>
</div>
</details>

---

## 🌟 Core Enterprise Features

### Phase 1: Robust Goal Creation & Workflow
- **Mathematical Validation**: Strict client-and-server enforcement: goals must equal 100% total weightage, max 8 goals per cycle, minimum 10% weightage per goal.
- **Goal Types (UoM Engine)**: Dynamically handles calculation paths for `Min (Numeric/%)`, `Max (Cost Reduction)`, `Timeline (Dates)`, and `Zero-based` targets.
- **Manager Approval Engine**: Seamless workflow for reviewing, rejecting, or inline-editing goals. Once approved, the goal is cryptographically locked via backend state.
- **Shared Goal Sync**: Department heads set overarching KPIs (e.g. "Increase Revenue by 10%"). Linked child goals automatically sync their progress whenever the primary KPI updates.

### Phase 2: Performance Tracking & Analytics
- **Quarterly Check-ins**: Dedicated modules where users enter raw "Actual Achievements" while the system automatically generates percentage completion scores based on UoM rules.
- **Enterprise Analytics Layer**: Live Recharts implementations of Organizational Heatmaps, Manager Response Times, and Performance Distributions.
- **Escalation Rules Engine**: Automated cron jobs flag overdue check-ins or pending approvals, systematically routing reminders through Level 1 (Employee), Level 2 (Manager), and Level 3 (HR).

### Technical Differentiators
- **Full Audit Trail**: Every significant action (Approval, Rejection, Edits, Escalation triggers) is immutably logged into an `AuditLog` database table tracking user, role, and old/new values.
- **Real CSV & Excel Export**: Reports export as CSV and Excel-compatible `.xls` files without vulnerable spreadsheet dependencies.
- **SSO Ready**: Built-in visual support and database schema for Microsoft Entra ID mapping, alongside internal "MS Teams" webhook notification structures.

---

## 🧑‍💻 Role Explanations

1. **Employee (`/employee`)**: Focuses on drafting goals, submitting them against the 100% cap, and executing quarterly check-ins. 
2. **Manager (`/manager`)**: Focuses on the "Approvals" dashboard, utilizing inline-editing, pushing back drafts, and monitoring team compliance.
3. **Admin / HR (`/admin`)**: Oversees the entire organization via the Audit Trail, Analytics suite, and Escalation monitors. Possesses global "unlock" powers.

---

## 🏗️ Architecture & Tech Stack

### Frontend (Client-Side)
- **Framework**: React 19 + Vite
- **Routing**: React Router 7 (Protected Routes via `ProtectedRoute.jsx`)
- **State Management**: API-driven React state backed by the Express/MongoDB service.
- **Styling**: TailwindCSS + Custom modular CSS
- **Data Visualization**: Recharts (Heatmaps, Area, Doughnut)
- **Toast Notifications**: `react-hot-toast`

### Backend (Server-Side)
- **Environment**: Node.js + Express.js
- **Database Model**: MongoDB (Mongoose Schema Design encompassing 7 discrete entities: User, Goal, SharedGoal, AuditLog, Approval, Escalation, Checkin)
- **Middleware Infrastructure**: 
  - `errorHandler.js` & `asyncHandler.js` (Centralized handling)
  - `role.js` (RBAC checking `authorizeRoles("admin")`)
  - `goalValidator.js` (Express-style array and schema validation)
- **Services Layer**: Advanced abstractions via `escalationCron.js` and `sharedGoalService.js`.

---

## 🚀 Setup & Installation Guide

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/goalsync-ai.git
   cd goalsync-ai
   ```

2. **Install Dependencies:**
   Ensure you install both root (frontend) and server dependencies:
   ```bash
   npm install
   cd server && npm install
   ```

3. **Environment Setup:**
   Rename `.env.example` to `.env` in the root and fill in your keys. For deployment, set `VITE_API_URL` to the public backend URL and set `MONGO_URI`/`JWT_SECRET` on the backend host.

4. **Run the Application (Concurrently):**
   ```bash
   # Terminal 1 (Frontend Development Server)
   npm run dev
   
   # Terminal 2 (Backend Node Server)
   cd server
   npm run server
   ```

5. **Verify before submission:**
   ```bash
   npm run lint
   npm run build
   cd server
   npm test
   npm audit
   ```

---

## 🔑 Demo Credentials

For hackathon presentation ease, the `Login.js` screen includes **Quick Switcher** buttons to instantly route between roles. You may also directly visit:
- [localhost:5173/employee](http://localhost:5173/employee)
- [localhost:5173/manager](http://localhost:5173/manager)
- [localhost:5173/admin](http://localhost:5173/admin)

All users have access to the `/analytics` module.

---

## 🔗 Deployment Links
- **Live Demo**: *(Update with your deployed frontend URL)*
- **API Base URL**: *(Update with your deployed backend URL, e.g. Render/Railway/Fly.io)*
- **Presentation Deck**: [Figma Slides](https://figma.com) *(Update link)*

> Built with ❤️ for the Hackathon by the Antigravity Team.
