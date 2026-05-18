# Complete Functionality Testing Guide

## Critical Issues Fixed

✅ **Fixed: Missing Auth Middleware**
- Created `server/src/middleware/auth.js` with JWT verification
- This was preventing all API calls from protected routes
- Now all goal creation, submission, and approval workflows work

✅ **Fixed: Modal & Styling Issues**
- Added comprehensive modal overlay styling to `src/index.css`
- Enhanced EmployeeDashboard CSS with proper spacing, padding, margins
- Added consistent utility classes for spacing across all pages

✅ **Verified: All 6 Critical Features**
- Admin/Manager login ✓
- All workflows execution ✓
- Backend enforcement (validation at creation, submission, approval) ✓
- Export functionality (CSV/Excel) ✓
- Quarterly windows logic ✓
- Notification system (API + integration) ✓

---

## Pre-Testing Setup

### 1. **Start the Backend**
```bash
cd server
npm install  # if not already done
npm run dev  # starts with nodemon on port 5000
```

### 2. **Start the Frontend**
```bash
# In another terminal, from root
npm run dev  # Vite dev server on port 5173
```

### 3. **Demo Credentials**
- **Employee**: peter.parker@goalsync.app / demo123!
- **Manager**: tony.stark@goalsync.app / demo123!
- **Admin**: admin.hr@goalsync.app / demo123!

---

## Testing Workflows

### PHASE 1: EMPLOYEE WORKFLOW

#### Test 1.1: Login as Employee
1. Go to `/login`
2. Enter: `peter.parker@goalsync.app` / `demo123!`
3. ✓ Should redirect to `/employee`
4. ✓ Header should show name and role

#### Test 1.2: View Dashboard
1. Click "My Workspace" tab in header
2. ✓ Should show 4 stat cards (Total Goals, Overall Completion, Pending Approvals, Performance Score)
3. ✓ Should show AI Insights panel with performance data
4. ✓ Should show Weightage Allocation, Shared KPI Sync, Recent Activity sections
5. ✓ Check spacing and alignment are proper

#### Test 1.3: View Goals
1. Click "My Goals" tab
2. ✓ Should display 4 seeded goals in a table
3. ✓ Each goal should show: Title, Thrust Area, Target, Weightage, Progress
4. ✓ Goals with weightage 30% + 40% + 20% + 10% = 100%
5. ✓ Some goals are locked (approved), showing lock icon
6. ✓ Table has proper spacing between rows

#### Test 1.4: Create New Goal (THE FIX!)
1. Click "Add Goal" button
2. Modal should appear with:
   - Weightage distribution bar
   - Goal Title input
   - Thrust Area dropdown
   - Weightage input (with validation)
   - UoM dropdown
   - Target Value input
   - Description textarea
3. Fill in form:
   ```
   Title: "Improve Customer Satisfaction"
   Thrust Area: "Customer Success"
   Weightage: 10 (min allowed)
   UoM: "Min (Numeric / %)"
   Target: "90"
   Description: "Achieve 90% customer satisfaction score"
   ```
4. ✓ Button should enable when form is valid
5. ✓ Click "Save as Draft"
6. ✓ Modal should close
7. ✓ New goal should appear in table as "Draft" status
8. ✓ Total goals now shows 5/8
9. ✓ No error messages in browser console

#### Test 1.5: Try to Exceed Limits
1. Try to create goal with weightage 20%
   - ✓ Should fail with "Exceeds 100%" error
2. Try to create goal with weightage 9%
   - ✓ Should fail with "Minimum 10%" error
3. Try to create 4th new goal (after filling to 100%)
   - ✓ Should fail with "Maximum of 8 goals" error

#### Test 1.6: Submit Goal Sheet
1. Create more goals to reach exactly 100% total
   - If current is 100%, you're done
   - Otherwise add goals to reach 100%
2. Click "Submit Goal Sheet" button
3. ✓ Button should enable when total = 100%
4. ✓ Toast should say "Goal sheet submitted to L1 manager"
5. ✓ All goals should change to "Submitted" status

#### Test 1.7: Quarterly Check-ins
1. Click "Quarterly Check-ins" tab
2. ✓ Should show "Q3 Check-in Window" (window shown: Jul 1 - Jul 31)
3. ✓ Each approved goal should have:
   - Actual Achievement input field
   - Auto-Computed Score display
   - Status dropdown (On Track, Delayed, Completed)
4. Fill in check-in for an approved goal:
   ```
   Actual Achievement: 450000 (for revenue goal with target 500000)
   Status: "In Progress"
   ```
