# 🚀 HujanGakYa - Deployment Guide

## Quick Deploy to Vercel

### Option 1: GitHub Integration (Recommended)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import this repository
5. Configure settings:
   - Framework Preset: **Other**
   - Root Directory: **/** 
   - Build Command: **cd frontend && npm run build**
   - Output Directory: **frontend/build**
   - Install Command: **cd frontend && npm install && cd ../backend && npm install**

### Option 2: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Environment Variables
Add these in Vercel dashboard:
- `NODE_ENV=production`

## Local Development
```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm start
```

## Project Structure
```
├── backend/          # Node.js API
├── frontend/         # React App
├── vercel.json       # Vercel config
└── .vercelignore     # Files to ignore
```

## Live Demo
After deployment: `https://your-app.vercel.app`
