"""corey_memory's declared config surface — rendered by the generic desktop panel.

Loaded by PATH (never imported), so this file must not import the Hermes runtime.
"""
from plugins.memory.config_schema import (
    KIND_TEXT,
    ProviderConfigSchema,
    ProviderField,
)

CONFIG_SCHEMA = ProviderConfigSchema(
    name="corey_memory",
    label="Corey Memory (cluster)",
    fields=(
        ProviderField(
            key="base_url",
            label="Service URL",
            kind=KIND_TEXT,
            default="http://127.0.0.1:9108",
            env_key="HERMES_MEMORY_URL",
            description="hermes-memory service (ns hermes-tools), reached via a local port-forward. "
                        "Shared cluster memory over corey-rag/pgvector — recall + checkpoints, no local disk.",
        ),
    ),
)
