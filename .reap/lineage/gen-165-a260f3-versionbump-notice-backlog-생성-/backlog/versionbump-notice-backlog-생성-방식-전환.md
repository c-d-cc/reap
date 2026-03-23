---
type: task
status: consumed
priority: high
consumedBy: gen-165-a260f3
---

# versionBump notice + backlog 생성 방식 전환

## 1. versionBump 워크플로우에 notice 작성 단계 추가

`.claude/commands/reapdev.versionBump.md`의 Step 5 (RELEASE_NOTES 생성) 이후에:

- Step 5.5: Release notice 작성
  - AI가 변경사항 기반으로 notice 초안 작성 (평소 5줄 내외, breaking change 시 상세)
  - 다국어 섹션 포함 (`## en`, `## ko`)
  - 유저에게 컨펌
  - 컨펌 후 `gh api`로 GitHub Discussions (Announcements 카테고리)에 게시
  - 제목 형식: `v{version} Release Notes`

### 배경
gen-164에서 `src/core/notice.ts` (fetch 쪽)는 구현했으나, 게시 쪽(versionBump skill 수정)이 누락됨.
원인: parent agent가 subagent prompt에 이 작업을 구현 포인트로 명시하지 않음.

## 2. backlog 생성 시 `reap make backlog` 사용으로 전환

현재 subagent가 backlog 파일을 직접 Write로 생성하고 있어 frontmatter 형식 오류 발생 가능.

### 수정 대상
- `src/cli/commands/run/completion.ts` — feedKnowledge phase에서 genome-change backlog 생성 시
- `src/cli/commands/run/evolve.ts` — subagent prompt에 backlog 생성 가이드
- 각 stage script에서 backlog 생성하는 곳

### 변경 내용
- backlog 생성 시 `reap make backlog --type <type> --title <title> --body <body>` 사용하도록 안내/수정
- AI가 직접 Write로 backlog 파일을 만들지 않도록 가이드 추가
- 생성 후 상세 내용은 파일을 직접 편집하여 보강

## 3. evolve subagent prompt에 backlog 참조 지시 추가

`src/cli/commands/run/evolve.ts`의 subagent prompt 생성 시:
- "선택된 backlog 파일의 원본을 직접 읽고, 모든 구현 포인트를 빠짐없이 확인하라" 지시 추가
- backlog 파일 경로를 prompt에 명시적으로 포함

### 배경
gen-164에서 parent agent가 backlog 요약만 전달하고 원본 파일을 읽으라는 지시를 안 줌.
결과: backlog에 명시된 "versionBump 워크플로우 수정" 구현 포인트가 누락됨.
subagent가 backlog 원본을 직접 읽으면 이런 누락을 방지할 수 있음.
