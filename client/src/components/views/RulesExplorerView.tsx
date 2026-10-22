import React, { useState, useMemo } from 'react';
import { RULE_REGISTRY } from '../../../../shared/rules';
import { RuleProfile, RuleImplementationStatus, GameRule } from '../../../../shared/types';
import { BookOpen, Search, ExternalLink, CheckCircle2, AlertTriangle, FileText, ArrowLeft, Shield } from 'lucide-react';

interface RulesExplorerViewProps {
  onBack: () => void;
}

export const RulesExplorerView: React.FC<RulesExplorerViewProps> = ({ onBack }) => {
  const [selectedProfile, setSelectedProfile] = useState<RuleProfile | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<RuleImplementationStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRule, setSelectedRule] = useState<GameRule | null>(RULE_REGISTRY[0]);

  const filteredRules = useMemo(() => {
    return RULE_REGISTRY.filter((rule) => {
      const matchProfile = selectedProfile === 'ALL' || rule.ruleSet === selectedProfile;
      const matchStatus = statusFilter === 'ALL' || rule.implementationStatus === statusFilter;
      const query = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        rule.title.toLowerCase().includes(query) ||
        rule.description.toLowerCase().includes(query) ||
        rule.ruleId.toLowerCase().includes(query) ||
        rule.sourceSection.toLowerCase().includes(query);

      return matchProfile && matchStatus && matchQuery;
    });
  }, [selectedProfile, statusFilter, searchQuery]);

  const getStatusBadge = (status: RuleImplementationStatus) => {
    switch (status) {
      case 'IMPLEMENTED_AND_TESTED':
        return (
          <span className="neo-badge bg-[#CCFF00] text-[#121212]">
            <CheckCircle2 className="w-3 h-3 mr-1 inline" />
            Implemented & Tested
          </span>
        );
      case 'PARTIALLY_SIMULATED':
        return (
          <span className="neo-badge bg-[#FFD027] text-[#121212]">
            <AlertTriangle className="w-3 h-3 mr-1 inline" />
            Partially Simulated
          </span>
        );
      case 'DOCUMENTED_ONLY':
        return (
          <span className="neo-badge bg-[#E4DCFF] text-[#121212]">
            <FileText className="w-3 h-3 mr-1 inline" />
            Documented Only
          </span>
        );
      case 'NOT_IMPLEMENTED':
        return (
          <span className="neo-badge bg-gray-200 text-[#121212]">
            Not Implemented
          </span>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#FAF6EB] text-[#121212] font-sans overflow-hidden">
      {/* Top Header Bar */}
      <header className="px-6 py-4 border-b-[2.5px] border-[#121212] bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="neo-btn neo-btn-white px-3 py-1.5 text-xs font-mono uppercase"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-[#121212]" />
            <h1 className="text-2xl font-black font-display tracking-tight uppercase">
              Rules & Regulatory Explorer
            </h1>
          </div>
        </div>

        {/* Traceability Badge */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="neo-badge bg-[#E4DCFF]">
            ITTF Statutes 2026 Reference (§2 Laws of Table Tennis)
          </span>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Rules List & Filters */}
        <div className="w-1/2 border-r-[2.5px] border-[#121212] flex flex-col bg-[#FAF6EB]">
          {/* Filter Controls */}
          <div className="p-4 border-b-[2.5px] border-[#121212] bg-white space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search rule ID, title, ITTF section..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border-[2px] border-[#121212] bg-[#FAF6EB] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#CCFF00]"
              />
            </div>

            {/* Profile & Status Switchers */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Profile Toggle */}
              <div className="flex items-center space-x-1">
                {(['ALL', 'TABLE_TENNIS_TRAINING', 'ARCADE_PONG'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedProfile(p)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold border-[2px] border-[#121212] transition-all ${
                      selectedProfile === p
                        ? 'bg-[#121212] text-white shadow-[2px_2px_0px_#121212]'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {p === 'ALL' ? 'All Profiles' : p === 'TABLE_TENNIS_TRAINING' ? 'ITTF 2026' : 'Arcade Pong'}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2 py-1 border-[2px] border-[#121212] font-mono text-xs bg-white focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="IMPLEMENTED_AND_TESTED">Implemented & Tested</option>
                <option value="PARTIALLY_SIMULATED">Partially Simulated</option>
                <option value="DOCUMENTED_ONLY">Documented Only</option>
              </select>
            </div>
          </div>

          {/* Rules List Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredRules.map((rule) => {
              const isSelected = selectedRule?.ruleId === rule.ruleId;
              return (
                <div
                  key={rule.ruleId}
                  onClick={() => setSelectedRule(rule)}
                  className={`p-3.5 border-[2px] border-[#121212] cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#CCFF00] shadow-[4px_4px_0px_#121212] translate-x-1'
                      : 'bg-white hover:bg-[#F3EFE0] shadow-[2px_2px_0px_#121212]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-black text-white">
                      {rule.ruleId}
                    </span>
                    {getStatusBadge(rule.implementationStatus)}
                  </div>
                  <h3 className="font-display font-bold text-base text-[#121212]">
                    {rule.title}
                  </h3>
                  <p className="text-xs text-gray-700 line-clamp-2 mt-1">
                    {rule.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-gray-600">
                    <span>{rule.sourceSection}</span>
                    <span className="uppercase">{rule.ruleSet}</span>
                  </div>
                </div>
              );
            })}

            {filteredRules.length === 0 && (
              <div className="p-8 text-center font-mono text-sm text-gray-600 border-[2px] border-dashed border-[#121212]">
                No rules matched your search or filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="w-1/2 p-6 overflow-y-auto bg-white flex flex-col justify-between">
          {selectedRule ? (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="neo-box p-5 bg-[#FAF6EB]">
                <div className="flex items-center justify-between mb-2">
                  <span className="neo-badge bg-[#121212] text-white">
                    {selectedRule.ruleId}
                  </span>
                  {getStatusBadge(selectedRule.implementationStatus)}
                </div>
                <h2 className="text-2xl font-black font-display text-[#121212]">
                  {selectedRule.title}
                </h2>
                <div className="mt-2 flex items-center space-x-3 text-xs font-mono text-gray-700">
                  <span>Profile: <strong>{selectedRule.ruleSet}</strong></span>
                  <span>•</span>
                  <span>Effective: <strong>{selectedRule.effectiveDate}</strong></span>
                </div>
              </div>

              {/* Regulatory Source Box */}
              <div className="neo-box p-4 bg-[#E4DCFF]">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#121212] mb-1">
                  Official Regulatory Authority & Citation
                </h4>
                <p className="text-sm font-semibold text-[#121212]">
                  {selectedRule.sourceOrganisation} — {selectedRule.sourceDocument}
                </p>
                <p className="text-xs font-mono text-purple-900 mt-1">
                  Section Citation: <strong>{selectedRule.sourceSection}</strong>
                </p>
                {selectedRule.sourceUrl && (
                  <a
                    href={selectedRule.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-mono font-bold text-[#121212] underline mt-2 hover:text-[#6D28D9]"
                  >
                    View Official ITTF Statutes 2026 PDF <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>

              {/* Exact Text */}
              <div className="neo-box p-4 bg-white">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Statute Provision Description
                </h4>
                <p className="text-sm leading-relaxed text-[#121212]">
                  {selectedRule.description}
                </p>
              </div>

              {/* Simulation Limitations */}
              <div className="neo-box p-4 bg-[#FFB347]/20 border-[#FF7A59]">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#FF7A59] mb-1 flex items-center">
                  <Shield className="w-3.5 h-3.5 mr-1" /> Simulation Scope & Known Limitations
                </h4>
                <p className="text-xs leading-relaxed text-[#121212]">
                  {selectedRule.limitations}
                </p>
              </div>

              {/* Automated Tests Linked */}
              <div className="neo-box p-4 bg-[#CCFF00]/15">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-green-900 mb-1">
                  Automated Unit Tests
                </h4>
                {selectedRule.tests.length > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {selectedRule.tests.map((t) => (
                      <span key={t} className="neo-badge bg-white text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-gray-600 italic">
                    Not testable in software simulation (Documented physical inspection standard).
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 font-mono">
              Select a rule from the left column to view its regulatory traceability.
            </div>
          )}

          {/* Official Disclaimer Footer */}
          <div className="mt-8 p-3 border-[2px] border-dashed border-[#121212] bg-[#FAF6EB] text-center text-[11px] font-mono text-gray-600">
            PONG AI is an educational 3D game simulation. It does not provide official umpiring,
            formal equipment certification, or legal ITTF competition compliance.
          </div>
        </div>
      </div>
    </div>
  );
};
