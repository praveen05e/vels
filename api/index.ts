import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

// Import routes
import authRoutes from './routes/auth.js';
import foodRoutes from './routes/food.js';
import demandRoutes from './routes/demand.js';
import allocationRoutes from './routes/allocation.js';
import deliveryRoutes from './routes/delivery.js';
import simulationRoutes from './routes/simulation.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';
import offlineRoutes from './routes/offline.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: process.env.VITE_APP_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Supabase admin client (service role for server operations)
export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key'
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/demand', demandRoutes);
app.use('/api/allocation', allocationRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/offline', offlineRoutes);

// Health check
app.get('/api/health', (req, res) => { res.json({ status: 'ok', timestamp: new Date().toISOString() }); });

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err.message);
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
}
