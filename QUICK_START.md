# 🚀 Quick Start Guide

## Installation & Setup (First Time Only)

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Create Backend .env File
Create `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/goalsync
JWT_SECRET=your_secret_key_here_min_32_chars_long
NODE_ENV=development
```

### 3. Ensure MongoDB is Running
```bash
# If using MongoDB locally
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env to your Atlas connection string
```

### 4. Install Frontend Dependencies
```bash
# From root directory
npm install
```

### 5. Create Frontend .env File
Create `.env.local` in root:
```
VITE_API_URL=http://localhost:5000/api
```

---

## Starting the Application

### Terminal 1: Backend Server
```bash
cd server
npm run dev
# Should show: "Server running on port 5000"
```

### Terminal 2: Frontend Dev Server
```bash
# From root directory
npm run dev
# Should show: "Local: http://localhost:5173"
```

### Terminal 3 (Optional): Tail Backend Logs
```bash
cd server
# Keep this open to see real-time logs
npm run dev | grep -v "GET\|POST\|PUT"  # Filter noise
```

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Employee | peter.parker@goalsync.app | demo123! |
| Manager | tony.stark@goalsync.app | demo123! |
| Admin | admin.hr@goalsync.app | demo123! |

---

## Quick Test: Employee Goal Creation

1. **Open Browser**
   - Go to `http://localhost:5173`

2. **Login**
   - Email: `peter.parker@goalsync.app`
   - Password: `demo123!`
   - Click "Login"

3. **Create Goal** (THIS SHOULD WORK NOW!)
   - Click "My Goals" tab
   - Click "Add Goal" button
   - Modal opens ✓
   - Fill form:
     - Title: "Test Goal"
     - Thrust Area: "Revenue Growth"
     - Weightage: 10
     - UoM: "Min (Numeric / %)"
     - Target: "100"
     - Description: "Test description"
   - Click "Save as Draft"
   - ✓ Goal appears in table
   - ✓ Toast shows "Goal draft saved"

4. **Check Browser Console**
   - Open DevTools (F12)
   - Go to Console tab
   - ✓ No red errors
   - Look for network requests in Network tab

---

## Verify the Fix Works

### Step 1: Check Auth Middleware Exists
```bash
ls -la server/src/middleware/auth.js
# Should show the file exists (recent timestamp)
```

### Step 2: Check Server Startup
Backend logs should show:
```
Database connected: mongodb://localhost:27017/goalsync
Server running on port 5000
```

### Step 3: Verify API Calls
1. Open DevTools Network tab
2. Create a goal
3. Look for POST request to `/api/goals/drafts`
4. Check response:
   - Status: 201 (success)
   - Body: `{ success: true, data: { id, title, ... } }`

### Step 4: Check Authentication
1. Open DevTools Application tab
2. Go to LocalStorage
3. Verify `authToken` key exists
4. Verify JWT token looks valid (3 parts separated by dots)

---

## Common Issues & Solutions

### Issue: "Cannot find module 'middleware/auth.js'"
**Solution:** 
- The file was missing but is now created
- If error persists, restart backend server: `npm run dev`

### Issue: Port 5000 Already in Use
**Solution:**
```bash
# Kill process using port 5000
# Linux/Mac:
kill -9 $(lsof -t -i:5000)

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: MongoDB Connection Error
**Solution:**
- Ensure MongoDB is running: `mongod`
- Or update `.env` with MongoDB Atlas connection string
- Check `MONGODB_URI` format

### Issue: Frontend Shows "Failed to fetch"
**Solution:**
- Backend must be running on port 5000
- Check `VITE_API_URL=http://localhost:5000/api` in `.env.local`
- Clear browser cache (Ctrl+F5)

### Issue: "Module not found: jsonwebtoken"
**Solution:**
```bash
cd server
npm install jsonwebtoken
npm run dev
```

---

## Full Feature Demo (10 minutes)

