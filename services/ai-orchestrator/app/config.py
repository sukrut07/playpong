"""
Configuration module for the PONG AI Orchestrator service.
"""

from enum import Enum
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class ModelRoutingPolicy(str, Enum):
    AUTO_BY_TASK = "AUTO_BY_TASK"
    E2B_ONLY = "E2B_ONLY"
    E4B_ONLY = "E4B_ONLY"
    ON_DEMAND = "ON_DEMAND"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ollama_base_url: str = Field(default="http://localhost:11434", alias="OLLAMA_BASE_URL")
    fast_model: str = Field(default="gemma4:e2b", alias="OLLAMA_FAST_MODEL")
    coach_model: str = Field(default="gemma4:e4b", alias="OLLAMA_COACH_MODEL")
    model_routing_policy: ModelRoutingPolicy = Field(
        default=ModelRoutingPolicy.AUTO_BY_TASK, alias="MODEL_ROUTING_POLICY"
    )

    ai_request_timeout_seconds: float = Field(default=90.0, alias="AI_REQUEST_TIMEOUT_SECONDS")
    ai_max_retries: int = Field(default=1, alias="AI_MAX_RETRIES")
    max_graph_steps: int = Field(default=12, alias="MAX_GRAPH_STEPS")

    ai_enable_tracing: bool = Field(default=False, alias="AI_ENABLE_TRACING")
    ai_host: str = Field(default="0.0.0.0", alias="AI_HOST")
    ai_port: int = Field(default=8000, alias="AI_PORT")


settings = Settings()
