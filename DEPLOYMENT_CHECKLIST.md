# Vercel Deployment Checklist ✅

## Before Deploying

- [ ] **MongoDB Atlas is configured**
  - Database is accessible from anywhere (IP: `0.0.0.0/0`)
  - Database user has proper permissions
  - Connection string is ready

- [ ] **Environment variables are ready**
  - `MONGODB_URI` (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)
  - `JWT_SECRET` (strong random string)
  - `NODE_ENV` (set to `production`)
  - `FRONTEND_URL` (optional, your frontend domain for CORS)

- [ ] **Code is ready**
  - All changes are committed
  - Code builds successfully: `npm run build`
  - Tests pass (if applicable)

## Deployment Steps

### Option 1: Deploy from Git (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Sign in with your account

3. **Import Repository**
   - Click "Import Project"
   - Select your Git repository
   - Select the `backend` folder (or root if backend is in root)

4. **Configure Project**
   - Framework Preset: **Other**
   - Root Directory: `backend` (if applicable)
   - Build Command: `npm run build`
   - Output Directory: Leave empty
   - Install Command: `npm install`

5. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add each variable:
     ```
     MONGODB_URI = mongodb+srv://...
     JWT_SECRET = your-secret-key-here
     NODE_ENV = production
     FRONTEND_URL = https://your-frontend-domain.com (optional)
     ```

6. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note your deployment URL

### Option 2: Deploy via CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd backend
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add NODE_ENV
   vercel env add FRONTEND_URL  # Optional
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## After Deployment

- [ ] **Test Health Check**
  ```bash
  curl https://your-app.vercel.app/health
  ```
  Should return: `{"success": true, "message": "Server is running"}`

- [ ] **Test API Endpoints**
  - Visit: `https://your-app.vercel.app/`
  - Should see API information

- [ ] **Check API Documentation**
  - Visit: `https://your-app.vercel.app/api-docs`
  - Swagger UI should load

- [ ] **Test Authentication**
  ```bash
  curl -X POST https://your-app.vercel.app/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"your-password"}'
  ```

- [ ] **Update Frontend**
  - Update `frontend/src/services/api.ts`
  - Change `baseURL` to your Vercel backend URL
  - Redeploy frontend

## Troubleshooting

### If deployment fails:

1. **Check Build Logs**
   - Go to Vercel Dashboard → Your Deployment
   - Click "View Build Logs"
   - Look for error messages

2. **Common Issues:**

   **"Cannot find module"**
   - Ensure all imports use correct paths
   - Check `package.json` has all dependencies
   - Try: `npm install && npm run build` locally

   **"MongoDB connection failed"**
   - Verify `MONGODB_URI` environment variable
   - Check MongoDB Atlas IP whitelist
   - Test connection string locally

   **"Serverless Function crashed"**
   - Check Function Logs in Vercel Dashboard
   - Verify all environment variables are set
   - Look for uncaught errors in logs

3. **View Logs**
   ```bash
   vercel logs [deployment-url]
   ```

4. **Redeploy**
   ```bash
   vercel --prod --force
   ```

## MongoDB Atlas Setup

If you haven't set up MongoDB Atlas:

1. Go to: https://cloud.mongodb.com
2. Create a cluster (free tier is fine for testing)
3. Create a database user:
   - Database Access → Add New Database User
   - Username and password authentication
   - Grant read/write access

4. Whitelist all IPs:
   - Network Access → Add IP Address
   - Enter: `0.0.0.0/0`
   - Description: "Vercel"

5. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `salary-management`)

## Environment Variable Format

```env
# Example values - Replace with your actual values
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/salary-management?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
FRONTEND_URL=https://your-frontend.netlify.app  # Optional - your frontend domain
```

## Success Indicators

✅ Build completed successfully
✅ Deployment shows "Ready"
✅ `/health` endpoint returns 200 OK
✅ `/` endpoint shows API info
✅ `/api-docs` loads Swagger UI
✅ Can login via `/api/auth/login`
✅ No errors in Function Logs

## Quick Commands Reference

```bash
# Build locally
npm run build

# Run locally
npm run dev

# Deploy to Vercel (preview)
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Open dashboard
vercel dashboard
```

## Support Resources

- **Detailed Guide**: See `VERCEL_DEPLOYMENT.md`
- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support

---

**Estimated Deployment Time**: 3-5 minutes

Once deployed, your backend will be accessible at:
`https://your-project-name.vercel.app`

Good luck with your deployment! 🚀

