# Deployment Guide

## Backend (Render)
1. **Repository**: Push the `server/` folder or the whole repo to GitHub.
2. **Setup**: Create a new **Web Service** on Render.
3. **Root Directory**: `server`
4. **Build Command**: `npm install`
5. **Start Command**: `node src/server.js`
6. **Environment Variables**:
   - `MONGO_URI`: (Your Atlas URI)
   - `JWT_SECRET`: (Your Secret)
   - `PORT`: 10000 (standard for Render)

## Frontend (Vercel)
1. **Repository**: Push the root folder to GitHub.
2. **Setup**: Create a new project on Vercel.
3. **Framework**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variables**:
   - `VITE_API_URL`: `https://your-backend-app-name.onrender.com/api`
7. **Important**: Update `vercel.json` destination with your actual Render URL.
