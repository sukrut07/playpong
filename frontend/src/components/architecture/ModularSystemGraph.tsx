import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Layers,
  ArrowRight,
  ExternalLink,
  Code2,
  FileCode,
  Info,
  CheckCircle2,
  Move,
  Minimize2,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export type SystemLayer =
  | 'frontend'
  | 'vision'
  | 'engine'
  | 'backend'
  | 'orchestrator'
  | 'runtime';

export interface SystemNode {
  id: string;
  label: string;
  layer: SystemLayer;
  filePath: string;
  symbolType: 'component' | 'engine' | 'service' | 'pipeline' | 'model' | 'contract';
  description: string;
  defaultCol: number;
  defaultRow: number;
}

export interface SystemEdge {
  id: string;
  source: string;
  target: string;
  relationship: 'renders' | 'streams_to' | 'controls' | 'emits_to' | 'persists_in' | 'bridges' | 'orchestrates' | 'executes' | 'cites';
  label: string;
}

export const SYSTEM_NODES: SystemNode[] = [
  // Column 0: Frontend User Interfaces
  {
    id: 'play_ui',
    label: 'Play UI / Arena',
    layer: 'frontend',
    filePath: 'frontend/src/pages/GamePage.tsx',
    symbolType: 'component',
    description: '3D game arena viewport, pause controls, and live score HUD.',
    defaultCol: 0,
    defaultRow: 0,
  },
  {
    id: 'gesture_lab_ui',
    label: 'Gesture Lab',
    layer: 'frontend',
    filePath: 'frontend/src/pages/GestureLabPage.tsx',
    symbolType: 'component',
    description: 'Dedicated testing sandbox for real camera tracking & synthetic dry-run.',
    defaultCol: 0,
    defaultRow: 1,
  },
  {
    id: 'dashboard_ui',
    label: 'Match Dashboard',
    layer: 'frontend',
    filePath: 'frontend/src/pages/DashboardPage.tsx',
    symbolType: 'component',
    description: 'Actual match telemetry: rally timeline, return rate, reaction latency & court zones.',
    defaultCol: 0,
    defaultRow: 2,
  },
  {
    id: 'coach_ui',
    label: 'AI Coach UI',
    layer: 'frontend',
    filePath: 'frontend/src/pages/CoachPage.tsx',
    symbolType: 'component',
    description: 'Tactical analysis, ITTF rule evidence, and interactive Gemma 4 chat panel.',
    defaultCol: 0,
    defaultRow: 3,
  },

  // Column 1: Vision Pipeline & Controllers
  {
    id: 'mediapipe_landmarker',
    label: 'MediaPipe Landmarker',
    layer: 'vision',
    filePath: 'frontend/src/features/gesture/mediapipe-adapter.ts',
    symbolType: 'pipeline',
    description: 'On-device browser WebAssembly hand tracking generating 21 3D landmarks.',
    defaultCol: 1,
    defaultRow: 0,
  },
  {
    id: 'smoothing_filter',
    label: '1€ + EMA Filter',
    layer: 'vision',
    filePath: 'frontend/src/features/gesture/smoothing.ts',
    symbolType: 'pipeline',
    description: 'Adaptive speed-dependent jitter reduction and high-speed lag elimination.',
    defaultCol: 1,
    defaultRow: 1,
  },
  {
    id: 'gesture_controller',
    label: 'Gesture Controller',
    layer: 'vision',
    filePath: 'frontend/src/features/gesture/gesture-controller.ts',
    symbolType: 'pipeline',
    description: 'State machine mapping palm anchor to normalized game space [-1, 1].',
    defaultCol: 1,
    defaultRow: 2,
  },
  {
    id: 'match_storage',
    label: 'Match Storage',
    layer: 'frontend',
    filePath: 'frontend/src/services/storage.ts',
    symbolType: 'service',
    description: 'Client session persistence for verified match telemetry and demo fallback.',
    defaultCol: 1,
    defaultRow: 3,
  },

  // Column 2: Game Engine & Authority
  {
    id: 'table_tennis_engine',
    label: 'TableTennisEngine (120Hz)',
    layer: 'engine',
    filePath: 'game-engine/src/tableTennisEngine.ts',
    symbolType: 'engine',
    description: 'Authoritative deterministic physics simulation with ITTF regulation dimensions.',
    defaultCol: 2,
    defaultRow: 0,
  },
  {
    id: 'computer_opponent',
    label: 'Computer Opponent AI',
    layer: 'engine',
    filePath: 'game-engine/src/tableTennisEngine.ts',
    symbolType: 'engine',
    description: 'Predictive trajectory interception with configurable difficulty curves.',
    defaultCol: 2,
    defaultRow: 1,
  },
  {
    id: 'rule_validator',
    label: 'ITTF Rules Validator',
    layer: 'engine',
    filePath: 'game-engine/src/rules.ts',
    symbolType: 'contract',
    description: 'Automated compliance tests for ITTF Statutes 2026 (§2.1, §2.2, §2.11, §2.13).',
    defaultCol: 2,
    defaultRow: 2,
  },
  {
    id: 'analytics_metrics',
    label: 'Metrics & Rally Log',
    layer: 'engine',
    filePath: 'game-engine/src/metrics.ts',
    symbolType: 'service',
    description: 'Aggregates reaction times, zone hit distributions, and return success rates.',
    defaultCol: 2,
    defaultRow: 3,
  },

  // Column 3: Server & AI Orchestration
  {
    id: 'express_server',
    label: 'Express Backend (3001)',
    layer: 'backend',
    filePath: 'server/src/index.ts',
    symbolType: 'service',
    description: 'Serves Graphify endpoints, health checks, and Socket.IO multiplayer rooms.',
    defaultCol: 3,
    defaultRow: 0,
  },
  {
    id: 'ai_provider_manager',
    label: 'AI Provider Manager',
    layer: 'backend',
    filePath: 'server/src/ai/providerManager.ts',
    symbolType: 'service',
    description: 'Manages routing between local LangGraph orchestrator and deterministic fallback.',
    defaultCol: 3,
    defaultRow: 1,
  },
  {
    id: 'langgraph_orchestrator',
    label: 'LangGraph Orchestrator',
    layer: 'orchestrator',
    filePath: 'services/ai-orchestrator/app/main.py',
    symbolType: 'service',
    description: 'State graph validating match evidence, retrieving rules, and calling models.',
    defaultCol: 3,
    defaultRow: 2,
  },
  {
    id: 'rules_retrieval',
    label: 'Rules Retrieval RAG',
    layer: 'orchestrator',
    filePath: 'shared/rules.ts',
    symbolType: 'contract',
    description: 'Exact ITTF 2026 statutes references retrieved for structured coach claims.',
    defaultCol: 3,
    defaultRow: 3,
  },

  // Column 4: Local Model Runtime
  {
    id: 'ollama_runtime',
    label: 'Ollama Runtime (11434)',
    layer: 'runtime',
    filePath: 'http://localhost:11434',
    symbolType: 'model',
    description: 'Local on-premise model execution host providing low-latency Gemma 4 inference.',
    defaultCol: 4,
    defaultRow: 0,
  },
  {
    id: 'gemma4_e2b',
    label: 'Gemma 4 E2B',
    layer: 'runtime',
    filePath: 'ollama/gemma4:e2b',
    symbolType: 'model',
    description: 'Lightweight model tag optimized for rapid match summaries and quick chat replies.',
    defaultCol: 4,
    defaultRow: 1,
  },
  {
    id: 'gemma4_e4b',
    label: 'Gemma 4 E4B',
    layer: 'runtime',
    filePath: 'ollama/gemma4:e4b',
    symbolType: 'model',
    description: 'High-capacity tactical coaching model for deep stroke & footwork drills.',
    defaultCol: 4,
    defaultRow: 2,
  },
  {
    id: 'graphify_graph',
    label: 'Graphify Code Graph',
    layer: 'backend',
    filePath: 'graphify-out/graph.json',
    symbolType: 'pipeline',
    description: 'AST codebase relationship map with 1,538 nodes, 2,875 edges, and 104 clusters.',
    defaultCol: 4,
    defaultRow: 3,
  },
];

