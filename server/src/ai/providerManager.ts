// =====================================================================
// PONG AI — AI Provider Manager & Fallback Engine
// =====================================================================

import { AICoachProvider, ProviderHealth } from './provider.js';
import { GeminiGemmaAdapter } from './geminiAdapter.js';
import { OllamaGemmaAdapter } from './ollamaAdapter.js';
import { CoachingReport, MatchStats, GameRule } from '../../../shared/types.js';
import { formatMetricPercentage, formatMetricNumber } from '../../../shared/metrics.js';
import { RULE_REGISTRY } from '../../../shared/rules.js';

export class AIProviderManager {
  private activeProvider: AICoachProvider;
  private geminiAdapter: GeminiGemmaAdapter;
  private ollamaAdapter: OllamaGemmaAdapter;

  constructor() {
    this.geminiAdapter = new GeminiGemmaAdapter();
    this.ollamaAdapter = new OllamaGemmaAdapter();

    const preferred = process.env.AI_PROVIDER || 'gemini';
    this.activeProvider = preferred === 'ollama' ? this.ollamaAdapter : this.geminiAdapter;
  }

  public setProvider(type: 'gemini' | 'ollama'): void {
    this.activeProvider = type === 'ollama' ? this.ollamaAdapter : this.geminiAdapter;
  }

  public getActiveProvider(): AICoachProvider {
    return this.activeProvider;
  }

  public async getHealth(): Promise<ProviderHealth> {
    return this.activeProvider.checkHealth();
  }

  public async generateReport(stats: MatchStats): Promise<CoachingReport> {
    try {
      return await this.activeProvider.generateCoachingReport(stats);
    } catch (err: any) {
      console.warn(`[AIProviderManager] Provider ${this.activeProvider.name} failed: ${err.message}. Engaging deterministic fallback engine.`);
      return this.generateDeterministicFallbackReport(stats, err.message);
    }
  }

  public async askQuestion(question: string, stats: MatchStats, history?: MatchStats[]): Promise<string> {
    try {
      return await this.activeProvider.askAnalyticsQuestion(question, stats, history);
    } catch (err: any) {
      return `Telemetry Analysis: During match ${stats.matchId}, your return success rate was ${formatMetricPercentage(stats.returnSuccessRate)} with ${stats.successfulReturns} successful returns out of ${stats.eligibleReturnAttempts} attempts. Longest rally reached ${stats.longestRally} returns. (Note: Live AI assistant unavailable: ${err.message})`;
    }
  }

  /**
   * Deterministic fallback coaching generator:
   * Generates an honest, strictly grounded report based on real telemetry numbers and ITTF rules.
   */
  public generateDeterministicFallbackReport(stats: MatchStats, reason: string): CoachingReport {
    const returnRate = stats.returnSuccessRate ?? 50;
    const isWinner = stats.playerScore > stats.opponentScore;
    const applicableRule = RULE_REGISTRY.find((r) => r.ruleSet === stats.ruleProfile) || RULE_REGISTRY[0];

    const observations = [
      {
        title: isWinner ? 'Winning Court Control' : 'Return Consistency Pressure',
        description: `Player finished with a ${returnRate.toFixed(1)}% return success rate across ${stats.eligibleReturnAttempts} eligible balls.`,
        metricName: 'Return Success Rate',
        metricValue: `${returnRate.toFixed(1)}%`,
      },
      {
        title: 'Rally Exchange Depth',
        description: `Completed ${stats.totalRallies} rallies with a peak streak of ${stats.longestRally} returns and average rally length of ${formatMetricNumber(stats.averageRallyLength, ' returns')}.`,
        metricName: 'Average Rally Length',
        metricValue: formatMetricNumber(stats.averageRallyLength),
      },
      {
        title: 'Table Placement Distribution',
        description: `Balls landed primarily in the ${stats.tableZoneDistribution.center > stats.tableZoneDistribution.left ? 'center' : 'lateral'} zones (Left: ${stats.tableZoneDistribution.left}, Center: ${stats.tableZoneDistribution.center}, Right: ${stats.tableZoneDistribution.right}).`,
        metricName: 'Zone Distribution',
        metricValue: `L:${stats.tableZoneDistribution.left} C:${stats.tableZoneDistribution.center} R:${stats.tableZoneDistribution.right}`,
      },
    ];

    const evidence = [
      {
        metric: 'Return Success Rate',
        observedValue: `${returnRate.toFixed(1)}%`,
        expectedBenchmark: '> 75.0% for balanced match progression',
        significance: 'Primary indicator of defensive stability and paddle-ball contact accuracy.',
      },
      {
        metric: 'Miss Rate',
        observedValue: formatMetricPercentage(stats.missRate),
        expectedBenchmark: '< 25.0%',
        significance: 'Quantifies frequency of unforced errors or mistimed paddle interceptions.',
      },
    ];

    const weaknesses = [
      {
        issue: returnRate < 70 ? 'Defensive Interception Timing' : 'Lateral Placement Spread',
        likelyCause: returnRate < 70 ? 'High ball velocity approaching paddle perimeter' : 'Central clustering of paddle returns',
        isHypothesis: true,
      },
    ];

    const recommendations = [
      'Focus on centering your paddle before the ball crosses the net plane.',
      'Utilize OneEuroFilter smoothing calibration in Gesture Lab to eliminate hand micro-tremors.',
    ];

    const training_plan = [
      {
        drillTitle: 'Continuous Return Rhythm',
        targetMetric: 'Return Success Rate',
        targetGoal: 'Reach 80% over 20 attempts',
        instructions: 'Practice in Arcade mode focusing on smooth horizontal paddle deflections without over-reaching.',
      },
    ];

    const rule_references = [
      {
        ruleId: applicableRule.ruleId,
        title: applicableRule.title,
        citation: `${applicableRule.sourceSection} ${applicableRule.sourceDocument}`,
        explanation: applicableRule.description,
      },
    ];

    return {
      summary: `Match concluded with ${isWinner ? 'player victory' : 'opponent victory'} (${stats.playerScore} - ${stats.opponentScore}). Telemetry indicates a ${returnRate.toFixed(1)}% return success rate across ${stats.totalRallies} completed rallies.`,
      observations,
      evidence,
      weaknesses,
      recommendations,
      training_plan,
      next_match_objective: 'Maintain an 80%+ return success rate on 15+ consecutive rallies.',
      rule_references,
      limitations: [
        `Live Gemma 4 inference offline (${reason}). Report calculated via deterministic rules & metrics engine.`,
        'MediaPipe webcam tracking is 2D planar and does not capture 3D racket rubber friction or ball spin.',
      ],
      providerInfo: {
        provider: this.activeProvider.name,
        model: this.activeProvider.modelId,
        inferenceTimeMs: 0,
      },
    };
  }
}

export const aiProviderManager = new AIProviderManager();
