"""corey_memory — Hermes memory provider backed by the cluster hermes-memory
service (ns hermes-tools, over corey-rag/pgvector).

Activating this (memory.provider: corey_memory) turns ON Hermes' "pick up where
you left off" path: per-turn recall injection (prefetch), turn persistence
(sync_turn), and checkpoint-on-compaction (on_pre_compress) — so Hermes stops
replaying the raw transcript every turn. All state is server-side, so
backup_paths() is empty (zero local disk).

HTTP mapping lives in client.py (stdlib-only, unit-tested); this file is the thin
MemoryProvider wrapper.
"""
from __future__ import annotations

import os
import threading
from typing import Any, Dict, List, Optional

from agent.memory_provider import MemoryProvider, RecallStatus

from . import client as _client

DEFAULT_URL = os.environ.get("HERMES_MEMORY_URL", "http://127.0.0.1:9108")


class CoreyMemoryProvider(MemoryProvider):
    def __init__(self) -> None:
        self._base_url = DEFAULT_URL
        # Memory is partitioned by user (not session) so a fact from one session
        # is recalled in the next — "pick up where you left off".
        self._user_id = os.environ.get("HERMES_MEMORY_USER") or os.environ.get("USER", "corey")
        self._session_id = ""
        self._cached_recall = ""
        self._last_count = 0

    @property
    def name(self) -> str:
        return "corey_memory"

    def is_available(self) -> bool:
        return bool(self._base_url)  # config check only, no network

    def unavailable_reason(self) -> str:
        return "HERMES_MEMORY_URL / base_url is not configured"

    def initialize(self, session_id: str, **kwargs) -> None:
        self._session_id = session_id or ""
        cfg = kwargs.get("config") or {}
        if cfg.get("base_url"):
            self._base_url = str(cfg["base_url"])

    def save_config(self, values: Dict[str, Any], hermes_home: str) -> None:
        if values.get("base_url"):
            self._base_url = str(values["base_url"])

    def prefetch(self, query: str, *, session_id: str = "") -> str:
        text = _client.recall(self._base_url, self._user_id, query, timeout=4)
        self._cached_recall = text
        self._last_count = 1 if text else 0
        return ("Relevant memory from earlier conversations:\n" + text) if text else ""

    def recall_status(self) -> Optional[RecallStatus]:
        if not self._cached_recall:
            return None
        return RecallStatus(provider_label="corey-memory", count=self._last_count)

    def sync_turn(self, user_content: str, assistant_content: str, *,
                  session_id: str = "", messages: Optional[List[Dict[str, Any]]] = None) -> None:
        base, uid = self._base_url, self._user_id

        def _bg() -> None:
            _client.remember(base, uid, uid, user_content, assistant_content)

        threading.Thread(target=_bg, daemon=True).start()

    def on_pre_compress(self, messages: List[Dict[str, Any]]) -> str:
        """Persist a compact note of what's about to be discarded so it stays recallable."""
        try:
            tail = [m for m in (messages or []) if isinstance(m, dict)][-6:]
            joined = " | ".join((m.get("content") or "")[:200] for m in tail if m.get("content"))
            if joined.strip():
                _client.remember(self._base_url, self._user_id, self._user_id,
                                 "session checkpoint (pre-compaction)", joined)
        except Exception:
            pass
        return ""  # no extra text into the compressor's summary prompt

    def get_tool_schemas(self) -> List[Dict[str, Any]]:
        return []

    def backup_paths(self) -> List[str]:
        return []  # all state is server-side — nothing on local disk


def register(ctx) -> None:
    ctx.register_memory_provider(CoreyMemoryProvider())