export const SYSTEM_EDGES: SystemEdge[] = [
  // UI to Vision & Engine
  { id: 'e1', source: 'play_ui', target: 'mediapipe_landmarker', relationship: 'streams_to', label: 'Webcam Stream' },
  { id: 'e2', source: 'gesture_lab_ui', target: 'mediapipe_landmarker', relationship: 'streams_to', label: 'Camera Stream' },
  { id: 'e3', source: 'mediapipe_landmarker', target: 'smoothing_filter', relationship: 'streams_to', label: '21 Landmarks' },
  { id: 'e4', source: 'smoothing_filter', target: 'gesture_controller', relationship: 'streams_to', label: 'Filtered Points' },
  { id: 'e5', source: 'gesture_controller', target: 'table_tennis_engine', relationship: 'controls', label: 'Paddle X/Y [-1, 1]' },
  { id: 'e6', source: 'computer_opponent', target: 'table_tennis_engine', relationship: 'controls', label: 'Opponent Paddle' },

  // Engine to Events & Storage
  { id: 'e7', source: 'table_tennis_engine', target: 'rule_validator', relationship: 'cites', label: 'Table & Ball State' },
  { id: 'e8', source: 'table_tennis_engine', target: 'analytics_metrics', relationship: 'emits_to', label: 'Match Events' },
  { id: 'e9', source: 'analytics_metrics', target: 'match_storage', relationship: 'persists_in', label: 'MatchStats' },
  { id: 'e10', source: 'match_storage', target: 'dashboard_ui', relationship: 'renders', label: 'Telemetry Records' },

  // Telemetry to AI Coach & Backend
  { id: 'e11', source: 'match_storage', target: 'coach_ui', relationship: 'renders', label: 'Target Match' },
  { id: 'e12', source: 'coach_ui', target: 'express_server', relationship: 'bridges', label: '/api/coach/report' },
  { id: 'e13', source: 'express_server', target: 'ai_provider_manager', relationship: 'orchestrates', label: 'Route Match' },
  { id: 'e14', source: 'ai_provider_manager', target: 'langgraph_orchestrator', relationship: 'bridges', label: 'POST /v1/coach' },
  { id: 'e15', source: 'langgraph_orchestrator', target: 'rules_retrieval', relationship: 'cites', label: 'Query Statutes' },

  // LangGraph to Ollama
  { id: 'e16', source: 'langgraph_orchestrator', target: 'ollama_runtime', relationship: 'executes', label: 'Gemma 4 Prompt' },
  { id: 'e17', source: 'ollama_runtime', target: 'gemma4_e2b', relationship: 'executes', label: 'E2B Summary' },
  { id: 'e18', source: 'ollama_runtime', target: 'gemma4_e4b', relationship: 'executes', label: 'E4B Tactical' },

  // Graphify
  { id: 'e19', source: 'express_server', target: 'graphify_graph', relationship: 'persists_in', label: '/api/graph' },
];

