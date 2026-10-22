import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { coachRouter } from './routes/coach.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);

app.use(express.json());

// Main health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'gesture-pong-server',
    time: new Date().toISOString(),
  });
});

// Coach routes mounted at /api/coach
app.use('/api/coach', coachRouter);

const server = app.listen(PORT, () => {
  console.log(`🏓 Gesture Pong AI Server listening on http://localhost:${PORT}`);
  console.log(`🤖 Ollama target: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'} with model ${process.env.OLLAMA_MODEL || 'gemma4:e2b'}`);
});

export { app, server };
