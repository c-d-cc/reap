# 3 — 0.17.8 다리 (main 브랜치)

§9 설계(docs/inherited/plugin-distribution.md — v0.18 브랜치에 있음)를 main 구 코드에 구현한다. 발행은 하지 않는다.

## 무엇을

1. **일일 캐시** — check-version의 npm 조회(매 세션 0.34~1.2초 실측)를 하루 1회로. 캐시 위치는 `~/.reap/`(홈) — 프로젝트에 파일을 늘리지 않는다
2. **0.18 안내** — `next` 태그에 0.18 이상이 있으면 "자동으로 올라가지 않는다, `/reap.update`를 쳐라"를 안내. §9의 원문은 latest 기준이었으나 채택안(0.18=next)에 맞게 조정 — 조정 사실을 §9에 각주로
3. **`reap update`의 upgrade agent 경로** — agent 정의 파일을 받아 사용자 레벨 agent로 설치하고 안내. **네트워크 실패 시 중단하고 수동 안내**(절반 상태 금지). agent 본문은 자리만(M3 뒤 완성) — 본문 없이도 설치 경로가 테스트 가능해야 한다

## 함정

- main의 tests/는 사설 서브모듈이다 — 로컬에 populated돼 있고, 새 테스트를 거기 커밋하면 서브모듈 포인터 갱신이 따라온다. 커밋·푸시는 로컬까지만(발행·푸시 범위 밖)
- version bump(0.17.8)는 하지 않는다 — bump는 발행 절차(reapdev.versionBump)의 일
- 구 코드의 기존 캐시·데몬 잔재와 섞이지 않게 — update.ts의 removeRetiredDaemonData 같은 기존 경로를 건드리지 않는다

## 완료 판정

main에서 기존 스위트 + 새 동작 테스트 통과. 발행·bump 없음
