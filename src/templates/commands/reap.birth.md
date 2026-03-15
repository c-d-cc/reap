---
description: "REAP Birth — Genome을 진화시키고 세대를 마무리합니다"
---

# Birth (출산)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `birth`인지 확인하라
- `.reap/life/06-adaptation-retrospective.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Steps
1. `.reap/life/mutations/` 디렉토리의 모든 mutation을 읽어라
2. 각 mutation의 `target`과 `suggestedChange`를 확인하라
3. `.reap/life/06-adaptation-retrospective.md`에서 genome 변경 제안을 읽어라
4. mutation과 adaptation을 `.reap/genome/`의 해당 파일에 반영하라:
   - `principles.md`, `domain/`, `conventions.md`, `constraints.md` 중 해당하는 파일 수정
5. 변경된 genome 내용을 인간에게 보여주고 확인을 받아라
6. 변경 내역을 changelog에 기록하라

## 산출물 생성
- `.reap/templates/07-birth-changelog.md`를 읽어라
- genome에 반영한 변경 목록 (mutation별, adaptation별)을 기록하라
- `.reap/life/07-birth-changelog.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Legacy 단계로 진행하라고 안내하라
- Legacy 진입 시 CLI가 자동으로 lineage 아카이빙을 수행함을 안내하라
