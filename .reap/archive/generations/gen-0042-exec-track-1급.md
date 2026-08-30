---
id: gen-0042-exec
slug: track-1급
type: exec
milestone: ms-010
title: track을 1급으로 만든다
startedAt: 2026-08-23T06:24:18Z
startCommit: afb972b
status: closed
closedAt: 2026-08-23T06:29:11Z
endCommit: 0f379b1
---
## Intent

`ms-010`의 10.2와 10.3. **track이 spec에만 있고 도구에는 없다.** `plan/tracks/` 자리는 `gen-0041`이 만들었고, 여기서 그 자리를 채우는 명령을 만든다.

**끝나는 조건:**
- `reap make track --title "<t>"`가 `tr-<hash6>`를 발급하고 `plan/tracks/<tr-id>-<slug>.md`에 놓는다. 레지스트리는 없다
- `reap mark track <tr-id> --settled | --abandoned | --archived`. 앞의 둘은 표시, `--archived`는 이동만
- `reap make generation --plan --track <tr-id>`. **선택이고 `--plan` 전용**이다 — track은 plan 세대를 묶는 경계이므로

## Outcome

**track이 1급이 됐다.** `make track` · `mark track --settled|--abandoned|--archived` · `make generation --plan --track`이 전부 돈다.

- **`id.ts`** — `tr` 접두사, `HASH`, 레지스트리 없음. 정해지면 결론이 규율할 자리로 가고 track 자체는 사라지므로 번호를 영구히 점유할 이유가 없다
- **`doc.ts`** — `listEntries(root, "track")`이 `planTracks`와 `archiveTracks` 둘을 본다. 참조는 경로가 아니라 id이므로 archive된 것도 찾힌다
- **`entries.ts`** — `makeTrack` · `markTrack` · `resolveTrack`. `--archived`는 이동만 하고 `status`를 안 건드린다(backlog·generation과 같다)
- **`ctx.ts`** — 상태 줄에 `열린 track:` 줄. `status: open`인 것만 낸다

**cold start 앞단을 빈 리포에서 실제로 돌렸다** — `init` → `make track` → `make generation --plan --track` → `ctx`가 열린 track과 열린 세대를 함께 낸다.

## Dead Ends

**`closedAt` 하나로 뭉치려다 접었다.** milestone·generation과 형태가 같아 보였지만, track은 닫히는 것이 아니라 **정해지거나 접히는 것**이고 그 둘은 다른 일이다. 한 필드에 뭉치면 `status`를 봐야만 무슨 일이 있었는지 알 수 있다. `settledAt`과 `abandonedAt`으로 갈랐고 spec의 형식 블록에 반영했다.

## Notes

**`--track`을 `--plan` 전용으로 못 박았다.** track은 근거가 아니라 묶음이라 그것만으로는 세대가 열리지 않는다 — 근거는 *권한*(무엇을 만들지 이미 누군가 정했다는 증거)이고 plan은 *정하는 일 자체*라 요구할 근거가 없다. 테스트 둘이 이것을 지킨다.

**상태 줄에 track을 실은 것이 10.5의 전제다.** 이 줄이 없으면 `evolve`가 열린 track을 찾는 길이 디렉토리를 훑는 것뿐이고, 그러면 열려 있는 track이 조용히 잊힌다 — track이 막으려던 바로 그 실패다.

**검증:** `bun test` 127통과 · `typecheck` 0 · `hook.test.sh` 전부 통과 · 빈 리포 cold start 왕복.
