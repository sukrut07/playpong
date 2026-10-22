import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { coachRouter } from './routes/coach.js';
import { setupMultiplayerHandlers } from './realtime/multiplayer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = fs.existsSync(path.resolve(process.cwd(), 'graphify-out'))
  ? process.cwd()
  : (fs.existsSync(path.resolve(__dirname, '../../graphify-out'))
      ? path.resolve(__dirname, '../..')
      : path.resolve(__dirname, '../../..'));

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize Socket.IO with CORS
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupMultiplayerHandlers(io);

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

// Graphify knowledge graph endpoints
app.get('/api/graph', (_req, res) => {
  try {
    const graphPath = path.join(rootDir, 'graphify-out/graph.json');
    if (fs.existsSync(graphPath)) {
      const data = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
      return res.json(data);
    }
    return res.status(404).json({ error: 'Graphify output not yet generated. Run graphify extract .' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/graph/report', (_req, res) => {
  try {
    const reportPath = path.join(rootDir, 'graphify-out/GRAPH_REPORT.md');
    if (fs.existsSync(reportPath)) {
      const report = fs.readFileSync(reportPath, 'utf8');
      return res.type('text/markdown').send(report);
    }
    return res.status(404).send('# No Graph Report Found');
  } catch (err: any) {
    return res.status(500).send(err.message);
  }
});

// Mount Coach routes at /api/coach
app.use('/api/coach', coachRouter);

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`🏓 PONG AI Server listening on http://localhost:${PORT}`);
    console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'gemini'} | Model: ${process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it'}`);
  });
}

const server = httpServer;

export { app, server, io };
