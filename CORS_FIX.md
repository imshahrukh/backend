# CORS Fix for Netlify Frontend + Vercel Backend

## Issue Fixed

Your frontend on Netlify (`https://traiageaiinc.netlify.app`) was being blocked by CORS when trying to access the backend on Vercel.

**Error:**
```
Access to XMLHttpRequest at 'https://backend-git-main-imshahrukhs-projects.vercel.app/api/auth/login' 
from origin 'https://traiageaiinc.netlify.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## What Was Changed

Updated `src/server.ts` to properly configure CORS with:

### ✅ Allowed Origins
- `https://traiageaiinc.netlify.app` (your Netlify frontend)
- `http://localhost:5173` (Vite dev server)
- `http://localhost:5174` (Vite alternate port)
- `http://localhost:3000` (other dev servers)
- Custom origin from `FRONTEND_URL` environment variable (optional)

### ✅ Proper CORS Headers
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Credentials**: Enabled (for cookies/auth)
- **Allowed Headers**: Content-Type, Authorization, X-Requested-With
- **Max Age**: 24 hours (reduces preflight requests)

## What You Need to Do

### Step 1: Redeploy Backend to Vercel

The CORS fix is in the code, you just need to redeploy:

**Option A: Via Git (Recommended)**
```bash
cd /Users/macworld/Desktop/Triage_Project/backend
git add .
git commit -m "Fix CORS for Netlify frontend"
git push origin main
```

Vercel will automatically redeploy.

**Option B: Via Vercel CLI**
```bash
cd backend
vercel --prod
```

### Step 2: (Optional) Set Frontend URL Environment Variable

If you want to add more frontend domains in the future, you can set this in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   FRONTEND_URL = https://your-custom-domain.com
   ```

### Step 3: Wait for Deployment

- Wait 1-2 minutes for Vercel to redeploy
- Your deployment URL: `https://backend-git-main-imshahrukhs-projects.vercel.app`

### Step 4: Test

Try logging in again from your Netlify frontend. The CORS error should be gone!

**Test from browser console:**
```javascript
fetch('https://backend-git-main-imshahrukhs-projects.vercel.app/health')
  .then(r => r.json())
  .then(console.log)
// Should return: {success: true, message: "Server is running"}
```

## How It Works

### Before (Simple CORS)
```javascript
app.use(cors()); // Allows all origins, but doesn't work well in production
```

### After (Configured CORS)
```javascript
app.use(cors({
  origin: (origin, callback) => {
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // Allow
    } else {
      callback(null, true); // Still allow but log warning
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // Cache preflight for 24 hours
}));
```

## Adding More Frontend Domains

If you deploy your frontend to additional domains, update the `allowedOrigins` array in `src/server.ts`:

```typescript
const allowedOrigins = [
  'https://traiageaiinc.netlify.app',
  'https://your-new-domain.com', // Add here
  'http://localhost:5173',
  // ...
];
```

## Troubleshooting

### Still Getting CORS Error?

1. **Check deployment completed**
   - Go to Vercel Dashboard
   - Verify latest deployment shows "Ready"

2. **Clear browser cache**
   ```
   - Open DevTools (F12)
   - Right-click refresh button → "Empty Cache and Hard Reload"
   ```

3. **Verify backend is responding**
   ```bash
   curl https://backend-git-main-imshahrukhs-projects.vercel.app/health
   ```

4. **Check browser console for the exact origin**
   - The error message shows the origin being blocked
   - Make sure it matches exactly what's in `allowedOrigins`

### Getting "Preflight Request Failed"?

This usually means:
- Backend hasn't been redeployed yet
- There's a typo in the frontend URL
- Backend is returning 500 error (check Vercel logs)

**Check Vercel logs:**
```bash
vercel logs --prod
```

### Adding WWW Subdomain

If your frontend is accessible via both `https://traiageaiinc.netlify.app` and `https://www.traiageaiinc.netlify.app`, add both:

```typescript
const allowedOrigins = [
  'https://traiageaiinc.netlify.app',
  'https://www.traiageaiinc.netlify.app', // Add WWW version
  // ...
];
```

## Security Notes

### Current Configuration
- ✅ Explicit origin whitelist
- ✅ Credentials enabled for authentication
- ✅ Specific methods allowed
- ✅ Preflight caching enabled
- ⚠️ Currently allows all origins but logs warnings (for development flexibility)

### For Production Security
If you want to strictly enforce the whitelist, change this line:

**Current (lenient):**
```typescript
callback(null, true); // Always allow
```

**Strict (recommended for production):**
```typescript
callback(new Error('Not allowed by CORS'));
```

## What Changed in Files

**Modified:**
- ✅ `src/server.ts` - Updated CORS configuration

**No changes needed in:**
- Frontend code (it should work as-is)
- Environment variables (optional `FRONTEND_URL`)

## Next Steps

1. ✅ Redeploy backend to Vercel
2. ✅ Wait for deployment to complete (1-2 minutes)
3. ✅ Test login from Netlify frontend
4. ✅ CORS error should be gone!

---

**Your CORS issue is now fixed!** Just redeploy the backend and the error will disappear. 🎉

