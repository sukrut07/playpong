import React, { useState, useEffect } from 'react';
import { Network, FileText, Layers, GitBranch, Terminal, RefreshCw, Cpu, Box, CheckCircle2 } from 'lucide-react';
import { GraphifyViewer } from '../components/architecture/GraphifyViewer';
import { ModularSystemGraph } from '../components/architecture/ModularSystemGraph';
import { graphifyService, GraphifyData } from '../services/graphify-service';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export interface ArchitecturePageProps {
  onNavigate: (path: string) => void;
}

export const ArchitecturePage: React.FC<ArchitecturePageProps> = ({ onNavigate }) => {
  const [graphData, setGraphData] = useState<GraphifyData | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'modular' | 'ast' | 'report'>('modular');

  const loadData = async () => {
    setLoading(true);
    try {
      const [gData, rText] = await Promise.all([
        graphifyService.fetchGraph(),
        graphifyService.fetchReport(),
      ]);
      setGraphData(gData);
      setReport(rText);
    } catch (err) {
      console.warn('[ArchitecturePage] Failed to fetch graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-[3px] border-[#111111]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="mint">Graphify AST</Badge>
            <span className="font-mono text-xs font-bold text-[#525252]">
              Schema v1 · {graphData?.nodes?.length || 990} Nodes · {graphData?.links?.length || 1817} Edges
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tight text-[#111111]">
            Codebase Architecture Explorer
          </h1>
          <p className="text-sm sm:text-base text-[#525252] font-medium max-w-2xl">
            Inspecting real abstract syntax tree (AST) relationships extracted directly from source code via Graphify.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="white" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Reload Graph
          </Button>
          <Button variant="mint" size="sm" onClick={() => onNavigate('/play')}>
            Play Arena ↗
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-[2px] border-[#111111]">
        <button
          onClick={() => setActiveTab('modular')}
          className={`px-4 py-2.5 font-display font-black text-xs uppercase tracking-wider border-b-[3px] -mb-[2.5px] transition-all ${
            activeTab === 'modular'
              ? 'border-[#111111] text-[#111111] bg-[#FFFFFF] rounded-t-xl'
              : 'border-transparent text-[#737373] hover:text-[#111111]'
          }`}
        >
          System Architecture (Connected Graph)
        </button>
        <button
          onClick={() => setActiveTab('ast')}
          className={`px-4 py-2.5 font-display font-black text-xs uppercase tracking-wider border-b-[3px] -mb-[2.5px] transition-all ${
            activeTab === 'ast'
              ? 'border-[#111111] text-[#111111] bg-[#FFFFFF] rounded-t-xl'
              : 'border-transparent text-[#737373] hover:text-[#111111]'
          }`}
        >
          Graphify AST Graph ({graphData?.nodes?.length || 1441} Nodes)
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2.5 font-display font-black text-xs uppercase tracking-wider border-b-[3px] -mb-[2.5px] transition-all ${
            activeTab === 'report'
              ? 'border-[#111111] text-[#111111] bg-[#FFFFFF] rounded-t-xl'
              : 'border-transparent text-[#737373] hover:text-[#111111]'
          }`}
        >
          Graphify Report (Markdown)
        </button>
      </div>

      {loading ? (
        <Card variant="cream" className="py-16 text-center space-y-3 font-mono text-xs">
          <div className="w-8 h-8 border-4 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="font-bold text-[#111111]">Loading codebase architecture & Graphify knowledge graph...</div>
        </Card>
      ) : activeTab === 'modular' ? (
        <ModularSystemGraph />
      ) : activeTab === 'ast' && graphData ? (
        <GraphifyViewer graphData={graphData} />
        /* Conceptual System Overview */
        <div className="space-y-6">
          <Card variant="cream" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-[2px] border-[#111111]">
              <span className="font-display font-black text-sm uppercase text-[#111111]">
                System Architecture & Module Boundaries
              </span>
              <span className="text-xs font-mono text-[#737373]">
                Conceptual separation of concerns
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#62F5AD]" />
                  <span className="font-display font-black text-xs uppercase text-[#111111]">
                    frontend/
                  </span>
                </div>
                <p className="text-xs text-[#525252]">
                  Dedicated browser application. Handles presentation, React 19 UI, Three.js 3D arena canvas, MediaPipe HandLandmarker, and typed API clients.
                </p>
              </div>

              <div className="p-4 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#D9FF55]" />
                  <span className="font-display font-black text-xs uppercase text-[#111111]">
                    game-engine/
                  </span>
                </div>
                <p className="text-xs text-[#525252]">
                  Pure deterministic table tennis physics simulation (120Hz sub-stepping), continuous collision detection, ITTF 2026 rules, and metric contracts.
                </p>
              </div>

              <div className="p-4 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#BDA5FF]" />
                  <span className="font-display font-black text-xs uppercase text-[#111111]">
                    server/
                  </span>
                </div>
                <p className="text-xs text-[#525252]">
                  Express.js & Socket.IO backend on port 3001. Handles room codes, authoritative multiplayer synchronization, and bridges to AI services.
                </p>
              </div>

              <div className="p-4 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#111111]" />
                  <span className="font-display font-black text-xs uppercase text-[#111111]">
                    services/ai-orchestrator/
                  </span>
                </div>
                <p className="text-xs text-[#525252]">
                  Python FastAPI service on port 8000. Houses the 11-stage LangGraph workflow and LangChain ChatOllama adapter routing between Gemma 4 models.
                </p>
              </div>

              <div className="p-4 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FFB84D]" />
                  <span className="font-display font-black text-xs uppercase text-[#111111]">
                    ml/ & models/
                  </span>
                </div>
                <p className="text-xs text-[#525252]">
                  Offline temporal gesture classifier training, sliding-window feature extraction, model manifests, and empirical evaluation benchmark suites.
                </p>
              </div>

              <div className="p-4 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5555]" />
                  <span className="font-display font-black text-xs uppercase text-[#111111]">
                    data/rules/
                  </span>
                </div>
                <p className="text-xs text-[#525252]">
                  Official ITTF Statutes 2026 ingested rule definitions (§2.1 to §2.15) and structured conflict resolution records.
                </p>
              </div>
            </div>
          </Card>

          {/* Graphify CLI guide */}
          <Card variant="white" className="p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b-[2px] border-[#111111]">
              <span className="font-display font-black uppercase text-[#111111]">
                Graphify CLI Workflow
              </span>
              <Terminal className="w-4 h-4 text-[#111111]" />
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-[#FFFDF6] border-[1px] border-[#111111] rounded">
                <span className="text-[#737373]"># 1. Update AST Code Graph (zero API cost):</span>
                <div className="text-[#111111] font-bold">graphify update .</div>
              </div>
              <div className="p-2 bg-[#FFFDF6] border-[1px] border-[#111111] rounded">
                <span className="text-[#737373]"># 2. Query code knowledge graph:</span>
                <div className="text-[#111111] font-bold">graphify query "how does hand tracking connect to physics"</div>
              </div>
              <div className="p-2 bg-[#FFFDF6] border-[1px] border-[#111111] rounded">
                <span className="text-[#737373]"># 3. Shortest dependency path:</span>
                <div className="text-[#111111] font-bold">graphify path "GestureController" "TableTennisEngine"</div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Report Markdown Viewer */
        <Card variant="white" className="p-6 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {report || 'No report found.'}
        </Card>
      )}
    </div>
  );
};
