import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import clientsRoutes from './routes/clients';
import sessionsRoutes from './routes/sessions';
import notesRoutes from './routes/notes';
import gradesRoutes from './routes/grades';
import objectivesRoutes from './routes/objectives';
import journalsRoutes from './routes/journals';
import materialsRoutes from './routes/materials';
import statsRoutes from './routes/stats';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/objectives', objectivesRoutes);
app.use('/api/journals', journalsRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║     MediTutor Backend Server         ║
  ║                                       ║
  ║     Server running on port ${PORT}      ║
  ║     Environment: ${process.env.NODE_ENV || 'development'}           ║
  ║                                       ║
  ║     API: http://localhost:${PORT}       ║
  ║     Health: http://localhost:${PORT}/health
  ╚═══════════════════════════════════════╝
  `);
});

export default app;
