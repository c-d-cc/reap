# Shortterm Memory

## 세션 요약 (gen-080, 2026-07-28)

### gen-080: OpenCode 를 멈추게 하던 agent 파일 수정 — 0.17.3 묶음 4/5

**REAP 이 사용자의 다른 도구를 동작 불능으로 만들던 버그.** `install-skills` 가 claude-code 용 agent 정의를 스키마 변환 없이 opencode 로 복사해, `tools` 가 문자열이라는 이유로 **OpenCode 전체 설정이 무효화**됐다. opencode 명령이 하나도 안 됐다.

수정: `toOpenCodeAgent()` 로 frontmatter 변환 (`tools`→`permission` record, `name`/`memory`/`model` 제거, `mode: subagent` 추가). 본문은 단일 소스, claude-code 는 무변경.

검증: 실환경 `opencode agent list` → `reap-evolve (subagent)` 정상. e2e 272→278.

### 발견 과정에서 배운 것

- **문서 대조 ≠ 실측**: backlog 는 "4개 필드가 틀렸다"고 했으나 실제 오류는 `tools` 하나. 나머지는 무시된다
- **재현 명령이 결론을 바꾼다**: `opencode auth list` 로는 재현 안 됨(agent 미로드). `agent list` 라야 드러난다. 하마터면 "버그 없음"으로 결론낼 뻔
- **carrier 표식이 사용자 파일로 샜다**: 3줄 주석에 내부 경로가 있었고 변환된 파일에 그대로 노출. 한 줄로 축소

### 다음 — (b) opencode 샌드박스 검증

유저 지시: a(본 세대) → **b(orchestrate)**. 선행 조건 충족됨.

현재 준비 상태:
- **OpenShell 게이트웨이 동작 중** (수동 설치: `~/.local/bin/openshell*`, 포트 17670, `openshell status` = Connected)
- **샌드박스 `reap-probe` 존재** (Ubuntu 24.04, opencode/node/npm/git 내장)
- **opencode 로그인 완료** — OpenCode Zen. `~/.local/share/opencode/auth.json` 파일이라 **샌드박스 전달 가능**(claude 는 keychain 이라 불가했음)
- REAP 설치가 더 이상 opencode 를 깨뜨리지 않음

b 의 목표: 층2 검증을 opencode adapter 로 확장 + 샌드박스 격리. gen-079 가 남긴 "adapter 가 둘이므로 갭도 둘"을 메운다.

### 0.17.3 릴리즈

(b) 완료 후 릴리즈 노트에 gen-077~081 일괄 보강 → 태그 (**유저 확인 필수**).

### 정리 대상

`/tmp/reap-agent-quarantine/`, `/tmp/oc-test`, `/tmp/oc-schema-test` — 유저 환경은 복구됐으므로 삭제 무방.

### Backlog 상태

pending 4건. consumed: `긴급-reap-이-설치한-agent-파일이-...` (gen-080).
