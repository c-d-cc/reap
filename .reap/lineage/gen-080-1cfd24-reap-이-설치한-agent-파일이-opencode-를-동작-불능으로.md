---
id: gen-080-1cfd24
type: embryo
goal: "REAP 이 설치한 agent 파일이 OpenCode 를 동작 불능으로 만드는 문제 수정 — 클라이언트별 frontmatter 스키마 변환"
parents: ["gen-079-600b6c"]
---
# gen-080-1cfd24
**Goal**: REAP 이 설치한 agent 정의가 OpenCode 를 동작 불능으로 만드는 문제 수정. 0.17.3 묶음 4/5.

**결과**: 완료. 유저 환경 복구됨.

**핵심 변경**: `src/adapters/opencode/install.ts` — `toOpenCodeAgent()` 로 frontmatter 를 OpenCode 스키마로 변환한 뒤 write. claude-code 는 무변경.

**검증**: 게이트 4종 pass / unit 470-0 / e2e **278-0**(+6) / scenario 44-0 / 실환경 `opencode agent list` 정상