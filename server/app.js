import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
//import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import userRoutes from './routes/userRoutes.js'
import errorHandler from './middleware/errorHandler.js'
import path from 'path';
import { fileURLToPath } from 'url';



//const routes = require('./routes');
//const errorHandler = require('./middleware/errorHandler');
//const logger = require('./utils/logger');

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(helmet());
app.use(cookieParser())
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
}));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Appliquer le rate limiter seulement en production
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100 
  });
  
  app.use('/api', limiter);
}






// Logging
//app.use(morgan('combined', { stream: { write: message => logger.info(message) } }));

// Routes
//app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/user',userRoutes)
//app.use('/api/product', productRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;