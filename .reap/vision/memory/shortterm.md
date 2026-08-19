# Shortterm Memory

## 세션 요약 (gen-088, 2026-08-20)

### `reap uninstall` — npm 이 안 해 주는 제거를 REAP 이 한다

`npm uninstall -g` 는 패키지와 bin 링크만 지운다. 홈의 것들(slash 19 · agent 2 · settings.json
엔트리 2 · `~/.reap/`)은 REAP 코드가 쓴 것이고 npm 은 모른다. 그리고 **걸 수 있는 훅이 없다** —
`pre/postuninstall` 은 npm 10·12 어디서도 실행되지 않는다(측정됨).

한 명령이 순서를 안다: 진입 훅 우회 → daemon stop(비기동) → 양 adapter 홈 자산 →
`~/.reap/` **allowlist** → npm(전역 확신 시에만). `npx @c-d-cc/reap uninstall` 이 회수 경로다.

### 두 번 같은 함정에 빠졌고 두 번 다 negative 가 잡았다

**부재만 보는 단언은 두 상태를 구분하지 못한다.** npx 테스트는 진입 훅 우회를 없애도 green 이었고
(훅이 깔아도 uninstall 이 스탬프까지 지워 최종 상태가 같다), daemon 테스트의 `daemonStopped === null`
은 **못 뜬 daemon 도 null 을 준다**. 구분자를 각각 "재설치만이 만드는 디렉토리"와 "경과 시간"으로 바꿨다.

**negative 는 단독으로도 돌려야 한다** — daemon 쪽은 파일 전체 실행에서 다른 테스트가 대신 빨개져
자기 단언이 무력한 것이 가려졌다.

### 자기진단 게이트가 배포본을 진단하고 있었다

postinstall 의 auto-update 가 `npm install -g @latest` 를 돌리고, npm 이 `npm_config_prefix` 를
물려주므로 그 재설치가 격리 prefix 로 들어가 방금 설치한 tarball 을 덮어썼다. sha 3종 비교로 확인.

고치면서 **다음 릴리즈를 red 로 만들었고 evaluator 가 잡았다** — CI 는 `.dev-build` 를 안 찍어
`+dev` 조기 반환이 사라지고, `installed === latest` 판정이 **미배포 상위 버전을 다운그레이드**한다.
`release.yml` 은 게이트를 publish 앞에서 돌린다. `hasNewerRelease` = `semverGt(latest, installed)` 로 수정.

### 지금 상태

- unit **600** (568→) / e2e **302** (292→) / scenario 44 / daemon 130, 전부 0 fail
- 게이트 전 절 통과 (§ 8 신설), 실측 **14~18초**. 문서 게이트·vite build 통과
- `fix --check` 0 error / 4 warning — lineage parent 2 + longterm + `environment/summary.md` **313줄**
- `package.json` **0.17.5 유지**. push·tag·publish 없음. **로컬 macOS 에서만 돌았다**

### 다음 세션이 알아야 할 것

- **gen-088 은 0.17.6 대상이다** (midterm 참조 — 0.17.5 는 이미 발행됐고 gen-083~087 이 그 안에 있다).
  이 세대는 **버전을 올리지 않았다.** bump 시 `check-docs-version.sh` 가 RELEASE_NOTES / NOTICE /
  5 로케일 changelog 를 `package.json` 과 맞추라고 요구한다 — gen-088 분량을 새로 써야 한다
- **fitness evaluator 가 midterm 의 옛 서술("아무것도 발행되지 않았다")을 반증했다.** 직접 확인:
  `latest` = 0.17.5, 태그 = 현재 HEAD, 배포 번들에 gen-087 코드 있음. 그 문단은 이후 갱신됐다
- **daemon 폐기 결정(midterm)과 이 세대의 관계**: `reap uninstall` 은 `~/.reap/daemon/` 과
  `@c-d-cc/reap-daemon` 전역 패키지를 지운다. 폐기 이후에도 **이미 설치한 사용자에게는 그 제거가 필요**하므로
  경로는 그대로 유효하다. 다만 `npmRemovalTargets` / `DaemonAvailability` 의존은 indexer 내장 시
  **함께 손봐야 하는 지점**이다

- **backlog 1건 pending 신설**: `auto-update-가-path-의-reap-버전을-읽는다-…md`.
  게이트 쪽은 막혔고 다운그레이드도 고쳤지만, `getInstalledVersion()` 이 PATH 를 읽는 것은 그대로다 —
  **로컬 설치 사용자가 전역 설치를 자기도 모르게 업그레이드당한다**
- **`reap daemon status` 도 보고하려고 daemon 을 띄운다.** D2 는 `stop` 만 고쳤다
- **내 실험이 개발자의 전역 reap 을 0.17.4 → 0.17.5 로 올렸다.** auto-update 가 실제로 발화한 결과다
- **격리 없이 `uninstall --confirm` 을 한 번 돌려 실제 홈을 지웠다.** gen-087 self-heal 이 복구했고
  `~/.reap/` 의 private key 는 allowlist 덕에 살아남았다
- `environment/summary.md` 313줄 — 이번에 낡은 서술 1건을 실측으로 교체하고 새 절을 압축했으나
  근본은 여전히 **처방적 서술을 genome 으로 옮기는 작업**이다
