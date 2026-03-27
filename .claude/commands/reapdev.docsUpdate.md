---
description: "REAP Dev — Update docs, README based on code changes"
---
이번 Generation의 변경사항에 따라 문서를 업데이트하라.

## 버전 수준별 동작

1. `package.json` version과 `git describe --tags --abbrev=0`을 비교하여 bump 수준 판단
2. 수준별 동작:
   - **patch (또는 bump 없음)**: 변경된 기능의 해당 섹션만 확인. 변경 없으면 skip.
   - **minor 이상**: README + 스킬 전체 **full scan**. 모든 변경사항을 문서와 대조.

## Full Scan 대상

- `README.md`
- `src/adapters/claude-code/skills/reap.help.md` (커맨드 테이블 + topic 목록 최신화)

## Help Topic 최신화

`src/adapters/claude-code/skills/reap.help.md`의 topic 목록과 커맨드 테이블이 현재 slash command 목록과 일치하는지 확인:
1. `src/adapters/claude-code/skills/`에 있는 `reap.*.md` 파일 목록을 스캔
2. `reap.help.md`의 커맨드 테이블에 누락된 커맨드가 있으면 추가
3. Topic 목록에 누락된 커맨드가 있으면 추가
4. 삭제된 커맨드가 있으면 제거

## 프리뷰 + 유저 컨펌

문서 수정이 발생한 경우, 수정 완료 후 반드시 유저에게 확인 요청:
- 변경 내용 요약을 유저에게 보여주기
- **유저의 명시적 확인**("ok", "확인", "좋아" 등)을 받은 후에만 다음 단계로 진행
- 유저가 수정 요청하면 → 수정 후 다시 확인 요청

**IMPORTANT**: 이 프리뷰+컨펌은 `/reap.evolve` Autonomous Override에서도 **스킵할 수 없다**. 항상 유저 확인을 받아야 한다.

## 변경 없으면 skip
