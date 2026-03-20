---
description: "REAP Sync Environment — Discover and document external environment dependencies"
---

# Sync Environment

Discover external systems, APIs, infrastructure, and constraints that affect this project. Populate the `.reap/environment/` 3-layer structure.

## Gate (Preconditions)
- Read `.reap/life/current.yml`
- If active Generation exists: switch to **Backlog Mode** (record as `type: environment-change`)
- If no active Generation: proceed with **Sync Mode** (modify environment directly after human confirmation)

## Environment 3-Layer Structure

```
.reap/environment/
├── summary.md          # Session context (~100 lines max)
├── docs/               # Main reference docs (agent reads these)
└── resources/          # Raw materials (user-managed)
    ├── *.pdf, *.md     # Original documents
    └── links.md        # External URLs + summaries
```

- **summary.md**: Auto-generated overview of all docs/. Loaded into session context.
- **docs/**: One file per environment topic. ~100 lines each. AI + human maintained.
- **resources/**: User-provided originals. No line limit. AI reads when deeper detail needed.

## Steps

### 1. Source Code Scan
Detect hints of external dependencies from:
- `package.json` / `requirements.txt` / `go.mod` — SDK/client libraries (e.g., `discord.js`, `@aws-sdk/*`, `stripe`)
- Config files — `.env`, `.env.example`, `wrangler.toml`, `docker-compose.yml`, `vercel.json`
- API client code — HTTP clients, webhook handlers, OAuth configs
- Infrastructure — Dockerfile, CI/CD configs, deployment scripts

Present findings:
```
🔍 Detected external dependencies:
  - discord.js → Discord Bot API
  - @supabase/supabase-js → Supabase (DB + Auth)
  - wrangler.toml → Cloudflare Workers
```

### 2. User Interview
Ask the user to confirm and expand. Goal: **capture ALL external systems** that affect this project.

Questions (one at a time, skip if already covered):
1. "감지된 외부 서비스들이 맞나요? 추가/수정할 것이 있나요?"
2. "그 외에 연동되는 외부 서비스, API, 시스템이 있나요?"
3. "배포/인프라 환경을 알려주세요 (호스팅, CI/CD, 도메인 등)"
4. "따라야 하는 조직 규칙이나 외부 제약이 있나요? (보안 정책, 규제 등)"
5. "참고해야 할 외부 문서나 링크가 있나요? (API docs, 스펙 등)"

For each confirmed item:
- Ask: "관련 문서/링크가 있으면 알려주세요 (없으면 skip)"
- If provided: save to `resources/` (file or `links.md` entry)

### 3. Generate docs/
For each confirmed environment topic, create a file in `docs/`:
- File name: `{topic-slug}.md` (e.g., `discord-api.md`, `infrastructure.md`)
- Content: structured markdown with key info the agent needs during implementation
- Sections: Overview, Key Constraints, API/Config Details, References (→ resources/)
- ~100 lines max per file

### 4. Generate summary.md
Aggregate all docs/ into a concise summary:
- One section per environment topic
- Key constraints and gotchas highlighted
- Links to docs/ files for detail
- **~100 lines max** (this gets loaded into every session)

### 5. Verify
- List all created/updated files
- Show summary.md content to user for confirmation
- Ask: "빠진 환경 정보가 있나요?"

## Backlog Mode (active Generation)
- Record each discovered environment item as `type: environment-change` in `.reap/life/backlog/`
- "Environment 변경사항이 backlog에 기록되었습니다. Completion에서 적용됩니다."

## Completion
- "Environment synced. {N} docs created, summary.md updated."