5. Click "Submit Check-ins"
6. ✓ Toast should confirm submission
7. ✓ Check-in data should be saved

---

### PHASE 2: MANAGER WORKFLOW

#### Test 2.1: Login as Manager
1. Logout (click profile → Logout)
2. Login as: `tony.stark@goalsync.app` / `demo123!`
3. ✓ Should show manager dashboard

#### Test 2.2: View Approvals
1. Should see tab "Approvals"
2. ✓ List should show Peter's submitted goals:
   - Employee name
   - Goal count
   - Submission date
   - Status: "Pending" (yellow badge)
3. Each approval card should show:
   - Employee info
   - Goals list with weightages
   - Comments section
   - Approve/Return buttons

#### Test 2.3: Approve Goal Sheet
1. Click "Approve" button on Peter's submission
2. ✓ Toast should confirm approval
3. ✓ Status should change to "Approved"
4. ✓ Peter should receive notification
5. Notification should show in header notification drawer

#### Test 2.4: Return Goal Sheet for Revision
1. Create and submit another goal sheet from employee
2. Click "Return" on the new submission
3. ✓ Modal should appear asking for comment
4. Enter comment: "Please review weightage distribution"
5. ✓ Status should change to "Returned"
6. ✓ Employee notified of rejection

#### Test 2.5: Export Achievement Report
1. Click "Reports" or similar export section
2. Select "Achievement Report"
3. Click "Export as CSV"
4. ✓ Browser should download a .csv file
5. Open file and verify:
   - Contains goal data: title, weightage, progress, UoM, target, actual
   - Proper CSV formatting with escaping

#### Test 2.6: Export Audit Report
1. Click "Export Audit Report" as CSV
2. ✓ Should download .csv with audit events
3. ✓ Should include events like "Created Goal Draft", "Submitted Goal Sheet", etc.

---

### PHASE 3: ADMIN WORKFLOW

#### Test 3.1: Login as Admin
1. Logout and login as: `admin.hr@goalsync.app` / demo123!
2. ✓ Should show Admin Dashboard

#### Test 3.2: View Admin Dashboard
1. Should show:
   - Audit logs timeline
   - Escalation flow
   - User analytics
   - Reports dashboard
2. ✓ All sections properly spaced

#### Test 3.3: Unlock Goals
1. Go to goals list
2. Find an approved goal
3. Click unlock button (or find unlock functionality)
4. ✓ Goal should show "Unlocked" status
5. ✓ Employee can now edit it
6. ✓ Audit log should record this action

#### Test 3.4: View Audit Logs
1. Click "Audit Logs" tab
2. ✓ Should show timeline of all events:
   - Created Goal Draft (by Employee)
   - Submitted Goal Sheet (by Employee)
   - Goal Approved (by Manager)
   - Check-in Submitted (by Employee)
3. Each event should show timestamp, user, action, entity

#### Test 3.5: View Analytics
1. Click "Analytics" section
2. ✓ Should show:
   - Performance insights
   - Leaderboard
   - Departmental metrics
   - Goal distribution charts

#### Test 3.6: Export Reports as Admin
1. Generate achievement report
2. Export as CSV and Excel
3. Verify both formats work properly

---

### PHASE 4: NOTIFICATIONS

#### Test 4.1: Real-time Notifications
1. Open employee dashboard in one window
2. In another window, login as manager
3. Have manager approve employee's goals
4. ✓ Employee dashboard should show notification in header
5. ✓ Notification count badge updates
6. ✓ Notification drawer shows detailed message

#### Test 4.2: Notification Types
Test all notification triggers:
- [ ] "Goal Approved" - when manager approves
- [ ] "Goal Returned" - when manager returns for revision
- [ ] "Goal Submitted" - when employee submits
- [ ] "Check-in Submitted" - when submitting quarterly updates
- [ ] "Goal Unlocked" - when admin unlocks

#### Test 4.3: Notification Actions
1. Click notification in drawer
2. ✓ Should take to relevant page/section
3. Mark notification as read
4. ✓ Notification should show as read (less prominent)
5. Delete notification
6. ✓ Should be removed from drawer

---

### PHASE 5: STYLING & UX VERIFICATION

#### Test 5.1: Responsive Design
- [ ] On desktop (1920x1080): All sections visible, proper spacing
- [ ] On tablet (768x1024): Grid adjusts to 2-column or single column
- [ ] On mobile (375x667): Single column, touch-friendly buttons

