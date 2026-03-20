---
type: task
status: consumed
consumedBy: gen-077-e80520
priority: high
---

# reap.sync를 sync / sync.genome / sync.environment로 분리

## 현재
- reap.sync는 genome만 동기화
- environment는 스캔/업데이트 대상이 아님
- init 후 environment가 비어있는 문제
- objective Step 1에서 일반적 질문만 있고 소스 스캔 없음

## Environment 3-Layer 구조

```
.reap/environment/
├── summary.md          # Session context용 요약 (~100줄 제한)
├── docs/               # 주요 환경 정보 (에이전트가 주로 참조)
│   ├── discord-api.md
│   ├── infrastructure.md
│   └── ...
└── resources/          # 원본 자료 (유저 관리)
    ├── discord-api-spec.pdf
    ├── links.md        # 외부 링크 + 요약
    └── ...
```

### 탐색 흐름
summary.md (항상 로딩) → docs/ (상세 필요 시) → resources/ (원본 필요 시)

### 레이어별 역할
- **summary.md**: AI가 sync 시 자동 생성. session-start에서 context 로딩. ~100줄
- **docs/**: AI + 유저. 환경별 정리 문서. 파일당 ~100줄
- **resources/**: 유저 위주. 원본 파일, 외부 링크, API 스펙 PDF 등. 제한 없음

## 커맨드 구조
- `/reap.sync` — genome + environment 모두 실행
- `/reap.sync.genome` — genome만 동기화 (기존 sync 로직 이동)
- `/reap.sync.environment` — environment만 동기화 (신규)

## sync.environment 동작
1. **소스 스캔**: package.json, config, .env, API 클라이언트 등에서 외부 의존성 힌트 추출
2. **유저 인터뷰**: 시스템에 영향을 주는 모든 외부 시스템 정보 확보
   - 감지된 힌트 먼저 제시
   - 감지 못한 외부 서비스/API/인프라도 질문
   - 참고 문서/링크가 있으면 resources/에 저장 요청
3. **docs 생성**: 수집된 정보를 docs/ 파일로 정리
4. **summary 생성**: docs/ 전체를 요약하여 summary.md 작성

## session-start 연동
- genome과 함께 summary.md를 context에 로딩 (genome-loader.cjs 수정)

## 수정 대상
- `src/templates/commands/reap.sync.md` → orchestrator로 변경
- `src/templates/commands/reap.sync.genome.md` — 기존 sync 로직 이동
- `src/templates/commands/reap.sync.environment.md` — 신규 작성
- `src/templates/hooks/session-start.cjs` + `genome-loader.cjs` — summary.md 로딩
- `src/cli/commands/init.ts` COMMAND_NAMES 업데이트
- `constraints.md` slash command 수 업데이트
- `reap.objective.md` Step 1 — sync.environment 연동으로 간소화
- `reap init` — environment 3-layer 디렉토리 구조 생성
