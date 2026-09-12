---
id: bk-9f35e6
slug: v0-18이-v0-17-저장소를-알아보게-doctor-ctx-쓰기가-이주를
type: migrate
title: v0.18이 v0.17 저장소를 알아보게 — doctor·ctx·쓰기가 이주를 가리키고 detect-version이 섞임을 잡는다
createdAt: 2026-09-12T04:15:46Z
status: consumed
consumedBy: gen-0119-exec
---

probe(2026-09-12, 이 리포 픽스처)로 확인했다. v0.17 형태 `.reap/`에 v0.18 바이너리를 물리면:

- `reap ctx`가 정상으로 읽고 상태 줄에 `vision/memory/{longterm,midterm,shortterm}.md`를 "기억"으로 싣는다
- `reap doctor`가 `결함 0 · 참고 0`을 답한다
- `make backlog`·`make flux`·`make milestone`이 전부 exit 0으로 통과해 `life/flux/`·`sequence/flux.md`·`vision/milestones/ms-001/`을 v0.17 저장소 안에 만든다
- 섞인 뒤에도 `detect-version.sh`는 `v017`을 답한다 — v18 마커가 `map.md`·`sequence/generation.md` 둘뿐이라 `sequence/flux.md`·`life/flux/`가 안 걸린다
- 그 판정을 받은 migrate 4/8이 `git mv .reap .reap-v0_17`로 디렉토리째 옮기므로, 섞인 기간의 v0.18 산출물이 격리 디렉토리로 함께 끌려간다. 파괴는 아니지만 사용자 눈에서 사라진다

`grep -rn "current\.yml|lineage|shortterm" src/`에 판정 코드가 없다. 주석 한 줄뿐이다. 있는 것은 `cli.ts:92`의 명령 **이름** shim 하나이고, 그나마 `reap setup`이 옛 훅을 새 훅으로 갈아치우면 그 문구도 사라진다.

판정 로직은 `plugin/skills/migrate/scripts/detect-version.sh`에 이미 있다(마커 다섯, v017·v018·mixed·none·unknown). CLI가 안 쓸 뿐이다.

무엇이 참이어야 하는가:

- `doctor`가 v0.17 구조를 결함으로 보고하고 migrate를 가리킨다
- `ctx`가 상태 줄 대신(또는 앞에) 같은 사실을 말한다 — agent가 정상인 줄 알고 작업을 시작하지 않게
- 쓰기 명령(`make`·`mark`)이 v0.17 저장소에서 멈춘다. 섞임은 사후 탐지가 아니라 애초에 막는 것이 근본
- `detect-version.sh`의 v18 마커가 넓어져 섞인 상태가 `mixed`로 잡힌다
- 탐지 기준이 두 곳(CLI·스크립트)에 각각 살지 않는다

이것은 0.17 발행 여부와도 latest·next 선택과도 무관하다. 어느 쪽을 골라도 선행되어야 한다 (reap-v17 세션과 합의, 2026-09-12).
