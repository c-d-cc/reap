---
type: task
status: consumed
priority: medium
consumedBy: gen-126-8d3c61
---

# reap.clean / reap.destroy 커맨드 추가

## reap.destroy

`reap init`으로 관리하는 프로젝트에서 REAP 관련 내용을 완전히 삭제.

삭제 대상:
- `.reap/` 폴더 전체
- `.claude/commands/reap.*` 파일
- `.claude/skills/reap.*` 디렉토리
- `.claude/CLAUDE.md`의 REAP managed 섹션
- `.gitignore`의 REAP 관련 항목

유저 확인 필수 (되돌릴 수 없음). 단순 enter가 아닌 특정 확인 메시지를 따라서 입력하게 함 (예: "reap destroy [project-name]"을 정확히 타이핑).

## reap.clean

이미 REAP으로 관리되고 있던 프로젝트를 새롭게 시작. 유저 판단이 필요한 항목:

1. **Lineage 처리**:
   - 전체 lineage를 epoch로 압축 후 보존
   - lineage 전체 삭제
   - 유저 선택

2. **Hooks 보존 여부**:
   - 기존 hooks 유지
   - hooks 초기화 (기본 condition만)
   - 유저 선택

3. **Genome / Environment 처리**:
   - template 레벨로 override (초기 상태로 되돌림)
   - 이후 `/reap.sync` 실행하여 현재 코드 기반으로 재동기화
   - 유저 선택 (override 후 sync / 기존 유지 / 수동 편집)

4. **Backlog 처리**:
   - 기존 backlog 보존
   - backlog 전체 삭제
   - 유저 선택
