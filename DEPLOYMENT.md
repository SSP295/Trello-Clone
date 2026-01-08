# Deployment Guide

## Backend Deployment (Render/Railway/Heroku)

### Environment Variables
Set these in your hosting platform:
- `DATABASE_URL`: Your PostgreSQL connection string
- `PORT`: Usually provided by the platform (default: 5000)
- `NODE_ENV`: `production`

### Build Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

3. **Run Migrations**
   ```bash
   npm run prisma:migrate:deploy
   ```

4. **Seed Database (Optional)**
   ```bash
   npm run prisma:seed
   ```

5. **Start Server**
   ```bash
   npm start
   ```

### Render.com Specific

1. Create a new Web Service
2. Connect your GitHub repository
3. Build Command: `cd server && npm install && npm run prisma:generate && npm run prisma:migrate:deploy`
4. Start Command: `cd server && npm start`
5. Add Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL database URL
   - `NODE_ENV`: `production`

### Railway.app Specific

1. Create a new project
2. Add PostgreSQL service
3. Add Node.js service
4. Set Root Directory to `server`
5. Add Environment Variables:
   - `DATABASE_URL`: Use the PostgreSQL service variable
   - `NODE_ENV`: `production`

## Frontend Deployment (Vercel/Netlify)

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://your-api.railway.app/api`)

### Vercel Deployment

1. **Import Project**
   - Go to Vercel dashboard
   - Import your GitHub repository
   - Set Root Directory to `client`

2. **Configure Build**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Environment Variables**
   - Add `NEXT_PUBLIC_API_URL` with your backend URL

4. **Deploy**
   - Click Deploy

### Netlify Deployment

1. **New Site from Git**
   - Connect your repository
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**
   - Add `NEXT_PUBLIC_API_URL` in Site settings

3. **Deploy**

## Database Setup (Production)

### Option 1: Managed PostgreSQL
- **Render**: Provides PostgreSQL addon
- **Railway**: Includes PostgreSQL service
- **Heroku**: Heroku Postgres addon
- **Supabase**: Free PostgreSQL hosting
- **Neon**: Serverless PostgreSQL

### Option 2: External Database
- Use services like:
  - AWS RDS
  - Google Cloud SQL
  - DigitalOcean Managed Databases

## File Uploads (Production)

For production, consider using cloud storage:

### AWS S3
```javascript
// Update server/routes/cards.js
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// In upload route, upload to S3 instead of local storage
```

### Cloudinary
```javascript
// Install: npm install cloudinary
const cloudinary = require('cloudinary').v2;

// Upload to Cloudinary
const result = await cloudinary.uploader.upload(file.path);
```

## CORS Configuration

If deploying frontend and backend separately, update CORS in `server/server.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database**: Use strong passwords and SSL connections
3. **File Uploads**: Validate file types and sizes
4. **Rate Limiting**: Consider adding rate limiting for production
5. **HTTPS**: Always use HTTPS in production

## Monitoring

Consider adding:
- Error tracking (Sentry)
- Logging (Winston, Pino)
- Analytics (Google Analytics, Mixpanel)
- Uptime monitoring (UptimeRobot, Pingdom)

## Performance Optimization

1. **Database Indexing**: Add indexes for frequently queried fields
2. **Caching**: Implement Redis for caching
3. **CDN**: Use CDN for static assets
4. **Image Optimization**: Optimize images before upload
5. **Database Connection Pooling**: Configure Prisma connection pooling
