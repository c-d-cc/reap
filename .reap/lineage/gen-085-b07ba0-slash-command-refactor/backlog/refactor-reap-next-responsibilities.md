---
type: task
status: consumed
consumedBy: gen-085-b07ba0
---
# slash command 전면 정리 — 책임 분리 + hook 배치 + 일관성

## 문제

분석 결과 발견된 전체 이슈:

### 1. reap.next 과부하 (CRITICAL)
`reap.next`가 3가지 역할을 겸하고 있음:
- 일반 stage 전환 (objective→planning→impl→val→completion)
- completion archiving (lineage 이동, meta.yml 생성, 커밋)
- hook 실행 (onLifeObjected, onLifeCompleted 등)

### 2. hook 실행 위치 부자연스러움 (MAJOR)
hook이 각 stage command가 아닌 전환 커맨드(reap.next)에서 실행됨.
각 stage command 말단에서 자기 hook을 실행하는 게 자연스러움.

### 3. hook 실행 설명 중복 (MAJOR)
reap.next에 hook 실행 로직이 3번 반복 (Stage Transition hooks, Generation Complete hooks, 각각 동일한 condition 체크)

### 4. reap.evolve에 hook 언급 없음 (MODERATE)
각 stage 전환 시 hook이 자동으로 실행된다는 안내 부재.

### 5. reap.completion Phase 5 hook 이벤트 불완전 (MODERATE)
hook 제안 시 4개 이벤트만 언급 (8개 중). 전체 목록 필요.

### 6. backlog target 필드 형식 불일치 (MINOR)
reap.implementation: `target: genome/[file]`
reap.objective: `target: genome/domain/{topic}.md`
통일 필요.

### 7. hook 실행 타이밍 불명확 (MINOR)
onLifeCompleted, onLifeRegretted가 커밋 전/후 어느 시점에 실행되는지 모호.

### 8. reap.start hook 실행 섹션 (MINOR)
backlog consumed 마킹과 hook 실행 순서 관계 불명확.

## 변경 계획

### A. reap.next → stage 전환 전용으로 축소
- current.yml stage 업데이트 + timeline 추가
- 다음 stage artifact 템플릿 생성
- hook 실행, archiving 로직 모두 제거

### B. 각 stage command → 말단에 자기 hook 실행

Normal lifecycle:
- reap.start: 작업 완료 후 `onLifeStarted` 실행
- reap.objective: 작업 완료 후 `onLifeObjected` 실행
- reap.planning: 작업 완료 후 `onLifePlanned` 실행
- reap.implementation: 작업 완료 후 `onLifeImplemented` 실행
- reap.validation: 작업 완료 후 `onLifeValidated` 실행
- reap.completion: 작업 + archiving + 커밋 후 `onLifeCompleted` 실행
- reap.back: 현재대로 `onLifeRegretted` 실행

Merge lifecycle:
- reap.merge.start: 작업 완료 후 `onMergeStarted` 실행
- reap.merge.detect: 작업 완료 후 `onMergeDetected` 실행
- reap.merge.mate: 작업 완료 후 `onMergeMated` 실행
- reap.merge.merge: 작업 완료 후 `onMergeMerged` 실행
- reap.merge.sync: 작업 완료 후 `onMergeSynced` 실행
- reap.merge.validation: 작업 완료 후 `onMergeValidated` 실행
- reap.merge.completion: 작업 + archiving + 커밋 후 `onMergeCompleted` 실행

### C. reap.completion → archiving 흡수
- 기존 Phase 5 (Hook Suggestion) 후에 archiving Phase 추가
- `onLifeCompleted` hook 실행 (커밋 전 — hook 결과물이 같은 커밋에 포함됨)
- lineage 이동, meta.yml 생성, backlog 처리, submodule 체크, 커밋

### D. hook 실행 로직 공통화
- 각 command에서 반복되는 hook 실행 절차를 공통 패턴으로 정의
- "Hook Execution" 섹션을 간결하게: "Execute hooks for event `{event}` (see Hook System)"

### E. 기타 정리
- reap.evolve: 각 stage command가 hook을 자동 실행한다는 안내 추가
- reap.completion Phase 5: 8개 normal event 전체 나열
- backlog target 필드 형식 통일 (`target: genome/{file}`)
- hook 타이밍 명시: 모든 hook은 커밋 전 실행 (hook 결과물이 같은 커밋에 포함)
- reap.start: backlog consumed → hook 실행 순서 명시

