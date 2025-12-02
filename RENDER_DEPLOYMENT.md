# Render.com Deployment Guide

## Problem
The React build directory is not found on Render, causing 500 errors when trying to serve the React app.

## Solution
The code has been updated to:
1. Build the React app before starting the server
2. Try multiple paths to find the build directory
3. Provide better error messages

---

## Configuration Files Updated

### 1. `Procfile`
Updated to build the frontend before starting:
```
web: npm run build && node server.js
```

### 2. `package.json`
Added build scripts:
- `build`: Builds the React frontend
- `render-build`: Installs dependencies, builds, and starts server

### 3. `backend/index.js`
- Now tries multiple paths to find the build directory
- Better error messages with path information

---

## Render.com Setup

### Build Command
In your Render dashboard, set the **Build Command** to:
```bash
npm run install-all && npm run build
```

Or if you want to use the render-build script:
```bash
npm run render-build
```

### Start Command
The **Start Command** should be:
```bash
node server.js
```

**Note:** The Procfile will automatically run `npm run build && node server.js`, so you can also just use:
```
web: npm run build && node server.js
```

---

## Environment Variables

Make sure to set these in your Render dashboard:

1. **NODE_ENV**: `production`
2. **PORT**: (Auto-set by Render, but you can override)
3. **MONGODB_URL**: Your MongoDB connection string
4. **Other backend env vars**: As needed (RAZORPAY keys, etc.)

---

## Build Process

The build process will:
1. Install root dependencies: `npm install`
2. Install frontend dependencies: `cd frontend && npm install`
3. Build React app: `cd frontend && npm run build`
4. Start server: `node server.js`

---

## Troubleshooting

### Error: "index.html not found"

**Check 1:** Verify build completed
- Check Render build logs
- Look for: `Creating an optimized production build...`
- Should see: `The build folder is ready to be deployed.`

**Check 2:** Verify build path
- Server logs will show: `✓ React build directory found at: ...`
- If you see warnings, check the paths tried

**Check 3:** Check file structure
On Render, your structure should be:
```
/opt/render/project/src/
├── backend/
├── frontend/
│   └── build/        ← This should exist after build
├── package.json
└── server.js
```

### Error: "Build failed"

**Solution:** Check frontend dependencies
- Make sure all frontend dependencies are in `frontend/package.json`
- Check for any build errors in Render logs

### Error: "Module not found"

**Solution:** 
- Make sure `npm run install-all` runs before build
- Check that both root and frontend `package.json` files are correct

---

## Manual Build (for testing)

If you want to test the build locally before deploying:

```bash
# Install all dependencies
npm run install-all

# Build React app
npm run build

# Start server
node server.js
```

Then check if `frontend/build/index.html` exists.

---

## After Deployment

1. **Check server logs** for:
   - `✓ React build directory found at: ...`
   - `✓ index.html found at: ...`

2. **Test the site:**
   - Visit your Render URL
   - Should see the React app (Home page)
   - Check browser console for any errors

3. **Test API:**
   - Visit `/api/v1/...` endpoints
   - Should return JSON responses

---

## Quick Fix Commands

If build fails, you can SSH into Render and run:

```bash
cd /opt/render/project/src
npm run install-all
npm run build
ls -la frontend/build/  # Verify build exists
```

---

## Notes

- **Build time:** First build may take 5-10 minutes
- **Subsequent builds:** Usually 2-5 minutes
- **Build cache:** Render caches `node_modules` between builds
- **Auto-deploy:** Render auto-deploys on git push (if configured)

