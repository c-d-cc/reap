# Planning

## Summary
REAP Objective 단계에 superpowers brainstorming 수준의 상세 설계 디자인 기능을 통합한다.

**아키텍처 접근**:
- `reap.objective.md` 슬래시 커맨드 템플릿을 확장하여 기존 7단계에 brainstorming 단계들을 삽입
- 비주얼 컴패니언은 `src/templates/brainstorm/server.js`에 Node.js 내장 모듈 전용 서버로 구현 (빌드 시 dist/templates/에 복사)
- Spec 리뷰어는 `src/templates/brainstorm/spec-reviewer-prompt.md`에 subagent 프롬프트로 구현
- `01-objective.md` artifact 템플릿에 Design 섹션 추가

## Technical Context
- **Tech Stack**: TypeScript 5.x, Node.js >=18, Commander.js
- **Constraints**:
  - 파일 I/O는 `src/core/fs.ts` 유틸 경유
  - 비주얼 서버는 외부 npm 의존 0개 (Node.js 내장 `http`, `fs`, `crypto`, `url` 모듈만)
  - 새 템플릿 추가 시 `init.ts`의 COMMAND_NAMES 및 설치 로직 동기화 필요
  - 빌드: `scripts/build.js`가 `src/templates/` → `dist/templates/` 복사

## Tasks

### Phase 1: 비주얼 컴패니언 서버
- [x] T001 `src/templates/brainstorm/server.js` — Node.js 내장 모듈 HTTP+WebSocket 서버 구현. HTML 서빙, fs.watch로 파일 변경 감지, 30분 타임아웃 자동 종료
- [x] T002 `src/templates/brainstorm/frame.html` — 기본 프레임 템플릿 (CSS 클래스: .options, .cards, .mockup, .split, .pros-cons 등)
- [x] T003 `src/templates/brainstorm/start-server.sh` — 서버 기동 스크립트. .server-info/.server-stopped 파일 관리, 포트 설정

### Phase 2: 슬래시 커맨드 확장
- [x] T004 `src/templates/commands/reap.objective.md` — brainstorming 통합. 기존 Step 5를 확장하여 9단계 brainstorming 체크리스트 삽입:
  - Step 5a: 비주얼 컴패니언 제안 (evolve에서도 동작)
  - Step 5b: 구조화된 질문 (한 번에 하나, 객관식 우선)
  - Step 5c: 2-3개 접근법 제안 + 트레이드오프
  - Step 5d: 섹션별 점진적 디자인 승인
  - Step 5e: 스코프 분해 감지 (독립 서브시스템 2+ → 분리 제안)
- [x] T005 `src/templates/brainstorm/visual-companion-guide.md` — 비주얼 컴패니언 사용 가이드 (브라우저/터미널 판단 규칙, 서버 기동법, .events 읽기 등). reap.objective에서 참조
- [x] T006 `src/templates/brainstorm/spec-reviewer-prompt.md` — Spec 자동 리뷰 subagent 프롬프트 (완전성/일관성/명확성/스코프/YAGNI 검토 기준)

### Phase 3: Artifact 템플릿 + 빌드 통합
- [x] T007 `src/templates/artifacts/01-objective.md` — Design 섹션 추가 (접근법 비교 표, 선택된 디자인, 디자인 승인 이력)
- [x] T008 `scripts/build.js` — `src/templates/brainstorm/` 디렉토리를 `dist/templates/brainstorm/`으로 복사하는 로직 추가
- [x] T009 `src/cli/commands/init.ts` — brainstorm 템플릿 설치 로직 추가 (init/update 시 프로젝트에 복사)

### Phase 4: 검증
- [x] T010 비주얼 컴패니언 서버 수동 테스트 — `node dist/templates/brainstorm/server.js` 기동, 브라우저 접속, HTML 파일 변경 시 WebSocket 실시간 반영 확인
- [x] T011 `bun test` 전체 통과 확인
- [x] T012 `bunx tsc --noEmit` 통과 확인
- [x] T013 `npm run build` 성공 확인

## Dependencies
```
T001 → T003 (서버가 있어야 기동 스크립트)
T001, T002 → T005 (서버+프레임이 있어야 가이드 작성)
T005, T006 → T004 (가이드+리뷰어가 있어야 커맨드에 참조)
T004 → T007 (커맨드 확장 후 artifact 템플릿 맞춤)
T001~T009 → T010~T013 (구현 완료 후 검증)
T001, T002, T003은 병렬 가능
T005, T006은 병렬 가능
T011, T012, T013은 병렬 가능
```
