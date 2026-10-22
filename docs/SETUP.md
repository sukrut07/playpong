# Setup & Running Guide — Gesture Pong AI

## Prerequisites
Ensure the following tools are installed on your machine:
- **Node.js**: v18+ (tested on Node v24.13.0)
- **npm**: v9+ (tested on npm 11.6.2)
- **Python**: 3.10+ & `uv` (for Graphify workflow)
- **Ollama**: Installed and running locally
- **Gemma 4 model**: `gemma4:e2b` installed in Ollama

---

## 1. Verify Ollama & Gemma 4

Ensure the Ollama daemon is running:
```bash
ollama --version
ollama list
```
Verify that `gemma4:e2b` is listed. If missing, download it via:
```bash
ollama run gemma4:e2b
```

Test HTTP API reachability:
```bash
curl -s http://localhost:11434/api/tags
```

---

## 2. Installation

Clone or open the repository root:
```bash
cd "/Users/sukrutdusane/Documents/Projects /Sy/pong"
npm install
npm install --prefix server
npm install --prefix client
```

---

## 3. Running the Application

To launch both the backend coach API and the frontend 3D game concurrently:
```bash
npm run dev
```

The services will start at:
- **Client (Game & Vision)**: `http://localhost:5173`
- **Server (Coach API)**: `http://localhost:3001`
- **Ollama**: `http://localhost:11434`

Open `http://localhost:5173` in Google Chrome or any Chromium-based browser with webcam support.

---

## 4. Testing

Run all automated unit and integration test suites:
```bash
npm run test
```
To run individually:
- Backend: `npm run test --prefix server`
- Frontend: `npm run test --prefix client`

---

## 5. Production Build

Build production bundles:
```bash
npm run build
```
Preview the client bundle:
```bash
npm run preview --prefix client
```

---

## 6. Graphify Repository Intelligence

Generate/update the codebase dependency graph:
```bash
graphify extract . --code-only
```
Query the architecture:
```bash
graphify query "hand tracking racket movement"
graphify path "VisionPipeline" "TableTennisEngine" --undirected
```
View the visual interactive graph:
Open `graphify-out/graph.html` in your browser.
