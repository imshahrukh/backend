# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Your MongoDB database should be accessible from anywhere (IP whitelist: `0.0.0.0/0`)
3. **Environment Variables**: Have your production environment variables ready

## Step-by-Step Deployment

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Configure Environment Variables on Vercel

Go to your Vercel project settings and add these environment variables:

**Required:**
- `MONGODB_URI` - Your MongoDB connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/salary-management`)
- `JWT_SECRET` - Your JWT secret key (use a strong random string)
- `NODE_ENV` - Set to `production`

**Optional:**
- `PORT` - Not needed for Vercel (automatically handled)

### 3. Deploy via Vercel Dashboard

#### Option A: Deploy from Git (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Add environment variables in the project settings
6. Click "Deploy"

#### Option B: Deploy via CLI

```bash
# Navigate to backend directory
cd backend

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 4. Configure MongoDB Atlas

Ensure your MongoDB Atlas cluster allows connections from Vercel:

1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (allows all IPs)
   - **Note**: For better security, you can whitelist specific Vercel IPs
3. Ensure your database user has proper read/write permissions

### 5. Test Your Deployment

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-app.vercel.app/health

# API info
curl https://your-app.vercel.app/

# API docs
https://your-app.vercel.app/api-docs
```

## Configuration Files Explained

### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
```

- `builds`: Tells Vercel to build the TypeScript file using `@vercel/node`
- `routes`: Routes all requests to the server.ts file

### Serverless Optimizations

The codebase has been optimized for serverless:

1. **Connection Caching**: MongoDB connections are cached and reused across function invocations
2. **No process.exit()**: Removed calls that would crash serverless functions
3. **Conditional Server Start**: Server only starts in local development, not on Vercel

## Common Issues and Solutions

### Issue 1: "Serverless Function has crashed"

**Cause**: Usually due to environment variables not set or MongoDB connection issues

**Solution**:
1. Check all environment variables are set in Vercel dashboard
2. Verify MongoDB connection string is correct
3. Ensure MongoDB Atlas allows connections from `0.0.0.0/0`
4. Check deployment logs in Vercel dashboard

### Issue 2: "Cannot connect to MongoDB"

**Cause**: MongoDB Atlas IP whitelist or connection string issues

**Solution**:
1. Add `0.0.0.0/0` to MongoDB Atlas IP whitelist
2. Verify connection string format: `mongodb+srv://...`
3. Check database user credentials
4. Ensure database user has proper permissions

### Issue 3: "Module not found" errors

**Cause**: Missing dependencies or build issues

**Solution**:
1. Ensure all dependencies are in `package.json` (not devDependencies if needed at runtime)
2. Clear Vercel build cache and redeploy
3. Check TypeScript compilation: `npm run build`

### Issue 4: Cold Start Timeout

**Cause**: First request after inactivity takes longer

**Solution**:
- This is normal for serverless (cold starts)
- Connection caching helps minimize impact
- Consider upgrading Vercel plan for better performance
- Use keep-alive pings for critical applications

### Issue 5: "Request Timeout"

**Cause**: Vercel has a 10-second execution limit (Hobby plan)

**Solution**:
1. Optimize slow database queries
2. Add proper indexes to MongoDB collections
3. Consider upgrading to Pro plan (60-second limit)
4. Break down large operations into smaller chunks

## Performance Tips

1. **Database Indexes**: Ensure all frequently queried fields have indexes
2. **Connection Reuse**: The code already implements connection caching
3. **Query Optimization**: Use MongoDB aggregation pipelines efficiently
4. **Environment**: Set `NODE_ENV=production` for better performance
5. **Regions**: Deploy to regions close to your MongoDB Atlas cluster

## Monitoring and Logs

### View Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on a deployment
3. Click "View Function Logs" to see real-time logs

### Monitor Performance

1. Vercel Dashboard shows:
   - Request count
   - Response time
   - Error rate
   - Bandwidth usage

## Rollback

If deployment fails:

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

Or use Vercel Dashboard:
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

## Domain Configuration

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS according to Vercel's instructions

### Frontend Connection

Update your frontend's API base URL to point to:
```
https://your-backend.vercel.app
```

## Security Checklist

- ✅ JWT_SECRET is strong and unique
- ✅ MongoDB connection uses authentication
- ✅ CORS is properly configured
- ✅ Environment variables are not in code
- ✅ `.env` is in `.gitignore`
- ✅ API rate limiting enabled (if applicable)

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Discord**: https://vercel.com/discord
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com

## Troubleshooting Commands

```bash
# Test build locally
npm run build

# Check TypeScript errors
npm run build

# Test production build locally
npm start

# View Vercel logs
vercel logs [deployment-url]
```

## Next Steps After Deployment

1. **Test all API endpoints** with your production URL
2. **Update frontend** to use new backend URL
3. **Set up monitoring** for errors and performance
4. **Enable Vercel Analytics** for insights
5. **Configure custom domain** (optional)
6. **Set up CI/CD** for automatic deployments on git push

Your backend is now deployed on Vercel! 🎉

