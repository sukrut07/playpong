import React, { useState, useMemo } from 'react';
import { Search, Filter, Layers, Box, Cpu, ExternalLink, Code } from 'lucide-react';
import { GraphifyData, GraphifyNode } from '../../services/graphify-service';
import { Button } from '../ui/Button';

export interface GraphifyViewerProps {
  graphData: GraphifyData;
}

export const GraphifyViewer: React.FC<GraphifyViewerProps> = ({ graphData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<GraphifyNode | null>(null);

  const communities = useMemo(() => {
    if (!graphData?.nodes) return [];
    const set = new Set<string>();
    for (const n of graphData.nodes) {
      if (n.community_name) set.add(n.community_name);
    }
    return Array.from(set).sort();
  }, [graphData]);

  const filteredNodes = useMemo(() => {
    if (!graphData?.nodes) return [];
    return graphData.nodes.filter((node) => {
      const matchCommunity = selectedCommunity === 'ALL' || node.community_name === selectedCommunity;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        node.label.toLowerCase().includes(q) ||
        (node.source_file && node.source_file.toLowerCase().includes(q));
      return matchCommunity && matchSearch;
    });
  }, [graphData, selectedCommunity, searchQuery]);

  const selectedConnections = useMemo(() => {
    if (!graphData?.links || !selectedNode) return { incoming: [], outgoing: [] };
    const outgoing = graphData.links.filter((l) => l.source === selectedNode.id);
    const incoming = graphData.links.filter((l) => l.target === selectedNode.id);
    return { incoming, outgoing };
  }, [graphData, selectedNode]);

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            placeholder="Search AST symbols (e.g. TableTennisEngine, OneEuroFilter, rules)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#62F5AD] shadow-neo-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#737373]" />
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="px-3 py-2.5 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl font-display font-bold text-xs uppercase shadow-neo-sm focus:outline-none"
          >
            <option value="ALL">All Communities ({communities.length})</option>
            {communities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left List + Right Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node List */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border-[3px] border-[#111111] rounded-2xl shadow-neo p-4 max-h-[560px] overflow-y-auto space-y-2">
          <div className="flex items-center justify-between pb-2 border-b-[2px] border-[#111111]/20 text-xs font-mono text-[#525252]">
            <span>Showing {filteredNodes.length} symbols</span>
            <span>Total Graph: {graphData?.nodes?.length || 0} nodes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {filteredNodes.slice(0, 60).map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3 border-[2px] border-[#111111] rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#62F5AD] shadow-neo translate-x-0.5 translate-y-0.5'
                      : 'bg-[#FFFDF6] hover:bg-[#FFFFFF] shadow-neo-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-black text-xs text-[#111111] truncate">
                      {node.label}
                    </span>
                    <span className="px-1.5 py-0.2 bg-[#FFFFFF] border-[1px] border-[#111111] rounded font-mono text-[9px]">
                      C{node.community}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-[#737373] truncate">
                    {node.source_file || 'unknown source'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Inspector */}
        <div className="bg-[#FFFDF6] border-[3px] border-[#111111] rounded-2xl shadow-neo p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#111111]">
            <span className="font-display font-black text-sm uppercase text-[#111111]">
              Symbol Inspector
            </span>
            <Code className="w-4 h-4 text-[#111111]" />
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-[#737373] uppercase">Symbol Name</span>
                <div className="font-display font-black text-xl text-[#111111]">
                  {selectedNode.label}
                </div>
              </div>

              <div className="space-y-1 font-mono">
                <div className="text-[10px] text-[#737373] uppercase">Source File</div>
                <div className="p-2 bg-[#FFFFFF] border-[1.5px] border-[#111111] rounded-lg break-all text-[11px]">
                  {selectedNode.source_file}
                  {selectedNode.source_location && (
                    <span className="ml-1 text-[#62F5AD] font-bold">
                      :{selectedNode.source_location}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2 bg-[#FFFFFF] border-[1.5px] border-[#111111] rounded-lg">
                  <div className="text-[9px] text-[#737373] uppercase">Cluster</div>
                  <div className="font-bold text-[#111111] truncate">
                    {selectedNode.community_name || `Community ${selectedNode.community}`}
                  </div>
                </div>
                <div className="p-2 bg-[#FFFFFF] border-[1.5px] border-[#111111] rounded-lg">
                  <div className="text-[9px] text-[#737373] uppercase">Type</div>
                  <div className="font-bold text-[#111111]">
                    {selectedNode.file_type || 'code'}
                  </div>
                </div>
              </div>

              {/* Edge Relationships */}
              <div className="space-y-2 pt-2 border-t-[1.5px] border-[#111111]/20">
                <div className="font-display font-black text-xs uppercase text-[#111111]">
                  Relationships ({selectedConnections.incoming.length + selectedConnections.outgoing.length})
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {selectedConnections.outgoing.map((out, idx) => (
                    <div
                      key={`out_${idx}`}
                      className="p-1.5 bg-[#FFFFFF] border-[1px] border-[#111111] rounded text-[10px] font-mono flex items-center justify-between"
                    >
                      <span className="text-[#525252]">➔ {out.relation}</span>
                      <span className="font-bold text-[#111111] truncate max-w-[120px]">{out.target}</span>
                    </div>
                  ))}
                  {selectedConnections.incoming.map((inc, idx) => (
                    <div
                      key={`inc_${idx}`}
                      className="p-1.5 bg-[#FFFFFF] border-[1px] border-[#111111] rounded text-[10px] font-mono flex items-center justify-between"
                    >
                      <span className="text-[#525252]">⬅ {inc.relation}</span>
                      <span className="font-bold text-[#111111] truncate max-w-[120px]">{inc.source}</span>
                    </div>
                  ))}
                  {selectedConnections.incoming.length === 0 && selectedConnections.outgoing.length === 0 && (
                    <div className="text-[11px] text-[#737373] italic">No local edges recorded.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#737373] font-mono">
              Select any symbol to inspect its AST relationships and community cluster.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
