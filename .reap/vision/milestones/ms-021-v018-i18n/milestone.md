---
id: ms-021
slug: v018-i18n
title: en 전환 — CLI 메시지 카탈로그, skill·템플릿 en, README en/ko
from: loop-0004-plan
refs:
  - ps-5e948f:07-i18n-docs-delegate.md
status: open
openedAt: 2026-09-04T00:04:12Z
---
## Background

사람 Q2 답 B(2026-09-04): CLI 문자열과 skill을 en으로, ko는 번역 층. 규범은 [07-i18n-docs-delegate.md](../../../../docs/reap-plan/reap_v_0_18_release/07-i18n-docs-delegate.md)의 G9. genome의 문자열 규칙이 바뀐다.

## Exit Criteria

- `src/`의 사용자 문자열이 카탈로그를 거친다. en·ko 키 집합이 같다는 테스트가 있다. `config.language: ko`면 ko, 없으면 en, `.reap/` 밖에서는 `REAP_LANG`
- `bun test`에 한국어 리터럴 단언이 없다(`grep -P '[가-힣]' tests/*.ts`가 카탈로그 왕복 테스트 밖에서 0)
- skill 10종·`record-vocabulary.md`·씨앗 템플릿(`src/templates/*`)·`map.md` 씨앗이 en. `ctx`의 언어 줄이 `Response language: ko`
- `README.md` en · `README.ko.md` ko · `RELEASE_NOTES.md` en. `genome/application.md`의 문자열 규칙 갱신
- `detect-version.sh`·`verify-package.sh`·`hook.test.sh`의 사용자 출력 en
- 이 리포의 `.reap/` 실물(한국어 genome·map·기록)은 그대로 — 사용자 문서다
- 왕복 검증(ms-019 task 1)을 en 출력으로 다시 돌려 통과

## Out of Scope

- ja·zh-CN·de — 문서 사이트 확장과 함께 나중에. 카탈로그 구조는 추가 언어를 받을 수 있어야 한다
- 커밋 메시지 언어 — 한국어 유지
- 문서 사이트 — ms-022

## Plan Items

1. 카탈로그 + CLI·도구 문자열 전환 + 테스트 (tasks/1) — **ms-020 위임 모드의 실물 세대**
2. skill 10종·어휘·템플릿·씨앗 en (tasks/2)
3. README en/ko·RELEASE_NOTES·genome·스크립트 출력·왕복 재검증 (tasks/3)

## Constraints

- 카탈로그 키는 문장이 아니라 식별자(`make.title_required`) — 문장을 키로 쓰면 en을 고칠 때 ko가 끊긴다
- 번역은 의미 보존이 우선, 어투는 v0.17 en 문자열(`~/cdws/reap_v17/src/cli/commands/help.ts` 등)을 참고

## 이 milestone이 끝나면 물어볼 것

- ko 사용자가 en 전환을 느꼈는가 (ctx 언어 줄과 카탈로그가 그것을 막았는가)
- skill 본문 en이 agent의 한국어 답에 영향을 줬는가
