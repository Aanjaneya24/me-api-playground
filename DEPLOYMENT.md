# 🚀 Deployment Guide - Render

## Deploy Backend

### 1. Create Backend Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `Aanjaneya24/me-api-playground`
4. Configure:
   - **Name**: `me-api-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && node seed.js`
   - **Start Command**: `node index.js`
   - **Instance Type**: `Free`

5. Add Environment Variable:
   - **Key**: `NODE_ENV`
   - **Value**: `production`

6. Click **"Create Web Service"**
7. **Copy your backend URL** (e.g., `https://me-api-backend.onrender.com`)

---

## Deploy Frontend

### 1. Update Frontend API URL
Before deploying frontend, update the API URL:

1. Go to Render Dashboard
2. Click on your backend service
3. Find your service URL (e.g., `https://me-api-backend.onrender.com`)

### 2. Create Frontend Static Site
1. Click **"New +"** → **"Static Site"**
2. Connect same repository: `Aanjaneya24/me-api-playground`
3. Configure:
   - **Name**: `me-api-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com/api` (use your actual backend URL)

5. Click **"Create Static Site"**

---

## ⚠️ Important Notes

### Free Tier Limitations:
- **Backend spins down after 15 minutes of inactivity**
- First request after spin-down takes 30-60 seconds
- **Database resets on each deployment** (SQLite is ephemeral)

### Database Persistence:
The SQLite database will be recreated on each deployment using `seed.js`. For production, consider:
- Using Render's PostgreSQL database (free tier available)
- External database service

---

## Testing Deployed App

1. **Backend Health Check**: `https://your-backend-url.onrender.com/api/health`
2. **Frontend**: `https://your-frontend-url.onrender.com`

---

## Alternative: One-Click Deploy

Use the `render.yaml` file in the root directory:

1. Go to Render Dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect repository: `Aanjaneya24/me-api-playground`
4. Render will automatically detect `render.yaml` and set up both services
5. Update `VITE_API_URL` in frontend environment variables after backend is deployed

---

## Local Development After Deployment

Your local setup remains unchanged:
```bash
# Backend (Terminal 1)
cd backend
npm start

# Frontend (Terminal 2)
cd frontend
npm run dev
```

Frontend will use `http://localhost:3000/api` locally and production URL when deployed.
