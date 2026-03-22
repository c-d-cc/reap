---
type: task
status: consumed
priority: high
consumedBy: gen-130-428ef4
---

# Stage 자동 전환 — complete에서 전환, 다음 stage에서 token 검증

## 현재 흐름 (3단계)

```
/reap.objective → --phase complete (nonce 생성) → /reap.next <nonce> (검증+전환) → /reap.planning
```

## 변경 흐름 (2단계)

```
/reap.objective → --phase complete (nonce 생성 + 자동 stage 전환) → /reap.planning (nonce 검증)
```

## 구현 상세

### 1. --phase complete에서 자동 전환
- objective, planning, implementation, validation의 `--phase complete`에서:
  - artifact 검증 + hook 실행 + nonce 생성 (기존)
  - `state.lastNonce = nonce` 저장 (gen-127에서 추가됨)
  - **stage를 다음 단계로 전환** (기존 next.ts의 전환 로직 이동)
  - 다음 stage의 artifact 생성 (기존 next.ts의 artifact 생성 로직 이동)

### 2. 다음 stage command에서 token 검증
- planning, implementation, validation, completion의 시작 시:
  - `state.lastNonce`를 읽어서 검증 (이전 stage의 nonce)
  - 검증 통과 → `lastNonce` 삭제 → 진행
  - 검증 실패 → 에러 ("이전 stage를 완료하세요")
  - `lastNonce`가 없으면 backward compat으로 통과 허용 (또는 에러)

### 3. /reap.next 처리
- 제거하지 않고, current 상태에 기반한 자동 transition 용으로 유지
- 현재 stage가 complete된 상태(lastNonce 존재)일 때만 전환 수행
- complete 안 된 상태에서 호출하면 에러 ("현재 stage를 완료하세요")
- nonce 파라미터: 명시적 전달 or lastNonce 자동 읽기 (gen-127)
- **Normal / Merge lifecycle 모두 지원**: `current.yml`의 `type` 필드 기반으로 분기
  - Normal: objective → planning → implementation → validation → completion
  - Merge: detect → mate → merge → sync → validation → completion
  - 기존 next.ts의 분기 로직 유지

### 4. 기존 lastNonce 연동
- gen-127에서 추가한 lastNonce 저장 로직 활용
- next.ts의 lastNonce 자동 읽기 로직을 각 stage command로 이동

### 5. E2E 테스트 (꼼꼼하게 — lifecycle 변경사항)
- OpenShell sandbox에서 실행 필수
- stage-token-e2e.sh 업데이트 또는 신규 작성

#### Normal lifecycle 시나리오:
- objective complete → planning 자동 시작 → nonce 검증 통과
- objective complete 없이 planning 호출 → nonce 검증 실패
- 전체 lifecycle (objective → planning → implementation → validation → completion) 자동 전환 체인
- /reap.next로 수동 전환 (lastNonce 자동 읽기)
- /reap.back 후 재진행 시 nonce 재생성 검증

#### Merge lifecycle 시나리오:
- detect complete → mate 자동 시작 → nonce 검증 통과
- 전체 merge lifecycle (detect → mate → merge → sync → validation → completion) 자동 전환 체인
- /reap.next로 merge stage 수동 전환
- merge type에서 stage 분기 정확성 검증

### 6. 문서 업데이트
- `src/templates/hooks/reap-guide.md` — lifecycle 실행 흐름에서 `/reap.next` 제거, objective → planning 직접 연결로 변경
- `README.md` + i18n READMEs (ko, ja, zh-CN) — lifecycle 설명, slash commands 테이블 등
- `docs/` — command-reference 페이지의 lifecycle flow (이미 제거됨) 외 다른 참조
- evolve.ts의 subagentPrompt — stage loop 설명 업데이트
