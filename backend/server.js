
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import widgetRoutes from './routes/widgetRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import initializeChatSockets from './sockets/chatSocket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://bulk-chat-application-git-main-nitin-kumar4.vercel.app',
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BulkChat API is running 🚀',
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bulk Chat API is running',
    environment: process.env.NODE_ENV,
  });
});

// Widget test
app.post('/api/widgets/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Widget route is working',
  });
});

// Socket.IO configuration
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

initializeChatSockets(io);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/widgets', widgetRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Allowed CORS origins:', allowedOrigins);
      console.log('Socket.IO server is ready');
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
