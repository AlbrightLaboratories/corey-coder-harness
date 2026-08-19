# Perfecting the harness (corey-coder-harness = our fork of NousResearch/hermes-agent)

**Goal (hermes-agent#89706):** make corey-coder code like Claude on commodity GPUs —
a harness problem, not a hardware problem. This fork is where the *runtime* changes
land; the *model + cluster fabric* stays in `AlbrightLaboratories/corey-coder`.

## Repo hygiene
- `origin` = AlbrightLaboratories/corey-coder-harness (ours) · `upstream` = NousResearch/hermes-agent
- `main` tracks upstream (never commit here) → `git fetch upstream && git merge upstream/main`
- Our work lands on branch **`corey-coder-harness`**; upstreamable fixes get their own PR branch.

## Port our proven session wins into the fork (each = failing test → green → PR)
| Win (proven in corey-coder repo) | Fork file to change | Upstream PR? |
|---|---|---|
| Reasoning-strip for non-thinking Ollama models (#25758) | `plugins/model-providers/custom/__init__.py` (emit top-level `reasoning_effort`; gate on `/api/show` caps) | **yes** — closes Nous #25758 |
| GPU-tier + warm-keep routing (LOW/HIGH + `keep_alive=-1`) | model provider / `hermes_cli` routing; env-driven | yes (backend-agnostic) |
| Sandbox exec: run / serve+preview / interactive stdin | reconcile with `scripts/sandbox/` + `tools/`; expose as a first-class tool | yes |
| Skills → the loop (SKILL.md as plan/verify spine) | `skills/`, `optional-skills/mcp/` | maybe |
| mcp-hub bridge learnings (unify REST tool fabric as MCP) | `tools/` + `mcp_serve.py` | our fork only |

## The capstone (proves "codes like Claude")
Autonomous e2e: real GitHub issue → plan (skills) → edit (fs/github) → run+test
(sandbox) → verify (tdd) → PR — unattended, on RTX 3060 Ti + 5090. Tracked in
corey-coder#99 (router tiering) / #100 (CI) and hermes-agent#89706.

## Naming note
Forked as `corey-coder-harness` (not `hermes`) to avoid clobbering the existing
`AlbrightLaboratories/hermes` (the deploy chart + its CI/secrets). Rename to `hermes`
later only if that chart repo is retired/moved first.
