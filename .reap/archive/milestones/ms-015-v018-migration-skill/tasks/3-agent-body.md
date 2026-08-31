# 3 — upgrade agent 본문 (main)

main `docs/upgrade-agent/reap-upgrade.md`의 placeholder를 완성한다.

## 흐름

전제 확인(clean tree·node/npm) → `npm i -g @c-d-cc/reap@next` + `reap --version` 검증(실패 시 중단·수동 안내 — 절반 상태 금지) → 새 플러그인 설치 안내(마켓플레이스/승인) → **migration skill 호출**(`/reap:migrate`) → 완료 확인과 홈 자산 정리 안내

## 함정

- agent는 v0.17 환경에서 실행된다 — v0.18 skill 이름(`/reap:migrate`)은 새 플러그인 설치 *후*에만 존재. 순서를 어기면 없는 skill을 부른다
- main 커밋만, 발행 없음

## 완료 판정

placeholder 문구가 사라지고, main에서 기존 스위트 통과(문서 변경이라 회귀 없어야 정상)
