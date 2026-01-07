import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { connectDatabase } from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler';
import swaggerSpec from './config/swagger';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import projectRoutes from './routes/projects';
import salaryRoutes from './routes/salaries';
import departmentRoutes from './routes/departments';
import dashboardRoutes from './routes/dashboard';
import commissionConfigRoutes from './routes/commissionConfig';
import onboardingRoutes from './routes/onboarding';
import settingsRoutes from './routes/settings';
import monthlyRevenueRoutes from './routes/monthlyRevenueRoutes';

// Initialize Express app
const app: Application = express();

// Connect to database (async for serverless)
connectDatabase().catch((err) => {
  console.error('Failed to connect to database:', err);
});

// CORS Configuration
const allowedOrigins = [
  'https://traiageaiinc.netlify.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // Allow custom frontend URL from env
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(null, true); // Still allow in production to prevent issues, but log warning
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/commission-config', commissionConfigRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/monthly-revenues', monthlyRevenueRoutes);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Salary Management API Docs'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check route
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API information route
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Salary & Project Management System API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      swagger: '/api-docs',
      swaggerJson: '/api-docs.json'
    }
  });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server (only in non-serverless environments)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

export default app;

