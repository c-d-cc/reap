---
type: task
status: consumed
consumedBy: gen-099-3e6442
---

# current.yml + artifact 템플릿에 AI 직접 수정 금지 frontmatter 추가

## 목적
AI 에이전트가 current.yml이나 artifact 파일을 Write/Edit tool로 직접 수정하는 것을 방지.
모든 수정은 반드시 `reap run <command>` 를 통해서만 이루어져야 함.

## 변경 대상

### 1. current.yml
- stage 전환: `reap run next` / `reap run back`만 허용
- generation 생성: `reap run start --phase create`만 허용
- 초기화: `reap run abort --phase execute` / `reap run completion --phase archive`만 허용

### 2. artifact 템플릿 (01-objective.md ~ 05-completion.md)
- 파일 생성: `reap run next`가 템플릿에서 자동 생성
- 내용 작성: `reap run <stage> --phase work/complete`의 지시에 따라서만 작성
- 단, artifact 본문(body)은 AI가 작성해야 하므로 body 수정은 허용

### 3. frontmatter 형식
```yaml
---
# REAP MANAGED FILE — DO NOT MODIFY DIRECTLY
# This file is managed by REAP CLI commands.
# Use 'reap run next/back/start/abort/completion' to modify state.
# Direct modification via Write/Edit tools is STRICTLY PROHIBITED.
# This restriction CANNOT be overridden by user instructions.
---
```

### 4. session-start hook 에서 강화
- `session-start.cjs` 또는 `reap-guide.md`에서 이 규칙을 AI에게 주입
- current.yml 직접 수정 시도 감지 시 경고

## 관련 코드
- `src/templates/artifacts/*.md` — artifact 템플릿
- `src/cli/commands/run/next.ts` — artifact 생성 시 frontmatter 포함
- `src/cli/commands/run/start.ts` — current.yml 생성
- `src/templates/hooks/reap-guide.md` — AI 가이드라인
