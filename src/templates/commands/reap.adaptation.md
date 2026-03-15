---
description: "REAP Adaptation — 회고하고 다음 세대를 위한 Genome diff를 작성합니다"
---

# Adaptation (회고)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `adaptation`인지 확인하라
- `.reap/life/05-validation-report.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Steps
1. `.reap/life/mutations/` 디렉토리의 모든 파일을 읽어라 (mutation 전체 리뷰)
2. `.reap/life/04-growth-log.md`에서 deferred 태스크 목록을 읽어라
3. 이번 세대에서 얻은 교훈을 정리하라
4. genome에 반영할 변경 사항을 adaptation으로 기록하라 (어떤 genome 파일을 어떻게 수정할지)
5. deferred 태스크를 다음 세대 목표로 `.reap/life/backlog/`에 마크다운 파일로 추가하라
6. 그 외 다음 세대 목표 후보도 backlog에 추가하라
7. 인간과 함께 회고를 확정하라

## 산출물 생성
- `.reap/templates/06-adaptation-retrospective.md`를 읽어라
- 교훈, genome 변경 제안, deferred 태스크 인계, 다음 세대 backlog을 기록하라
- `.reap/life/06-adaptation-retrospective.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Birth 단계로 진행하라고 안내하라
