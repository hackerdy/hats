import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/user.route.js';
import referralRoutes from './routes/referral.route.js';
import taskRoutes from './routes/task.route.js';
import { authMiddleware } from './middlewares/auth.js';
import path from 'path';
import next from 'next';




const app = express();
const __dirname = path.resolve(); // For absolute path resolution

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Could not connect to MongoDB', error));

const PORT = 5000;

// Next.js setup for SSR
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: path.join(__dirname, './hats-frontend/') }); // Corrected path to hats-frontend
const handle = nextApp.getRequestHandler();

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('Next.js build directory:', path.join(__dirname, './hats-frontend/.next'));



nextApp.prepare().then(() => {
  // API routes
  app.use('/api/user', userRoutes);
  app.use('/api/referral', referralRoutes);
  app.use('/api/task', taskRoutes);

  // Example protected route
  app.post('/api/protected-route', authMiddleware, (req, res) => {
    res.json({ message: 'Protected content' });
  });

  // Test routes
  app.post('/api/test', (req, res) => {
    res.send('Hello World!');
  });

  app.get('/api/test', (req, res) => {
    res.send('Hello World!');
  });

  // Handling all SSR routes using Next.js
  app.all('*', (req, res) => {
    return handle(req, res); // Delegate to Next.js
  });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
