// ============================================================
//  server.js — FalconVR API Entry Point
// ============================================================
//
//  This is where the Express app is created and started.
//
//  Express is a minimal Node.js web framework that makes it
//  easy to define API routes (URLs that Unity or the React
//  dashboard can call) and handle HTTP requests/responses.
//
//  On startup, this file:
//    1. Loads environment variables from .env
//    2. Connects to MongoDB
//    3. Registers all API routes
//    4. Starts listening on the configured PORT
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ── Import route files ───────────────────────────────────────
const authRoutes     = require('./routes/auth.routes');
const subjectRoutes  = require('./routes/subject.routes');
const lessonRoutes   = require('./routes/lesson.routes');
const quizRoutes     = require('./routes/quiz.routes');
const resultRoutes   = require('./routes/result.routes');

// ── Connect to database ──────────────────────────────────────
connectDB();

// ── Create Express app ───────────────────────────────────────
const app = express();

// ── Middleware ───────────────────────────────────────────────
//
//  Middleware are functions that run on EVERY request before
//  it reaches your route handler. Think of them as checkpoints.
//
//  cors()           — allows the React dashboard (running on
//                     localhost:5173) to talk to this API
//                     (running on localhost:5000) without
//                     browser security errors.
//
//  express.json()   — parses incoming JSON request bodies so
//                     we can read req.body in our routes.
//
// CORS — allow local dev + the deployed Vercel dashboard URL.
// VITE_DASHBOARD_URL is set in Railway environment variables
// after you deploy the dashboard to Vercel.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.DASHBOARD_URL, // e.g. https://falconvr-dashboard.vercel.app
].filter(Boolean); // removes undefined if env var not set yet

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// ── API Routes ───────────────────────────────────────────────
//
//  All routes are prefixed with /api/v1 — this is good practice
//  so if you ever change the API, you can make /api/v2 without
//  breaking old clients (like the Unity VR app).
//
app.use('/api/v1/auth',     authRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/lessons',  lessonRoutes);
app.use('/api/v1/quizzes',  quizRoutes);
app.use('/api/v1/results',  resultRoutes);

// ── Health check route ───────────────────────────────────────
//  A simple GET / that returns 200 OK — useful to confirm the
//  server is running.
app.get('/', (req, res) => {
  res.json({ message: '🦅 FalconVR API is running', version: '1.0.0' });
});

// ── Global error handler ─────────────────────────────────────
//  If any route throws an error and passes it to next(err),
//  this catches it and returns a clean JSON error response.
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FalconVR API running on http://localhost:${PORT}`);
});
