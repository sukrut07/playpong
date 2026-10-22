import React, { useState, useMemo, useRef } from 'react';
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
  col: number; // 0 to 4 columns
  row: number; // 0 to 4 rows
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
    col: 0,
    row: 0,
  },
  {
    id: 'gesture_lab_ui',
    label: 'Gesture Lab',
    layer: 'frontend',
    filePath: 'frontend/src/pages/GestureLabPage.tsx',
    symbolType: 'component',
    description: 'Dedicated testing sandbox for real camera tracking & synthetic dry-run.',
    col: 0,
    row: 1,
  },
  {
    id: 'dashboard_ui',
    label: 'Match Dashboard',
    layer: 'frontend',
    filePath: 'frontend/src/pages/DashboardPage.tsx',
    symbolType: 'component',
    description: 'Actual match telemetry: rally timeline, return rate, reaction latency & court zones.',
    col: 0,
    row: 2,
  },
  {
    id: 'coach_ui',
    label: 'AI Coach UI',
    layer: 'frontend',
    filePath: 'frontend/src/pages/CoachPage.tsx',
    symbolType: 'component',
    description: 'Tactical analysis, ITTF rule evidence, and interactive Gemma 4 chat panel.',
    col: 0,
    row: 3,
  },

  // Column 1: Vision Pipeline & Controllers
  {
    id: 'mediapipe_landmarker',
    label: 'MediaPipe Hand Landmarker',
    layer: 'vision',
    filePath: 'frontend/src/features/gesture/mediapipe-adapter.ts',
    symbolType: 'pipeline',
    description: 'On-device browser WebAssembly hand tracking generating 21 3D landmarks.',
    col: 1,
    row: 0,
  },
  {
    id: 'smoothing_filter',
    label: '1€ Filter + EMA Smoother',
    layer: 'vision',
    filePath: 'frontend/src/features/gesture/smoothing.ts',
    symbolType: 'pipeline',
    description: 'Adaptive speed-dependent jitter reduction and high-speed lag elimination.',
    col: 1,
    row: 1,
  },
  {
    id: 'gesture_controller',
    label: 'Gesture Controller',
    layer: 'vision',
    filePath: 'frontend/src/features/gesture/gesture-controller.ts',
    symbolType: 'pipeline',
    description: 'State machine mapping palm anchor to normalized game space [-1, 1].',
    col: 1,
    row: 2,
  },
  {
    id: 'match_storage',
    label: 'Match Storage',
    layer: 'frontend',
    filePath: 'frontend/src/services/storage.ts',
    symbolType: 'service',
    description: 'Client session persistence for verified match telemetry and demo fallback.',
    col: 1,
    row: 3,
  },

  // Column 2: Game Engine & Authority
  {
    id: 'table_tennis_engine',
    label: 'TableTennisEngine (120Hz)',
    layer: 'engine',
    filePath: 'game-engine/src/tableTennisEngine.ts',
    symbolType: 'engine',
    description: 'Authoritative deterministic physics simulation with ITTF regulation dimensions.',
    col: 2,
    row: 0,
  },
  {
    id: 'computer_opponent',
    label: 'Computer Opponent AI',
    layer: 'engine',
    filePath: 'game-engine/src/tableTennisEngine.ts',
    symbolType: 'engine',
    description: 'Predictive trajectory interception with configurable difficulty curves.',
    col: 2,
    row: 1,
  },
  {
    id: 'rule_validator',
    label: 'ITTF Rules Validator',
    layer: 'engine',
    filePath: 'game-engine/src/rules.ts',
    symbolType: 'contract',
    description: 'Automated compliance tests for ITTF Statutes 2026 (§2.1, §2.2, §2.11, §2.13).',
    col: 2,
    row: 2,
  },
  {
    id: 'analytics_metrics',
    label: 'Metrics & Rally Log',
    layer: 'engine',
    filePath: 'game-engine/src/metrics.ts',
    symbolType: 'service',
    description: 'Aggregates reaction times, zone hit distributions, and return success rates.',
    col: 2,
    row: 3,
  },

  // Column 3: Server & AI Orchestration
  {
    id: 'express_server',
    label: 'Express Backend (3001)',
    layer: 'backend',
    filePath: 'server/src/index.ts',
    symbolType: 'service',
    description: 'Serves Graphify endpoints, health checks, and Socket.IO multiplayer rooms.',
    col: 3,
    row: 0,
  },
  {
    id: 'ai_provider_manager',
    label: 'AI Provider Manager',
    layer: 'backend',
    filePath: 'server/src/ai/providerManager.ts',
    symbolType: 'service',
    description: 'Manages routing between local LangGraph orchestrator and deterministic fallback.',
    col: 3,
    row: 1,
  },
  {
    id: 'langgraph_orchestrator',
    label: 'LangGraph Orchestrator (8000)',
    layer: 'orchestrator',
    filePath: 'services/ai-orchestrator/app/main.py',
    symbolType: 'service',
    description: 'State graph validating match evidence, retrieving rules, and calling models.',
    col: 3,
    row: 2,
  },
  {
    id: 'rules_retrieval',
    label: 'Rules Retrieval RAG',
    layer: 'orchestrator',
    filePath: 'shared/rules.ts',
    symbolType: 'contract',
    description: 'Exact ITTF 2026 statutes references retrieved for structured coach claims.',
    col: 3,
    row: 3,
  },

  // Column 4: Local Model Runtime
  {
    id: 'ollama_runtime',
    label: 'Ollama Runtime (11434)',
    layer: 'runtime',
    filePath: 'http://localhost:11434',
    symbolType: 'model',
    description: 'Local on-premise model execution host providing low-latency Gemma 4 inference.',
    col: 4,
    row: 0,
  },
  {
    id: 'gemma4_e2b',
    label: 'Gemma 4 E2B',
    layer: 'runtime',
    filePath: 'ollama/gemma4:e2b',
    symbolType: 'model',
    description: 'Lightweight model tag optimized for rapid match summaries and quick chat replies.',
    col: 4,
    row: 1,
  },
  {
    id: 'gemma4_e4b',
    label: 'Gemma 4 E4B',
    layer: 'runtime',
    filePath: 'ollama/gemma4:e4b',
    symbolType: 'model',
    description: 'High-capacity tactical coaching model for deep stroke & footwork drills.',
    col: 4,
    row: 2,
  },
  {
    id: 'graphify_graph',
    label: 'Graphify Knowledge Graph',
    layer: 'backend',
    filePath: 'graphify-out/graph.json',
    symbolType: 'pipeline',
    description: 'AST codebase relationship map with 1,441 nodes, 2,698 edges, and 106 clusters.',
    col: 4,
    row: 3,
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

export const ModularSystemGraph: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(SYSTEM_NODES[0]);
  const [selectedEdge, setSelectedEdge] = useState<SystemEdge | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Grid layout geometry
  const COL_WIDTH = 220;
  const ROW_HEIGHT = 120;
  const START_X = 60;
  const START_Y = 50;

  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const node of SYSTEM_NODES) {
      map.set(node.id, {
        x: START_X + node.col * COL_WIDTH,
        y: START_Y + node.row * ROW_HEIGHT,
      });
    }
    return map;
  }, []);

  const filteredNodeIds = useMemo(() => {
    if (!search.trim()) return new Set(SYSTEM_NODES.map((n) => n.id));
    const q = search.toLowerCase();
    const set = new Set<string>();
    for (const n of SYSTEM_NODES) {
      if (
        n.label.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.filePath.toLowerCase().includes(q) ||
        n.layer.toLowerCase().includes(q)
      ) {
        set.add(n.id);
      }
    }
    return set;
  }, [search]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const nodeIncoming = selectedNode
    ? SYSTEM_EDGES.filter((e) => e.target === selectedNode.id)
    : [];
  const nodeOutgoing = selectedNode
    ? SYSTEM_EDGES.filter((e) => e.source === selectedNode.id)
    : [];

  return (
    <div className="space-y-4">
      {/* Search, Zoom Controls & Layer Legend */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            placeholder="Search modular graph (e.g. MediaPipe, Engine, Gemma 4, Rules)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#62F5AD] shadow-neo-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="white" size="sm" onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="white" size="sm" onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="white" size="sm" onClick={resetView}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Layer Color Legend */}
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold">
        {(Object.keys(LAYER_COLORS) as SystemLayer[]).map((layer) => (
          <div
            key={layer}
            className="flex items-center gap-1.5 px-2.5 py-1 border-[1.5px] border-[#111111] rounded-lg shadow-neo-sm"
            style={{ backgroundColor: LAYER_COLORS[layer].bg }}
          >
            <span className="w-2 h-2 rounded-full bg-[#111111]" />
            <span>{LAYER_COLORS[layer].label}</span>
          </div>
        ))}
      </div>

      {/* Interactive Graph Canvas + Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Canvas */}
        <div
          className="lg:col-span-2 relative h-[560px] bg-[#FFFDF6] border-[3px] border-[#111111] rounded-2xl shadow-neo overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#111111 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          />

          <svg
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              transition: isDraggingRef.current ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            <defs>
              <marker
                id="arrow"
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

            {/* Connecting Edges */}
            {SYSTEM_EDGES.map((edge) => {
              const srcPos = nodePositions.get(edge.source);
              const tgtPos = nodePositions.get(edge.target);
              if (!srcPos || !tgtPos) return null;

              const isEdgeActive =
                selectedEdge?.id === edge.id ||
                selectedNode?.id === edge.source ||
                selectedNode?.id === edge.target;

              const x1 = srcPos.x + 85;
              const y1 = srcPos.y + 35;
              const x2 = tgtPos.x + 85;
              const y2 = tgtPos.y + 35;

              // Smooth curved bezier curve
              const dx = x2 - x1;
              const dy = y2 - y1;
              const cx1 = x1 + dx * 0.5;
              const cy1 = y1;
              const cx2 = x1 + dx * 0.5;
              const cy2 = y2;

              const pathD = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

              return (
                <g key={edge.id} className="cursor-pointer" onClick={() => setSelectedEdge(edge)}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isEdgeActive ? '#111111' : '#11111140'}
                    strokeWidth={isEdgeActive ? 3 : 1.75}
                    strokeDasharray={edge.relationship === 'cites' ? '4 3' : undefined}
                    markerEnd={isEdgeActive ? 'url(#arrow)' : 'url(#arrow)'}
                  />
                  {/* Invisible wide hit area */}
                  <path d={pathD} fill="none" stroke="transparent" strokeWidth={14} />
                </g>
              );
            })}

            {/* Nodes */}
            {SYSTEM_NODES.map((node) => {
              const pos = nodePositions.get(node.id);
              if (!pos) return null;

              const isMatch = filteredNodeIds.has(node.id);
              const isSelected = selectedNode?.id === node.id;
              const colors = LAYER_COLORS[node.layer];

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                    setSelectedEdge(null);
                  }}
                  opacity={isMatch ? 1 : 0.25}
                >
                  {/* Hard offset shadow */}
                  <rect
                    x={4}
                    y={4}
                    width={170}
                    height={70}
                    rx={12}
                    fill="#111111"
                  />
                  {/* Node Surface */}
                  <rect
                    x={0}
                    y={0}
                    width={170}
                    height={70}
                    rx={12}
                    fill={colors.bg}
                    stroke="#111111"
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Node Label */}
                  <text
                    x={12}
                    y={26}
                    fontFamily="Outfit, sans-serif"
                    fontWeight="900"
                    fontSize={11.5}
                    fill="#111111"
                    textAnchor="start"
                  >
                    {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                  </text>

                  {/* Symbol Type Badge */}
                  <rect
                    x={12}
                    y={36}
                    width={56}
                    height={16}
                    rx={4}
                    fill="#111111"
                  />
                  <text
                    x={40}
                    y={47.5}
                    fontFamily="monospace"
                    fontWeight="700"
                    fontSize={8.5}
                    fill="#FFFFFF"
                    textAnchor="middle"
                  >
                    {node.symbolType.toUpperCase()}
                  </text>

                  {/* Layer indicator */}
                  <text
                    x={76}
                    y={48}
                    fontFamily="monospace"
                    fontWeight="600"
                    fontSize={9}
                    fill="#111111"
                  >
                    {node.layer}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick HUD overlay in corner */}
          <div className="absolute top-3 left-3 bg-[#FFFFFF]/90 backdrop-blur-sm border-[1.5px] border-[#111111] px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-[#525252]">
            <span>Modular System Map · 20 Nodes · 19 Directional Connections</span>
          </div>
        </div>

        {/* Selected Node / Edge Details Drawer */}
        <div className="space-y-4">
          {selectedNode && (
            <Card variant="white" className="space-y-4 p-5">
              <div className="flex items-center justify-between pb-2 border-b-[2px] border-[#111111]/20">
                <Badge variant={selectedNode.layer === 'frontend' ? 'mint' : selectedNode.layer === 'vision' ? 'lime' : 'lavender'}>
                  {selectedNode.layer.toUpperCase()}
                </Badge>
                <span className="font-mono text-xs font-bold text-[#737373]">
                  {selectedNode.symbolType}
                </span>
              </div>

              <div>
                <h3 className="font-display font-black text-xl uppercase text-[#111111]">
                  {selectedNode.label}
                </h3>
                <p className="text-xs text-[#525252] font-medium mt-1">
                  {selectedNode.description}
                </p>
              </div>

              {/* Verified Source Path */}
              <div className="p-2.5 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider block">
                  Source Provenance
                </span>
                <span className="font-mono text-xs font-bold text-[#111111] break-all block">
                  {selectedNode.filePath}
                </span>
              </div>

              {/* Connected Streams */}
              <div className="space-y-2 pt-1">
                <span className="font-display font-black text-xs uppercase text-[#111111] block">
                  Module Data Flow
                </span>

                {nodeIncoming.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#737373] uppercase block">
                      Incoming Inputs ({nodeIncoming.length})
                    </span>
                    <div className="space-y-1">
                      {nodeIncoming.map((edge) => (
                        <div
                          key={edge.id}
                          className="px-2 py-1 bg-[#FFFFFF] border-[1px] border-[#111111] rounded text-[11px] font-mono flex items-center justify-between"
                        >
                          <span className="font-bold text-[#111111]">{edge.source}</span>
                          <span className="text-[10px] text-[#737373]">{edge.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {nodeOutgoing.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono text-[#737373] uppercase block">
                      Outgoing Signals ({nodeOutgoing.length})
                    </span>
                    <div className="space-y-1">
                      {nodeOutgoing.map((edge) => (
                        <div
                          key={edge.id}
                          className="px-2 py-1 bg-[#FFFFFF] border-[1px] border-[#111111] rounded text-[11px] font-mono flex items-center justify-between"
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
            <Card variant="cream" className="space-y-2 p-4 text-xs font-mono">
              <span className="font-bold text-[#111111] block uppercase text-[10px]">
                Selected Relationship
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
