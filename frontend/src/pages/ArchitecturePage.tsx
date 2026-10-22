import React, { useState, useEffect } from 'react';
import { RefreshCw, Terminal, ExternalLink } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-[3px] border-[#111111]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="mint">Architecture Explorer</Badge>
            <span className="font-mono text-xs font-bold text-[#525252]">
              Graphify Schema v1 · {graphData?.nodes?.length || 1441} AST Nodes · {graphData?.links?.length || 2698} Edges
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tight text-[#111111]">
            Codebase Architecture Explorer
          </h1>
          <p className="text-sm sm:text-base text-[#525252] font-medium max-w-2xl">
            Inspecting real abstract syntax tree (AST) relationships extracted directly from source code via Graphify alongside the connected modular system map.
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

      {/* Tab Panels */}
      {loading ? (
        <Card variant="cream" className="py-16 text-center space-y-3 font-mono text-xs">
          <div className="w-8 h-8 border-4 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="font-bold text-[#111111]">Loading codebase architecture & Graphify knowledge graph...</div>
        </Card>
      ) : activeTab === 'modular' ? (
        <ModularSystemGraph />
      ) : activeTab === 'ast' && graphData ? (
        <GraphifyViewer graphData={graphData} />
      ) : (
        /* Report Markdown Viewer */
        <Card variant="white" className="p-6 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-neo">
          {report || 'No report found.'}
        </Card>
      )}

      {/* Graphify CLI guide */}
      <Card variant="cream" className="p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b-[2px] border-[#111111]">
          <span className="font-display font-black uppercase text-[#111111]">
            Graphify CLI Workflow & Shortcuts
          </span>
          <Terminal className="w-4 h-4 text-[#111111]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-2.5 bg-[#FFFFFF] border-[1.5px] border-[#111111] rounded-xl">
            <span className="text-[#737373] text-[10px] block"># 1. Incremental AST Update:</span>
            <div className="text-[#111111] font-bold mt-1">graphify update .</div>
          </div>
          <div className="p-2.5 bg-[#FFFFFF] border-[1.5px] border-[#111111] rounded-xl">
            <span className="text-[#737373] text-[10px] block"># 2. Semantic Query:</span>
            <div className="text-[#111111] font-bold mt-1">graphify query "table tennis physics"</div>
          </div>
          <div className="p-2.5 bg-[#FFFFFF] border-[1.5px] border-[#111111] rounded-xl">
            <span className="text-[#737373] text-[10px] block"># 3. Shortest Relationship Path:</span>
            <div className="text-[#111111] font-bold mt-1">graphify path "GestureController" "Engine"</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
