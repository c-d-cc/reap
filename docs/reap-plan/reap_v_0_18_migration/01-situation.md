# 상황과 결정

실측은 2026-08-31, reap v0.17.7 (`feat/plugin-distribution` 포함)과 reap (gen-0060까지) 기준이다.

## reap의 현재

- npm `@c-d-cc/reap` 0.17.7. CLI 21명령 + slash command 19 + agent 2 + SessionStart 훅. 저장은 `.reap/`
- **자동 업데이트 기제 (실측):** SessionStart 훅이 `reap check-version`을 실행 → `npm view @c-d-cc/reap version`(= **latest** dist-tag)과 `npm view @c-d-cc/reap reap.autoUpdateMinVersion`(floor, **latest의 metadata에서** 읽음)을 질의 → ①버전 판독 가능 ②latest가 더 새것 ③floor 통과 ④`autoUpdate!=false` ⑤전역 설치 — 다섯이 서면 `npm install -g @c-d-cc/reap@latest`를 실행한다 (`src/cli/commands/check-version.ts`)
- **migration instruction layer (v0.17.1~):** 패키지의 `migration/vX.Y.Z.md`를 프로젝트의 `lastMigratedVersion`과 비교해 세션에 이행 안내를 주입한다. 0.17 사용자에게 0.18 존재를 알릴 유일한 자동 통로다

## reap 리포의 구 v0.18 기획 — 처분

reap 리포에는 reap 이전에 세운 v0.18 기획이 있다. reap가 그 목표 대부분을 이미 실현했으므로 다음과 같이 처분한다 (사람, 2026-08-31).

| 자산 | 처분 | 이유 |
|---|---|---|
| ms-002 (지식 축 정리) | **닫는다** | exit criteria(참조 체계·idea/·memory 재설계·interview)를 reap가 실현 |
| ms-001의 plugin 전환 구현 (gen-101, `feat/plugin-distribution`) | **닫는다** | reap의 `plugin/`이 대체 |
| `vision/design/plugin-distribution.md`의 **실측 F1~F12** | **승계** | Claude Code plugin 동작의 실측 사실 — reap plugin 배포에도 그대로 유효 |
| ms-001의 **0.17.8 이행 다리** 설계 | **승계** | 0.17 사용자에게 안내를 전달할 통로. "0.18보다 먼저 발행"이라는 순서 제약 포함 |
| `reap uninstall` (gen-088) | **승계** | 홈 자산·settings 키를 제거하는 유일한 완전 제거 경로. migration skill이 재사용 |

## 확정된 결정 (loop-0003 Dialogue, 2026-08-31)

1. **이름은 reap으로 완전 통일한다.** CLI `reap` · 플러그인 `reap` · skill `/reap:*` · 저장소 **`.reap/`**. reap라는 이름은 개발 리포에만 남는다. 같은 `.reap/` 자리를 신구 버전이 공유하므로 이름 충돌 처리는 migration skill의 책임이 된다 ([04-migration-skill.md](04-migration-skill.md))
2. **자동 업데이트 차단은 이중이다.** ①0.18을 npm **latest로 올리지 않는다**(차단의 원천 — auto-update는 latest만 본다) ②0.18의 package.json `reap.autoUpdateMinVersion`을 0.18.0으로 상향한다(사고로 latest가 되어도 자동 설치 대신 blocked 경고). 안내 전달은 0.17.8 다리의 몫이다
3. **이식은 스냅샷이다.** reap 작업 트리를 v0.18 브랜치에 한 커밋으로 싣는다. 히스토리 병합(추천안)은 기각됐다 — `.reap/` 기록의 startCommit·endCommit 해시 참조가 끊기는 것은 **인지한 대가**이며, 그 기록의 해시는 reap 리포에서만 유효하다고 명시한다
4. **ps-4f2a91은 소비 완료다.** 이 계획은 그것을 확장하지 않고 이 문서 세트가 담는다