## 수정 대상 파일

Normal lifecycle (9개):
- src/templates/commands/reap.next.md
- src/templates/commands/reap.start.md
- src/templates/commands/reap.objective.md
- src/templates/commands/reap.planning.md
- src/templates/commands/reap.implementation.md
- src/templates/commands/reap.validation.md
- src/templates/commands/reap.completion.md
- src/templates/commands/reap.back.md
- src/templates/commands/reap.evolve.md

Merge lifecycle (8개):
- src/templates/commands/reap.merge.start.md
- src/templates/commands/reap.merge.detect.md
- src/templates/commands/reap.merge.mate.md
- src/templates/commands/reap.merge.merge.md
- src/templates/commands/reap.merge.sync.md
- src/templates/commands/reap.merge.validation.md
- src/templates/commands/reap.merge.completion.md
- src/templates/commands/reap.merge.evolve.md

## E2E 테스트 시나리오

### Scenario 1: reap.next는 stage 전환만 수행
- **Setup**: sandbox에 .reap/ 생성, current.yml에 stage: objective
- **Action**: reap.next 실행 (AI 시뮬레이션 또는 직접 current.yml 조작)
- **Assertion**: stage가 planning으로 변경, 02-planning.md 생성, hook 실행 없음, archiving 로직 없음

### Scenario 2: 각 stage command가 자기 hook을 실행
- **Setup**: sandbox에 .reap/ + .reap/hooks/onLifeObjected.test.sh 생성 (touch marker 파일)
- **Action**: reap.objective 완료
- **Assertion**: marker 파일이 생성됨 (hook 실행 확인)

### Scenario 3: reap.completion이 archiving + 커밋 + onLifeCompleted 실행
- **Setup**: sandbox에 git init + .reap/ 생성, stage: completion, 01~05 artifact 존재
- **Action**: reap.completion 완료
- **Assertion**: lineage/ 디렉토리 생성, meta.yml 존재, artifact 이동됨, git commit 존재, current.yml 비어있음

### Scenario 4: hook 실행 타이밍 — onLifeCompleted는 커밋 전
- **Setup**: Scenario 3 + .reap/hooks/onLifeCompleted.check.sh (echo "hook-ran" > hook-marker.txt)
- **Action**: reap.completion 완료
- **Assertion**: hook-marker.txt가 generation 커밋에 포함됨 (커밋 전 실행 증명, git show HEAD -- hook-marker.txt)

### Scenario 5: submodule 커밋 체크
- **Setup**: sandbox에 git init + git submodule (mock) + .reap/ 생성, submodule 내 uncommitted 파일
- **Action**: reap.completion archiving
- **Assertion**: submodule 내부 커밋이 먼저 실행됨, parent repo에서 submodule pointer 업데이트됨

### Scenario 6: merge command hook 실행
- **Setup**: sandbox에 .reap/ + .reap/hooks/onMergeDetected.test.sh 생성
- **Action**: reap.merge.detect 완료
- **Assertion**: hook 실행됨 (marker 파일 확인)

### Scenario 7: reap.evolve에서 hook이 각 stage마다 실행됨
- **Setup**: sandbox에 .reap/ + onLifeObjected/onLifePlanned hook (각각 marker 생성)
- **Action**: reap.evolve 실행 (objective → planning 전환 포함)
- **Assertion**: 두 marker 파일 모두 생성됨

### Scenario 8: reap.back에서 onLifeRegretted 실행
- **Setup**: sandbox에 .reap/ + stage: validation + .reap/hooks/onLifeRegretted.test.sh
- **Action**: reap.back 실행
- **Assertion**: hook 실행됨, stage가 implementation으로 복귀

## 기존 E2E 테스트 검토

변경 전 반드시 기존 E2E 시나리오를 읽고 검토할 것:
- `tests/e2e/` 디렉토리의 모든 테스트 스캔
- 기존 시나리오가 이번 변경으로 깨지는지 확인 (특히 reap.next가 archiving/hook을 했던 시나리오)
- 커버리지 갭: 기존 E2E에서 hook 실행 타이밍, stage command 말단 hook, merge hook을 검증하는 시나리오가 있는지
- 모호한 assertion: "hook이 실행된다"를 어떻게 검증하는지 (marker 파일? exit code?)
- 기존 시나리오 중 이번 변경에 맞게 수정이 필요한 것들을 식별하고 함께 수정