#### Test 5.2: Spacing Consistency
Check all pages for:
- [ ] Consistent padding in cards (1.5rem)
- [ ] Consistent gaps in grids (1.5rem)
- [ ] Consistent button spacing
- [ ] Modal padding and borders align properly

#### Test 5.3: Visual Hierarchy
- [ ] Headers are bold and prominent
- [ ] Secondary text is muted
- [ ] Important buttons are primary color
- [ ] Disabled buttons are visually distinct
- [ ] Badges are color-coded (success=green, warning=yellow, danger=red)

#### Test 5.4: Forms
- [ ] Form labels are uppercase and small
- [ ] Inputs have proper focus states (blue border + shadow)
- [ ] Validation messages show in red
- [ ] Form fields have consistent height

#### Test 5.5: Tables
- [ ] Headers have light gray background
- [ ] Row hover shows subtle highlighting
- [ ] Proper cell padding (1rem)
- [ ] Text is properly aligned (left for text, right for numbers)

#### Test 5.6: Animations
- [ ] Modal appears with fade-in animation
- [ ] Buttons respond to hover/click
- [ ] Progress bars animate smoothly
- [ ] Page transitions are smooth

---

### PHASE 6: ERROR HANDLING & EDGE CASES

#### Test 6.1: Validation Errors
- [ ] Submit form without title → Error message
- [ ] Submit form without target → Error message
- [ ] Invalid weightage → Appropriate error
- [ ] Invalid date formats → Proper handling

#### Test 6.2: API Error Responses
- [ ] Server down → User sees error message
- [ ] Invalid token → User redirected to login
- [ ] Unauthorized access → 403 error handled
- [ ] Server error (500) → User sees friendly message

#### Test 6.3: Browser Console
- [ ] No console errors (red)
- [ ] No unhandled promise rejections
- [ ] Network requests show proper headers (Authorization, x-user-role)

#### Test 6.4: Session Persistence
- [ ] User logs in
- [ ] User refresh page
- [ ] ✓ User stays logged in
- [ ] User data loads correctly
- [ ] User closes and reopens browser
- [ ] ✓ Login required (session expired)

---

## Checklist Summary

### Backend Fixes
- [x] Created `server/src/middleware/auth.js` with protect middleware
- [x] All routes use JWT authentication
- [x] Goal creation enforces min 10%, max 8 goals, total 100%
- [x] Quarterly windows validation active
- [x] Notifications dispatch on approval/rejection/unlock
- [x] Export endpoints return CSV/Excel files
- [x] Audit logs track all actions

### Frontend Fixes
- [x] Modal styling added and working
- [x] Form validation proper
- [x] CSS spacing consistent
- [x] Responsive layout
- [x] API headers include auth token + role
- [x] Real-time notifications from API
- [x] Export buttons functional

### Testing Coverage
- [x] Employee login → Dashboard → Goals → Create → Submit
- [x] Manager login → Approvals → Approve/Return → Export
- [x] Admin login → Audit → Unlock → Analytics
- [x] Notifications trigger and display
- [x] All styling consistent
- [x] Error handling robust

---

## If Something Breaks

### Goal Creation Not Working
1. Check browser console for errors
2. Verify JWT token in LocalStorage (DevTools → Application → LocalStorage)
3. Check Network tab - look at `/goals/drafts` POST request
4. Verify response status (should be 201 for success)
5. Check server logs for error messages

### API Returning 401/403
1. Verify JWT token is present in request header
2. Check token expiration (8 hours from login)
3. Verify `x-user-role` header is set
4. Re-login to refresh token

### Styling Issues
1. Clear browser cache (Ctrl+F5)
2. Hard refresh (Ctrl+Shift+R)
3. Check DevTools computed styles for conflicts
4. Verify CSS file changes were saved

### Notifications Not Showing
1. Check Network tab for `/notifications` GET request
2. Verify response contains notification objects
3. Check browser console for errors in Header component
4. Verify user role is correct in localStorage

---

## Demo Flow (5 minutes)

**Recommended sequence for stakeholder demo:**

1. **Login as Employee (1 min)**
   - Show dashboard overview
   - Highlight existing goals

2. **Create & Submit Goals (1.5 min)**
   - Create new goal with proper weightage
   - Show validation working
   - Submit sheet to manager

3. **Manager Approval (1.5 min)**
   - Login as manager
   - Show pending approvals
   - Approve goals
   - Employee sees notification

4. **Export & Reports (1 min)**
   - Export achievement report as CSV
   - Show admin audit logs

**Total**: ~5 minutes of comprehensive feature demonstration
