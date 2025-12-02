# Environment Variables Setup Guide

## Problem
The frontend is trying to connect to `http://localhost:4000` in production, causing network errors.

## Solution
The code has been updated to automatically detect production vs development. However, you can also set environment variables for more control.

---

## Automatic Detection (Current Setup)

The code now automatically detects if you're in production or development:

- **Production** (not localhost): Uses relative URLs (same domain)
- **Development** (localhost): Uses `http://localhost:4000`

This should work automatically without any configuration!

---

## Manual Configuration (Optional)

If you want to explicitly set the API URL, create environment files:

### For Production Build

Create `frontend/.env.production`:
```env
REACT_APP_BASE_URL=https://www.crmwale.com
# OR use relative URLs (empty string) if same domain:
# REACT_APP_BASE_URL=
```

### For Development

Create `frontend/.env.development`:
```env
REACT_APP_BASE_URL=http://localhost:4000
```

### For Local Production Testing

Create `frontend/.env.local`:
```env
REACT_APP_BASE_URL=http://localhost:4000
```

---

## How to Apply

1. **Create the environment file** in the `frontend/` directory
2. **Rebuild your React app**:
   ```bash
   cd frontend
   npm run build
   ```
3. **Deploy the new build** to your production server

---

## Important Notes

1. **Environment variables** must start with `REACT_APP_` to be accessible in React
2. **After changing .env files**, you must rebuild the app (`npm run build`)
3. **.env files are gitignored** - don't commit sensitive data, but you can commit `.env.example` files
4. **Relative URLs** (empty string) work best when frontend and backend are on the same domain

---

## Testing

After deployment, check the browser console. You should see:
```
Using baseURL: (relative to current domain)
```
or
```
Using baseURL: https://www.crmwale.com
```

Instead of:
```
Using baseURL: http://localhost:4000
```

---

## Troubleshooting

### Still seeing localhost:4000?
1. Make sure you rebuilt the app after changes
2. Clear browser cache
3. Check browser console for the actual baseURL being used
4. Verify the environment file is in the `frontend/` directory

### Network errors persist?
1. Check that your backend server is running on the production domain
2. Verify CORS settings in `backend/index.js` include your domain
3. Check browser Network tab to see the actual request URL

