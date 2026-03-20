---
condition: has-code-changes
order: 30
---
이번 Generation의 변경사항에 따라 문서를 업데이트하라.

## 버전 수준별 동작

1. `package.json` version과 `git describe --tags --abbrev=0`을 비교하여 bump 수준 판단
2. 수준별 동작:
   - **patch (또는 bump 없음)**: 변경된 기능의 해당 섹션만 확인. 변경 없으면 skip.
   - **minor 이상**: README + docs 전체 **full scan**. 모든 변경사항을 문서와 대조.

## Full Scan 대상

- `README.md` (en 기준 → 아래 i18n 동기화)
- `src/templates/hooks/reap-guide.md`
- `src/templates/commands/reap.help.md` (커맨드 테이블 + topic 목록 최신화)
- `docs/src/i18n/translations/en.ts` (기준 → 아래 i18n 동기화)
- `docs/src/pages/*.tsx`

## Help Topic 최신화

`src/templates/commands/reap.help.md`의 topic 목록과 커맨드 테이블이 현재 slash command 목록과 일치하는지 확인:
1. `src/templates/commands/`에 있는 `reap.*.md` 파일 목록을 스캔
2. `reap.help.md`의 커맨드 테이블에 누락된 커맨드가 있으면 추가
3. Topic 목록에 누락된 커맨드가 있으면 추가
4. 삭제된 커맨드가 있으면 제거

## i18n 동기화 규칙

**반드시 en 기준으로 스캔한 후 다른 언어에 동기화:**
1. `README.md` (en) 수정 → `README.ko.md`, `README.ja.md`, `README.zh-CN.md` 동기화
2. `docs/src/i18n/translations/en.ts` 수정 → `ko.ts`, `ja.ts`, `zh-CN.ts` 동기화
3. 각 언어의 자연스러운 표현 유지 (기계적 직역 금지)
4. 구조(섹션, 코드 블록, 표)는 en과 동일하게 유지

## 프리뷰 + 유저 컨펌

문서 수정이 발생한 경우, 수정 완료 후 반드시 프리뷰를 제공하라:

1. `cd docs && npm run dev`로 docs 앱을 실행 (이미 실행 중이면 스킵)
2. 브라우저에서 변경된 주요 페이지를 열어 유저에게 보여주기 (스크린샷 또는 브라우저 자동화)
3. 유저에게 확인 요청: "docs 변경사항을 확인해주세요. 문제가 있으면 수정 요청해주세요."
4. **유저의 명시적 확인**("ok", "확인", "좋아" 등)을 받은 후에만 다음 단계로 진행
5. 유저가 수정 요청하면 → 수정 후 다시 프리뷰 (2번으로 돌아감)

**IMPORTANT**: 이 프리뷰+컨펌은 `/reap.evolve` Autonomous Override에서도 **스킵할 수 없다**. 항상 유저 확인을 받아야 한다.

## 변경 없으면 skip
