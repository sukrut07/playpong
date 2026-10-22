"""
Pydantic contracts and schemas for the PONG AI Orchestrator.
Matches shared TypeScript interfaces for strict cross-language interoperability.
"""

from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator


class TableZoneDistribution(BaseModel):
    model_config = {"populate_by_name": True}

    left: int = 0
    center: int = 0
    right: int = 0
    deep: int = 0
    short: int = 0


class MatchStats(BaseModel):
    model_config = {"populate_by_name": True}

    matchId: str = Field(..., alias="match_id", description="Unique match identifier")
    startTime: float = Field(default=0.0, alias="start_time")
    endTime: Optional[float] = Field(default=None, alias="end_time")
    ruleProfile: str = Field(default="TABLE_TENNIS_TRAINING", alias="rule_profile")
    playerScore: int = Field(default=0, ge=0, alias="player_score")
    opponentScore: int = Field(default=0, ge=0, alias="opponent_score")
    totalReturns: int = Field(default=0, ge=0, alias="total_returns")
    successfulReturns: int = Field(default=0, ge=0, alias="successful_returns")
    missedReturns: int = Field(default=0, ge=0, alias="missed_returns")
    eligibleReturnAttempts: int = Field(default=0, ge=0, alias="eligible_return_attempts")
    returnSuccessRate: Optional[float] = Field(default=None, alias="return_success_rate")
    missRate: Optional[float] = Field(default=None, alias="miss_rate")
    longestRally: int = Field(default=0, ge=0, alias="longest_rally")
    totalRallies: int = Field(default=0, ge=0, alias="total_rallies")
    averageRallyLength: Optional[float] = Field(default=None, alias="average_rally_length")
    medianRallyLength: Optional[float] = Field(default=None, alias="median_rally_length")
    averageReactionTimeMs: Optional[float] = Field(default=None, alias="average_reaction_time_ms")
    reactionTimeSamples: List[float] = Field(default_factory=list, alias="reaction_time_samples")
    tableZoneDistribution: TableZoneDistribution = Field(default_factory=TableZoneDistribution, alias="table_zone_distribution")
    trackingStabilityPercentage: float = Field(default=0.0, ge=0.0, le=100.0, alias="tracking_stability_percentage")
    trackingAvailabilityPercentage: Optional[float] = Field(default=None, alias="tracking_availability_percentage")
    missionsCompleted: int = Field(default=0, ge=0, alias="missions_completed")
    difficulty: str = Field(default="medium")
    controllerMode: str = Field(default="gesture", alias="controller_mode")
    assisted: Optional[bool] = False

    @field_validator("matchId")
    @classmethod
    def validate_match_id(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("matchId must not be empty")
        return v.strip()


class CoachingObservation(BaseModel):
    title: str
    description: str
    metricName: Optional[str] = None
    metricValue: Optional[Union[str, float, int]] = None
    evidenceQuality: Optional[str] = "VERIFIED_TELEMETRY"


class CoachingEvidence(BaseModel):
    metric: str
    observedValue: Union[str, float, int]
    expectedBenchmark: str
    significance: str


class CoachingWeakness(BaseModel):
    issue: str
    likelyCause: str
    isHypothesis: bool = True


class TrainingPlanDrill(BaseModel):
    drillTitle: str
    targetMetric: str
    targetGoal: str
    instructions: str
    durationGuidance: Optional[str] = "3-5 minutes"


class RuleReferenceLink(BaseModel):
    ruleId: str
    title: str
    citation: str
    explanation: str
    sourceUrl: Optional[str] = None


class ProviderInfo(BaseModel):
    provider: str = "ollama"
    model: str
    inferenceTimeMs: float
    routingReason: Optional[str] = None


class CoachingReport(BaseModel):
    match_id: str
    model_id: str
    summary: str
    observations: List[CoachingObservation] = Field(default_factory=list)
    evidence: List[CoachingEvidence] = Field(default_factory=list)
    weaknesses: List[CoachingWeakness] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    training_plan: List[TrainingPlanDrill] = Field(default_factory=list)
    next_match_objective: str = ""
    rule_references: List[RuleReferenceLink] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    evidence_status: str = "VERIFIED"
    providerInfo: Optional[ProviderInfo] = None


class MatchCoachRequest(BaseModel):
    match_id: Optional[str] = None
    stats: MatchStats
    model_override: Optional[str] = None


class AnalyticsQueryRequest(BaseModel):
    question: str
    currentMatch: MatchStats
    history: Optional[List[MatchStats]] = None
    model_override: Optional[str] = None


class RuleExplainRequest(BaseModel):
    rule_id: Optional[str] = None
    question: Optional[str] = None
    rule_profile: Optional[str] = "TABLE_TENNIS_TRAINING"
    model_override: Optional[str] = None


class ControllerEvaluationRequest(BaseModel):
    benchmark_id: Optional[str] = None
    controller_a: Dict[str, Any]
    controller_b: Dict[str, Any]
    notes: Optional[str] = None
    model_override: Optional[str] = None


class HealthResponse(BaseModel):
    status: str  # "ok" | "degraded"
    process_running: bool = True
    ollama_reachable: bool = False
    models_installed: Dict[str, bool] = Field(default_factory=dict)
    active_model: str
    policy: str
    timestamp: float