### 1. Employee Workflow (3 min)
```bash
# Already logged in as peter.parker@goalsync.app
1. Click "My Workspace" - Show overview dashboard
2. Click "My Goals" - Show existing goals
3. Click "Add Goal" - Create new goal (THE FIX!)
4. Fill form and save - Goal appears in table
```

### 2. Manager Workflow (3 min)
```bash
1. Logout (click profile → Logout)
2. Login as tony.stark@goalsync.app / demo123!
3. Click "Approvals" - Show pending goal sheets
4. Click "Approve" - Approve goals
5. Employee gets notification
```

### 3. Admin Workflow (2 min)
```bash
1. Logout and login as admin.hr@goalsync.app / demo123!
2. Click "Audit Logs" - Show all actions
3. Click "Export" - Download achievement report
4. Verify CSV file downloaded
```

### 4. Notifications (2 min)
```bash
# While logged in as employee
1. Check notification drawer (bell icon in header)
2. Should show "Goal Approved" notification
3. Click to mark as read
4. Check count badge decreases
```

---

## Database Seeding

First login as employee automatically:
- Creates demo user (peter.parker@goalsync.app)
- Creates 4 seed goals
- Creates manager/admin users

**To reset database:**
```bash
# Delete MongoDB database (or just collections)
# Then restart backend - will reseed

# Or manually in MongoDB:
use goalsync
db.dropDatabase()
# Restart backend to reseed
```

---

## Browser DevTools

### To Monitor API Calls:
1. Open DevTools (F12)
2. Click "Network" tab
3. Make API call (e.g., create goal)
4. Click request URL
5. View:
   - Headers tab: Check Authorization header
   - Response tab: Check { success, data }
   - Console: Check for errors

### To View Stored Auth Token:
1. Open DevTools
2. Click "Application" tab
3. Click "LocalStorage"
4. Look for `authToken` key
5. Value should be JWT (3 parts with dots)

---

## Troubleshooting Checklist

Before reporting issues, verify:

- [ ] Backend server is running (`npm run dev` in server/)
- [ ] Frontend dev server is running (`npm run dev` in root)
- [ ] MongoDB is running or connection string is correct
- [ ] Port 5000 is not in use by other apps
- [ ] `.env` and `.env.local` files are created
- [ ] Dependencies installed (`npm install` in both directories)
- [ ] Browser cache cleared (Ctrl+F5)
- [ ] Backend shows no errors in terminal
- [ ] No red errors in browser DevTools Console
- [ ] JWT token in LocalStorage is valid format
- [ ] Network requests show 200/201 responses (not 401/403)

---

## Performance Tips

### Optimize Backend
- Install redis for session caching
- Add database indexing for large datasets
- Consider pagination for goal listings

### Optimize Frontend
- Enable production build: `npm run build`
- Use browser DevTools Performance tab
- Check bundle size: `npm run build` shows size

### Monitor
```bash
# Check backend logs for slow queries
NODE_ENV=development npm run dev

# Check frontend performance
DevTools → Performance tab → Record
```

---

## Next Steps for Development

After verifying everything works:

1. **Customize theme colors**
   - Edit `src/index.css` CSS variables

2. **Add more validation**
   - Server-side validators in `server/utils/`
   - Client-side validators in `src/`

3. **Implement additional features**
   - Shared KPI sync
   - Advanced reporting
   - Email notifications

4. **Deploy**
   - Backend: Deploy to Heroku/Railway/Render
   - Frontend: Deploy to Vercel/Netlify
   - Database: Use MongoDB Atlas or AWS

---

## Support

If issues persist:
1. Check terminal logs (backend)
2. Check browser DevTools (frontend)
3. Review `CRITICAL_FIX_SUMMARY.md` for what was fixed
4. Review `TESTING_GUIDE.md` for detailed test cases

**The critical fix is: `server/src/middleware/auth.js` was created**

This enables all protected API routes to work properly!
