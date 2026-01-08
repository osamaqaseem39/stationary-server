import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import { ensureDatabaseConnection } from './config/database';
import mongoose from 'mongoose';

const app: Express = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check with database status
app.get('/health', async (req: Request, res: Response) => {
  try {
    const connection = mongoose.connection;
    const readyState = connection.readyState;
    const readyStateNames: { [key: number]: string } = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    // Try to ensure database connection
    let dbStatus = 'unknown';
    let dbDetails: any = null;

    try {
      await ensureDatabaseConnection();
      dbStatus = 'connected';
      
      const dbName = connection.db?.databaseName;
      const host = connection.host;
      const port = connection.port;
      
      dbDetails = {
        database: dbName || 'N/A',
        host: host || 'N/A',
        port: port || 'N/A',
        readyState: readyStateNames[readyState] || 'unknown',
        readyStateCode: readyState
      };

      // Try to get collection count
      try {
        const collections = await connection.db?.listCollections().toArray();
        dbDetails.collections = collections?.length || 0;
      } catch (error) {
        // Ignore collection listing errors
      }
    } catch (error) {
      dbStatus = 'disconnected';
      dbDetails = {
        error: (error as Error).message,
        readyState: readyStateNames[readyState] || 'unknown',
        readyStateCode: readyState
      };
    }

    const healthStatus = dbStatus === 'connected' ? 'healthy' : 'degraded';
    const statusCode = dbStatus === 'connected' ? 200 : 503;

    res.status(statusCode).json({
      status: healthStatus,
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        ...dbDetails
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: (error as Error).message
    });
  }
});

// Ensure database connection before handling API requests (important for serverless)
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureDatabaseConnection();
    next();
  } catch (error) {
    console.error('Database connection error in middleware:', error);
    res.status(503).json({ error: 'Database connection failed' });
  }
});

// API Routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import productRoutes from './modules/products/product.routes';
import productVariantRoutes from './modules/products/productVariant.routes';
import categoryRoutes from './modules/categories/category.routes';
import brandRoutes from './modules/brands/brand.routes';
import orderRoutes from './modules/orders/order.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import uploadRoutes from './modules/upload/upload.routes';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/variants', productVariantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

