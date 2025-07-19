# Render.com Deployment Configuration for Config Ninja

## Deployment Method Options

### Option 1: Using render.yaml (Recommended)
The project includes a `render.yaml` file for automatic configuration.

### Option 2: Manual Configuration

## Step-by-Step Deployment Instructions

### 1. Prepare Your Repository
```bash
# Ensure all files are committed
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up or log in
3. Connect your GitHub account

### 3. Deploy with render.yaml (Automatic)
1. Click "New +"
2. Select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` configuration
5. Click "Apply"

### 4. Manual Web Service Configuration (Alternative)
If not using render.yaml:

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: config-ninja
   - **Region**: Oregon (US West)
   - **Branch**: main
   - **Root Directory**: (leave blank)
   - **Runtime**: Node
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start:prod`

### 5. Environment Variables
Set these in Render Dashboard:
- `NODE_ENV`: production
- `PORT`: (leave blank - Render will auto-assign)

### 6. Advanced Settings
- **Auto-Deploy**: Yes (deploys on git push)
- **Health Check Path**: `/health`

## Build Configuration Details

### Node.js Version
The app requires Node.js >= 18.0.0 (specified in package.json engines)

### Build Process
1. `npm ci` - Clean install dependencies
2. `npm run build` - Vite builds React app to /dist
3. `npm run start:prod` - Starts Express server

### Server Configuration
- **Port**: Uses Render's PORT environment variable (fallback: 8002)
- **Static Files**: Serves React build from /dist
- **API Routes**: /api/* endpoints
- **Health Check**: GET /health
- **SPA Support**: React Router history mode

## Troubleshooting

### Common Issues
1. **Build Fails**: Check Node.js version compatibility
2. **App Won't Start**: Verify start:prod script exists
3. **Static Files 404**: Ensure dist folder is built correctly
4. **API Routes Fail**: Check server/index.js configuration

### Debug Commands
```bash
# Test build locally
npm run build

# Test production server locally
npm run start:prod

# Check build output
ls -la dist/
```

### Logs Access
- Go to Render Dashboard
- Select your service
- Click "Logs" tab for real-time debugging

## Performance Optimization

### Free Tier Limitations
- Service sleeps after 15 min of inactivity
- 750 hours/month free usage
- Slower cold starts

### Optimization Tips
- Enable health checks to keep service warm
- Consider upgrading to paid plan for production
- Use CDN for static assets if needed

## Security Configuration

### CORS
Already configured in server for cross-origin requests

### Environment
- NODE_ENV set to production
- Debug logs disabled in production

## Custom Domain (Optional)
1. Go to Settings → Custom Domains
2. Add your domain
3. Configure DNS records as shown

## Monitoring
- Use Render's built-in metrics
- Monitor via /health endpoint
- Set up alerts for downtime

Your Config Ninja app will be available at: `https://config-ninja.onrender.com`