export const LAYER_COLORS: Record<SystemLayer, { bg: string; text: string; label: string; border: string }> = {
  frontend: { bg: '#62F5AD', text: '#111111', label: 'Frontend UI (Mint)', border: '#111111' },
  vision: { bg: '#D9FF55', text: '#111111', label: 'Computer Vision (Lime)', border: '#111111' },
  engine: { bg: '#BDA5FF', text: '#111111', label: 'Game Engine (Lavender)', border: '#111111' },
  backend: { bg: '#80D8FF', text: '#111111', label: 'Backend Server (Light Blue)', border: '#111111' },
  orchestrator: { bg: '#FFB380', text: '#111111', label: 'AI Orchestration (Peach)', border: '#111111' },
  runtime: { bg: '#E0E0E0', text: '#111111', label: 'Model Runtime (Grey)', border: '#111111' },
};

const NODE_WIDTH = 184;
const NODE_HEIGHT = 72;
const BASE_COL_GAP = 224;
const BASE_ROW_GAP = 124;
const START_X = 50;
const START_Y = 50;

function computeDefaultPositions(): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  for (const node of SYSTEM_NODES) {
    positions[node.id] = {
      x: START_X + node.defaultCol * BASE_COL_GAP,
      y: START_Y + node.defaultRow * BASE_ROW_GAP,
    };
  }
  return positions;
}

