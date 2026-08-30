# 1 — 승계물 추출과 apocalypse·snapshot

## 먼저 묻는다

milestone의 Open Questions 둘(.reap 기록의 이식 여부 · v0.18 브랜치의 자기관리 방식)을 interview로 사람에게 묻고 시작한다. 답이 스냅샷의 내용물을 정한다.

## 순서

1. **승계물 추출** — apocalypse가 지우기 전에 브랜치 밖으로 보존한다:
   - `vision/design/plugin-distribution.md` — §10(설치 스크립트 현관·바이너리 전환 실측) 포함본이 `feat/plugin-distribution`의 **f6ac48c**로 커밋됐다 (2026-08-31 cleanup). 그 커밋본을 가져온다
   - v018 milestone 문서 둘 (f6ac48c에 수정 포함)
   - `src/cli/commands/uninstall.ts`와 그 의존 (gen-088) — M3가 참조할 로직
   - 0.17.8 다리 설계 (ms-001 본문의 해당 절)
2. `main`에서 `v0.18` 브랜치 생성
3. **apocalypse commit** — 추적 파일 전부 삭제. 커밋 메시지가 "왜 전부 지우는가"를 적는다
4. **snapshot commit** — reap의 `git ls-files` 기준 트리를 적재. 메시지에 출처(reap 리포·마지막 커밋 해시)를 적는다
5. 승계물을 브랜치의 자리(예: `docs/inherited/`)에 커밋

## 함정

- 스냅샷은 **git 추적 파일 기준**이다 — `dist/reap`(89MB)·`node_modules`·`.reap/.index`는 싣지 않는다. reap 쪽 `.tgz` 4개·`node_modules`도 apocalypse 대상인지 확인 (비추적이면 커밋에 안 잡힌다 — 트리에서 따로 지운다)
- reap 리포의 `.reap/`(구 v0.17 자기관리 데이터)를 apocalypse가 지우는가 — **지운다면 그 자체가 v0.17→v0.18 migration의 첫 실전 사례다.** 사람에게 확인
- `feat/plugin-distribution` 브랜치는 여기서 건드리지 않는다 (task 3)

## 완료 판정

- `git log v0.18 --oneline`에 apocalypse·snapshot·승계물 커밋이 이 순서로 있다
- 브랜치 트리에서 `bun test`가 돈다 (개명 전이므로 이름은 아직 reap)
