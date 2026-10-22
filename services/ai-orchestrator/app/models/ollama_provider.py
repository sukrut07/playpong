"""
LangChain Ollama Provider & Task-Based Model Selection Adapter.
Integrates Gemma 4 E2B (fast tasks) and Gemma 4 E4B (deep coaching) with deterministic routing.
"""

import time
import httpx
from typing import Optional, Dict, Any, Tuple
from enum import Enum
from langchain_ollama import ChatOllama
from ..config import settings, ModelRoutingPolicy


class TaskType(str, Enum):
    FAST_SUMMARY = "FAST_SUMMARY"
    INTENT_ROUTING = "INTENT_ROUTING"
    MATCH_COACHING = "MATCH_COACHING"
    ANALYTICS_EXPLANATION = "ANALYTICS_EXPLANATION"
    RULE_EXPLANATION = "RULE_EXPLANATION"
    BENCHMARK_INTERPRETATION = "BENCHMARK_INTERPRETATION"


class OllamaProvider:
    def __init__(self):
        self.base_url = settings.ollama_base_url.rstrip("/")
        self.fast_model = settings.fast_model
        self.coach_model = settings.coach_model
        self.policy = settings.model_routing_policy
        self.timeout = settings.ai_request_timeout_seconds

    async def get_runtime_status(self) -> Dict[str, Any]:
        """
        Queries Ollama runtime version and installed models list.
        """
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                # 1. Check version
                v_res = await client.get(f"{self.base_url}/api/version")
                version = v_res.json().get("version") if v_res.status_code == 200 else "unknown"

                # 2. Check tags
                t_res = await client.get(f"{self.base_url}/api/tags")
                models = t_res.json().get("models", []) if t_res.status_code == 200 else []

                installed_tags = {m.get("model"): m for m in models if "model" in m}
                # Also index by base name (without :latest if applicable)
                for m in models:
                    name = m.get("name", "")
                    if name:
                        installed_tags[name] = m

                e2b_info = installed_tags.get(self.fast_model)
                e4b_info = installed_tags.get(self.coach_model)

                return {
                    "reachable": True,
                    "version": version,
                    "models_installed": {
                        self.fast_model: e2b_info is not None,
                        self.coach_model: e4b_info is not None,
                    },
                    "details": {
                        self.fast_model: {
                            "installed": e2b_info is not None,
                            "size_bytes": e2b_info.get("size") if e2b_info else 0,
                            "digest": e2b_info.get("digest") if e2b_info else None,
                            "format": e2b_info.get("details", {}).get("format") if e2b_info else None,
                        },
                        self.coach_model: {
                            "installed": e4b_info is not None,
                            "size_bytes": e4b_info.get("size") if e4b_info else 0,
                            "digest": e4b_info.get("digest") if e4b_info else None,
                            "format": e4b_info.get("details", {}).get("format") if e4b_info else None,
                        },
                    },
                    "policy": self.policy.value,
                }
            except Exception as e:
                return {
                    "reachable": False,
                    "version": None,
                    "error": str(e),
                    "models_installed": {
                        self.fast_model: False,
                        self.coach_model: False,
                    },
                    "details": {},
                    "policy": self.policy.value,
                }

    async def select_model_for_task(
        self, task_type: str, model_override: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Selects model tag (E2B vs E4B) based on configured policy, task type, and availability.
        Returns: (model_tag, routing_rationale)
        """
        # Explicit override
        if model_override:
            return model_override, f"Explicit model override requested: {model_override}"

        status = await self.get_runtime_status()
        e2b_available = status.get("models_installed", {}).get(self.fast_model, False)
        e4b_available = status.get("models_installed", {}).get(self.coach_model, False)

        # Policy checks
        if self.policy == ModelRoutingPolicy.E2B_ONLY:
            return self.fast_model, "E2B_ONLY policy active: Routed to Gemma 4 E2B"

        if self.policy == ModelRoutingPolicy.E4B_ONLY:
            if e4b_available:
                return self.coach_model, "E4B_ONLY policy active: Routed to Gemma 4 E4B"
            elif e2b_available:
                return self.fast_model, "E4B_ONLY requested but E4B unavailable: Falling back to E2B"
            else:
                return self.coach_model, "E4B_ONLY policy active (model pending download)"

        # AUTO_BY_TASK routing policy
        is_deep_task = task_type in (
            TaskType.MATCH_COACHING.value,
            TaskType.BENCHMARK_INTERPRETATION.value,
            TaskType.ANALYTICS_EXPLANATION.value,
        )

        if is_deep_task:
            if e4b_available:
                return (
                    self.coach_model,
                    f"AUTO_BY_TASK: Deep analytical task '{task_type}' assigned to Gemma 4 E4B",
                )
            elif e2b_available:
                return (
                    self.fast_model,
                    f"AUTO_BY_TASK: Task '{task_type}' preferred E4B, but falling back to available E2B",
                )
            else:
                return self.coach_model, f"AUTO_BY_TASK: Target model {self.coach_model}"

        # Lightweight / Fast tasks
        if e2b_available:
            return (
                self.fast_model,
                f"AUTO_BY_TASK: Fast task '{task_type}' assigned to lightweight Gemma 4 E2B",
            )
        elif e4b_available:
            return (
                self.coach_model,
                f"AUTO_BY_TASK: Fast task '{task_type}' fallback to loaded Gemma 4 E4B",
            )
        else:
            return self.fast_model, f"AUTO_BY_TASK: Target model {self.fast_model}"

    def get_chat_model(
        self, model_tag: str, temperature: float = 0.2
    ) -> ChatOllama:
        """
        Creates a configured LangChain ChatOllama instance with request timeouts.
        """
        return ChatOllama(
            base_url=self.base_url,
            model=model_tag,
            temperature=temperature,
            timeout=self.timeout,
        )

    async def smoke_test_model(self, model_tag: str) -> Dict[str, Any]:
        """
        Executes a brief smoke test prompt through the given model to verify inference.
        """
        t0 = time.time()
        try:
            model = self.get_chat_model(model_tag, temperature=0.1)
            response = await model.ainvoke("Respond with exactly one word: READY.")
            elapsed = round((time.time() - t0) * 1000, 1)
            content = response.content if hasattr(response, "content") else str(response)
            return {
                "model": model_tag,
                "status": "PASS",
                "inference_time_ms": elapsed,
                "response": content.strip(),
            }
        except Exception as e:
            elapsed = round((time.time() - t0) * 1000, 1)
            return {
                "model": model_tag,
                "status": "FAIL",
                "inference_time_ms": elapsed,
                "error": str(e),
            }


ollama_provider = OllamaProvider()