export const ModularSystemGraph: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedLayer, setSelectedLayer] = useState<SystemLayer | null>(null);
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(SYSTEM_NODES[0]);
  const [selectedEdge, setSelectedEdge] = useState<SystemEdge | null>(null);
  const [zoom, setZoom] = useState(0.72);
  const [pan, setPan] = useState({ x: 20, y: 15 });
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(computeDefaultPositions);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingCanvasRef = useRef(false);
  const canvasDragStartRef = useRef({ x: 0, y: 0 });
  const draggingNodeRef = useRef<{ id: string; startClientX: number; startClientY: number; startNodeX: number; startNodeY: number } | null>(null);

  // Auto-fit graph on mount
  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth <= 0 || clientHeight <= 0) return;

    // Total default diagram width = START_X + 4 * BASE_COL_GAP + NODE_WIDTH + 50 = 50 + 896 + 184 + 50 = 1180
    // Total default diagram height = START_Y + 3 * BASE_ROW_GAP + NODE_HEIGHT + 50 = 50 + 372 + 72 + 50 = 544
    const diagramW = 1180;
    const diagramH = 544;

    const scaleX = (clientWidth - 40) / diagramW;
    const scaleY = (clientHeight - 40) / diagramH;
    const optimalZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.52), 1.05);

    const centeredX = Math.max(15, (clientWidth - diagramW * optimalZoom) / 2);
    const centeredY = Math.max(15, (clientHeight - diagramH * optimalZoom) / 2);

    setZoom(optimalZoom);
    setPan({ x: centeredX, y: centeredY });
  }, []);

  useEffect(() => {
    fitToScreen();
    const handleResize = () => fitToScreen();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitToScreen]);

  // Reset to default column layout
  const resetLayout = () => {
    setNodePositions(computeDefaultPositions());
    fitToScreen();
  };

  // Node filtering by search & layer
  const filteredNodeIds = useMemo(() => {
    const q = search.trim().toLowerCase();
    const set = new Set<string>();
    for (const n of SYSTEM_NODES) {
      const matchSearch =
        !q ||
        n.label.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.filePath.toLowerCase().includes(q) ||
        n.layer.toLowerCase().includes(q);
      const matchLayer = !selectedLayer || n.layer === selectedLayer;
      if (matchSearch && matchLayer) {
        set.add(n.id);
      }
    }
    return set;
  }, [search, selectedLayer]);

  // Canvas Pan Handlers
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    // Only drag canvas if background clicked
    if ((e.target as HTMLElement).closest('[data-node-id]')) return;
    isDraggingCanvasRef.current = true;
    canvasDragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    // 1. If dragging an individual node
    if (draggingNodeRef.current) {
      const { id, startClientX, startClientY, startNodeX, startNodeY } = draggingNodeRef.current;
      const dx = (e.clientX - startClientX) / zoom;
      const dy = (e.clientY - startClientY) / zoom;
      setNodePositions((prev) => ({
        ...prev,
        [id]: {
          x: Math.round(startNodeX + dx),
          y: Math.round(startNodeY + dy),
        },
      }));
      return;
    }

    // 2. If panning canvas
    if (isDraggingCanvasRef.current) {
      setPan({
        x: e.clientX - canvasDragStartRef.current.x,
        y: e.clientY - canvasDragStartRef.current.y,
      });
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    isDraggingCanvasRef.current = false;
    draggingNodeRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // Node Drag Initiation
  const handleNodePointerDown = (e: React.PointerEvent, node: SystemNode) => {
    e.stopPropagation();
    setSelectedNode(node);
    setSelectedEdge(null);

    const currentPos = nodePositions[node.id] || { x: 0, y: 0 };
    draggingNodeRef.current = {
      id: node.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startNodeX: currentPos.x,
      startNodeY: currentPos.y,
    };
  };

  // Connected edges for the selected node
  const nodeIncoming = selectedNode
    ? SYSTEM_EDGES.filter((e) => e.target === selectedNode.id)
    : [];
  const nodeOutgoing = selectedNode
    ? SYSTEM_EDGES.filter((e) => e.source === selectedNode.id)
    : [];

  return (
    <div className="space-y-4">
      {/* Top Bar: Search, Filters & Viewport Controls */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            placeholder="Search nodes, files, or symbols (e.g. MediaPipe, Engine, Gemma 4)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#62F5AD] shadow-neo-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl p-0.5 shadow-neo-sm">
            <button
              onClick={() => setZoom((z) => Math.min(1.75, +(z + 0.15).toFixed(2)))}
              title="Zoom In"
              className="p-1.5 hover:bg-[#FFFDF6] text-[#111111] rounded-lg transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-[11px] px-2 text-[#525252]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(0.45, +(z - 0.15).toFixed(2)))}
              title="Zoom Out"
              className="p-1.5 hover:bg-[#FFFDF6] text-[#111111] rounded-lg transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          <Button variant="white" size="sm" onClick={fitToScreen} title="Fit Entire Architecture into View">
            <Maximize2 className="w-4 h-4 mr-1 text-[#62F5AD]" />
            Fit All
          </Button>

          <Button variant="white" size="sm" onClick={resetLayout} title="Reset All Node Positions">
            <RotateCcw className="w-4 h-4 mr-1 text-[#BDA5FF]" />
            Reset Layout
          </Button>

          <Button
            variant={isFullWidth ? 'lavender' : 'white'}
            size="sm"
            onClick={() => setIsFullWidth((prev) => !prev)}
            title="Toggle Full Canvas Width"
          >
            {isFullWidth ? <Minimize2 className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {isFullWidth ? 'Split View' : 'Full Canvas'}
          </Button>
        </div>
      </div>

      {/* Interactive Layer Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold">
        <span className="text-[#737373] text-[9.5px] uppercase tracking-wider mr-1">Layer Filter:</span>
        <button
          onClick={() => setSelectedLayer(null)}
          className={`px-2.5 py-1 rounded-lg border-[1.5px] border-[#111111] transition-all ${
            selectedLayer === null
              ? 'bg-[#111111] text-[#FFFFFF] shadow-neo-sm'
              : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#FFFDF6]'
          }`}
        >
          All Layers (20)
        </button>
        {(Object.keys(LAYER_COLORS) as SystemLayer[]).map((layer) => {
          const isActive = selectedLayer === layer;
          return (
            <button
              key={layer}
              onClick={() => setSelectedLayer(isActive ? null : layer)}
              className="flex items-center gap-1.5 px-2.5 py-1 border-[1.5px] border-[#111111] rounded-lg shadow-neo-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
              style={{
                backgroundColor: LAYER_COLORS[layer].bg,
                opacity: selectedLayer && !isActive ? 0.4 : 1,
                borderWidth: isActive ? '2.5px' : '1.5px',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#111111]" />
              <span>{LAYER_COLORS[layer].label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Graph Grid */}
      <div className={`grid gap-6 items-start ${isFullWidth ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
        {/* Interactive SVG Canvas */}
        <div
          ref={containerRef}
          className={`${isFullWidth ? 'w-full' : 'lg:col-span-8'} relative h-[620px] bg-[#FFFDF6] border-[3px] border-[#111111] rounded-2xl shadow-neo overflow-hidden cursor-grab active:cursor-grabbing select-none`}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
        >
          {/* Subtle Dot Grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#111111 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
              transform: `translate(${pan.x % 24}px, ${pan.y % 24}px)`,
            }}
          />

          <svg
            className="w-full h-full block"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              willChange: 'transform',
            }}
          >
            <defs>
              <marker
                id="arrow-default"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#111111" />
              </marker>
              <marker
                id="arrow-active"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#FF5555" />
              </marker>
            </defs>

            {/* Directional Curved Edges */}
            {SYSTEM_EDGES.map((edge) => {
              const srcPos = nodePositions[edge.source];
              const tgtPos = nodePositions[edge.target];
              if (!srcPos || !tgtPos) return null;

              const isEdgeActive =
                selectedEdge?.id === edge.id ||
                selectedNode?.id === edge.source ||
                selectedNode?.id === edge.target;

              const srcMatch = filteredNodeIds.has(edge.source);
              const tgtMatch = filteredNodeIds.has(edge.target);
              const edgeVisible = srcMatch && tgtMatch;

              // Compute clean port coordinates
              // If moving forward (left to right): attach to right edge of source and left edge of target
              const isForward = tgtPos.x >= srcPos.x;
              const x1 = isForward ? srcPos.x + NODE_WIDTH : srcPos.x;
              const y1 = srcPos.y + NODE_HEIGHT / 2;
              const x2 = isForward ? tgtPos.x : tgtPos.x + NODE_WIDTH;
              const y2 = tgtPos.y + NODE_HEIGHT / 2;

              const dx = Math.abs(x2 - x1);
              const curvature = Math.max(45, dx * 0.45);
              const cx1 = isForward ? x1 + curvature : x1 - curvature;
              const cy1 = y1;
              const cx2 = isForward ? x2 - curvature : x2 + curvature;
              const cy2 = y2;

              const pathD = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

              return (
                <g
                  key={edge.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEdge(edge);
                  }}
                  opacity={edgeVisible ? (isEdgeActive ? 1 : 0.6) : 0.12}
                >
                  {/* Invisible wide hit area */}
                  <path d={pathD} fill="none" stroke="transparent" strokeWidth={16} />
                  {/* Edge Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isEdgeActive ? '#111111' : '#11111155'}
                    strokeWidth={isEdgeActive ? 3.5 : 2}
                    strokeDasharray={edge.relationship === 'cites' ? '5 3' : undefined}
                    markerEnd={isEdgeActive ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                  />
                  {/* Floating Edge Label on active edge */}
                  {isEdgeActive && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 8}
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fontSize={9}
                      fill="#111111"
                      className="bg-white px-1"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Draggable Nodes */}
            {SYSTEM_NODES.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isMatch = filteredNodeIds.has(node.id);
              const isSelected = selectedNode?.id === node.id;
              const colors = LAYER_COLORS[node.layer];

              return (
                <g
                  key={node.id}
                  data-node-id={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-grab active:cursor-grabbing select-none"
                  onPointerDown={(e) => handleNodePointerDown(e, node)}
                  opacity={isMatch ? 1 : 0.2}
                >
                  {/* Hard offset black shadow */}
                  <rect
                    x={5}
                    y={5}
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx={14}
                    fill="#111111"
                  />
                  {/* Main Node Card */}
                  <rect
                    x={0}
                    y={0}
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx={14}
                    fill={colors.bg}
                    stroke="#111111"
                    strokeWidth={isSelected ? 3.5 : 2.5}
                  />

                  {/* Header: Node Label */}
                  <text
                    x={12}
                    y={28}
                    fontFamily="Outfit, sans-serif"
                    fontWeight="900"
                    fontSize={11.5}
                    fill="#111111"
                    textAnchor="start"
                  >
                    {node.label}
                  </text>

                  {/* Bottom Row: Symbol Type Badge */}
                  <rect
                    x={12}
                    y={38}
                    width={64}
                    height={18}
                    rx={5}
                    fill="#111111"
                  />
                  <text
                    x={44}
                    y={50.5}
                    fontFamily="monospace"
                    fontWeight="800"
                    fontSize={9}
                    fill="#FFFFFF"
                    textAnchor="middle"
                  >
                    {node.symbolType.toUpperCase()}
                  </text>

                  {/* Layer text badge */}
                  <text
                    x={84}
                    y={51}
                    fontFamily="monospace"
                    fontWeight="700"
                    fontSize={9.5}
                    fill="#111111"
                  >
                    {node.layer}
                  </text>

                  {/* Subtle drag handle grip dots in top right */}
                  <circle cx={NODE_WIDTH - 18} cy={16} r={1.5} fill="#111111" opacity={0.6} />
                  <circle cx={NODE_WIDTH - 12} cy={16} r={1.5} fill="#111111" opacity={0.6} />
                  <circle cx={NODE_WIDTH - 18} cy={22} r={1.5} fill="#111111" opacity={0.6} />
                  <circle cx={NODE_WIDTH - 12} cy={22} r={1.5} fill="#111111" opacity={0.6} />
                </g>
              );
            })}
          </svg>

          {/* Quick HUD Overlay */}
          <div className="absolute top-3 left-3 bg-[#FFFFFF]/95 backdrop-blur-md border-[2px] border-[#111111] px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold text-[#111111] shadow-neo-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#62F5AD] animate-pulse" />
            <span>Interactive System Graph · Drag Canvas to Pan · Drag Any Node to Rearrange</span>
          </div>
        </div>

        {/* Selected Node / Edge Details Drawer */}
        <div className={`${isFullWidth ? 'w-full' : 'lg:col-span-4'} space-y-4`}>
          {selectedNode && (
            <Card variant="white" className="space-y-4 p-5 border-[3px] border-[#111111] shadow-neo">
              <div className="flex items-center justify-between pb-2 border-b-[2px] border-[#111111]/20">
                <Badge variant={selectedNode.layer === 'frontend' ? 'mint' : selectedNode.layer === 'vision' ? 'lime' : 'lavender'}>
                  {selectedNode.layer.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-[#737373]">
                    {selectedNode.symbolType}
                  </span>
                  <Move className="w-3.5 h-3.5 text-[#737373]" />
                </div>
              </div>

              <div>
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#111111]">
                  {selectedNode.label}
                </h3>
                <p className="text-xs text-[#525252] font-medium mt-1 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              {/* Verified Source Path */}
              <div className="p-3 bg-[#FFFDF6] border-[2px] border-[#111111] rounded-xl space-y-1 shadow-neo-sm">
                <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider block">
                  Verified Source Provenance
                </span>
                <span className="font-mono text-xs font-bold text-[#111111] break-all block">
                  {selectedNode.filePath}
                </span>
              </div>

              {/* Connected Streams */}
              <div className="space-y-2 pt-1">
                <span className="font-display font-black text-xs uppercase text-[#111111] block">
                  Module Data Flow & Signals
                </span>

                {nodeIncoming.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-[#737373] uppercase block">
                      Incoming Signals ({nodeIncoming.length})
                    </span>
                    <div className="space-y-1">
                      {nodeIncoming.map((edge) => (
                        <div
                          key={edge.id}
                          className="px-2.5 py-1.5 bg-[#FFFFFF] border-[1.5px] border-[#111111] rounded-lg text-xs font-mono flex items-center justify-between shadow-neo-sm"
                        >
                          <span className="font-bold text-[#111111]">{edge.source}</span>
                          <span className="text-[10px] text-[#737373]">{edge.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {nodeOutgoing.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono text-[#737373] uppercase block">
                      Outgoing Signals ({nodeOutgoing.length})
                    </span>
                    <div className="space-y-1">
                      {nodeOutgoing.map((edge) => (
                        <div
                          key={edge.id}
                          className="px-2.5 py-1.5 bg-[#FFFFFF] border-[1.5px] border-[#111111] rounded-lg text-xs font-mono flex items-center justify-between shadow-neo-sm"
                        >
                          <span className="font-bold text-[#111111]">{edge.target}</span>
                          <span className="text-[10px] text-[#737373]">{edge.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Edge details if edge is selected */}
          {selectedEdge && (
            <Card variant="cream" className="space-y-2 p-4 text-xs font-mono border-[2px] border-[#111111] shadow-neo-sm">
              <span className="font-bold text-[#111111] block uppercase text-[10px]">
                Active Relationship
              </span>
              <div className="flex items-center gap-2 font-bold text-[#111111]">
                <span>{selectedEdge.source}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FF5555]" />
                <span>{selectedEdge.target}</span>
              </div>
              <div className="text-[11px] text-[#525252]">
                Action: <span className="font-bold">{selectedEdge.relationship}</span> ({selectedEdge.label})
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
