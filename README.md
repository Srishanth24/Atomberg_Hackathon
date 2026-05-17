# GoalSync AI 🎯
> Enterprise-Grade Goal Setting & Performance Tracking Portal

<div align="center">
  <img src="./docs/architecture.png" alt="GoalSync AI Architecture" width="800" />
</div>

## 📖 Project Overview
Organizations that rely on manual or fragmented goal-tracking methods often struggle with alignment, visibility, and accountability. Spreadsheets, emails, and offline review cycles create blind spots.

**GoalSync AI** is a structured, digital Goal Setting & Tracking Portal designed to eliminate these pain points. The system supports the full lifecycle of employee goals — from creation and alignment to quarterly check-ins and performance visibility — while being highly intuitive, reliable, and audit-ready.

---

## 🌟 Core Features

### Phase 1: Goal Creation & Approval Workflow
- **Intelligent Goal Formulation**: Assign Unit of Measurement (Min, Max, Timeline, Zero-based) and Targets.
- **Strict Validation Rules**: System auto-enforces a 100% total weightage rule, min 10% per goal, and max 8 goals per employee.
- **Manager Approval Engine**: Managers can inline-edit weights and titles or push goals back to draft status. Approved goals are cryptographically **locked** from future edits.
- **Shared KPIs (Top-Down Alignment)**: Department heads can broadcast KPIs. Employees can only adjust the weightage; the overarching target remains read-only and syncs globally.

### Phase 2: Quarterly Check-ins & Analytics
- **Dynamic Formula Tracking**: The system auto-computes progress percentages based on the specific Unit of Measurement formula logic (e.g. `(Target / Achievement) * 100` for Max/Cost goals).
- **Enterprise Analytics Module**: Deep-dive Recharts visualizing Heatmaps, Manager Delay Analytics, Completion Trends, and Goal Distributions.
- **Audit Logging System**: Complete, searchable paper trail for all critical actions (approvals, edits, unlocks).

### Good-to-Have (Bonus Features Implemented)
- **Microsoft Entra ID Mock Integration**: Connect via Entra ID SSO layout mapping.
- **Microsoft Teams Sync**: Header toggle to route real-time notifications to MS Teams webhooks.
- **Escalation Rules Engine**: Rule-based notification tiering (Employee → Manager → HR) with Severity levels.

---

## 🏗️ Architecture & Tech Stack

### Frontend (Client-Side)
- **Framework**: React 19 + Vite
- **Routing**: React Router 7 (Protected Routes via `src/routes/ProtectedRoute.jsx`)
- **Styling**: TailwindCSS & Custom modular CSS files
- **Data Visualization**: Recharts (Heatmaps, Area Charts, Pie Charts)
- **Icons**: Lucide React

### Backend (Server-Side)
- **Environment**: Node.js + Express.js
- **Database Model**: MongoDB (Mongoose Schema design)
- **Middleware Infrastructure**: 
  - Centralized Error Handling (`errorHandler.js`)
  - Role-Based Access Control (`role.js`)
  - JWT Authentication (`auth.js`)
- **Services**: Decoupled `auditService.js` and `goalService.js`

### Folder Structure
```text
GoalSync-AI/
├── src/
│   ├── assets/          # Static files
│   ├── components/      # Reusable UI (Header, Sidebar)
│   ├── data/            # Realistic Mock Data Layer
│   ├── layouts/         # MainLayout wrappers
│   ├── pages/           # Route-level views (Dashboard, Login, Analytics)
│   ├── routes/          # ProtectedRoute wrappers
│   └── services/        # Frontend API abstraction (goalService)
└── server/
    ├── middleware/      # Auth, RBAC, Error Handler
    ├── models/          # AuditLog, Goal, User schemas
    ├── services/        # Business logic abstraction
    ├── utils/           # asyncHandler
    └── server.js        # Express entry point
```

---

## 🛠️ API Layer Documentation
The system is built on a clean RESTful architecture. (Implemented via simulated mock services in the prototype):

- `POST /api/goals/create` - Creates a new employee goal draft.
- `PUT /api/goals/approve/:id` - Locks goal and updates lifecycle status.
- `PUT /api/goals/checkin/:id` - Triggers the progress computing formula based on UoM.
- `GET /api/reports/completion` - Aggregates data for the Analytics Recharts layer.
- `POST /api/audit/log` - Middlewares trace and append entries to `AuditLog`.

---

## 🚀 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/goalsync-ai.git
   cd goalsync-ai
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```

3. **Environment Setup:**
   Rename `.env.example` to `.env` and fill in your keys (Mock keys are fine for demo).

4. **Run the Application (Concurrently):**
   ```bash
   # Terminal 1 (Frontend)
   npm run dev
   
   # Terminal 2 (Backend)
   cd server
   npm run server
   ```

---

## 🔑 Demo Credentials

To experience the role-based views, you can click the quick-login demo buttons on the Login page, or route directly to:
- **Employee**: `/employee`
- **Manager**: `/manager`
- **Admin**: `/admin`

All dashboards have dedicated access to the `/analytics` module.

> Built with ❤️ for the Hackathon.
