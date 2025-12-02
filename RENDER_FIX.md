# Fixing 500 Error on Render.com

## The Problem
Getting 500 errors because the React build directory doesn't exist on Render.

## The Solution

### Option 1: Use Procfile (Recommended)
The `Procfile` has been updated to:
```
web: npm run install-all && npm run build && node server.js
```

This will:
1. Install all dependencies (root + frontend)
2. Build the React app
3. Start the server

### Option 2: Configure Build & Start Commands in Render Dashboard

In your Render dashboard:

**Build Command:**
```bash
npm run install-all && npm run build
```

**Start Command:**
```bash
node server.js
```

## Verify Build is Running

After deploying, check Render logs for:

✅ **Good signs:**
```
Installing root dependencies...
Installing frontend dependencies...
Creating an optimized production build...
The build folder is ready to be deployed.
✓ React build directory found at: ...
✓ index.html found at: ...
```

❌ **Bad signs:**
```
⚠ React build directory not found
⚠ Make sure to run "npm run build" in the frontend directory
```

## If Build Still Fails

### Check 1: Dependencies
Make sure `frontend/package.json` has all required dependencies.

### Check 2: Build Errors
Look for errors in Render build logs like:
- Missing dependencies
- Build script errors
- Memory issues

### Check 3: Path Issues
The server now tries multiple paths:
- `../frontend/build` (standard)
- `../../frontend/build` (alternative)
- `process.cwd()/frontend/build` (Render)
- `process.cwd()/build` (root)

Check logs to see which paths were tried.

## Manual Build Test

To test locally before deploying:

```bash
# Install all dependencies
npm run install-all

# Build React app
npm run build

# Verify build exists
ls -la frontend/build/index.html

# Start server
node server.js
```

## After Fix

Once the build is working, you should see:
- ✅ `✓ React build directory found at: ...`
- ✅ `✓ index.html found at: ...`
- ✅ `✓ Static file serving enabled for: ...`
- ✅ No more 500 errors
- ✅ Site loads correctly

## Current Status

The code is now:
- ✅ Fixed to handle missing build gracefully
- ✅ Shows helpful error messages
- ✅ Tries multiple build paths
- ✅ Only serves static files if build exists

**Next step:** Make sure Render runs the build command before starting the server!

