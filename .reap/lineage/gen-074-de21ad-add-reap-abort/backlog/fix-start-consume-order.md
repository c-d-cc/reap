---
type: task
status: pending
priority: medium
---

# reap.start에서 backlog consume 순서 수정

현재 reap.start 커맨드 템플릿에서 backlog consumed 처리(Step 0)가 ID 생성(Step 3)보다 먼저 실행될 수 있음.
consumedBy에 불완전한 ID가 들어가는 문제.

## 수정
- Step 0에서 backlog 선택만 하고, consumed 마킹은 Step 3(ID 생성) 이후로 이동
- 또는 Step 0에서 ID를 먼저 생성하도록 순서 변경
