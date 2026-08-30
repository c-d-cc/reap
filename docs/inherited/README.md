# v0.17에서 승계한 것

apocalypse 커밋이 지운 것 중 살아남을 가치가 판정된 것들 (근거: ps-4b485d 01-situation).

| 파일 | 무엇 | 쓰는 곳 |
|---|---|---|
| `plugin-distribution.md` | Claude Code plugin 실측 F1~F12 · 결정 9 · §9 0.17.8 이행 다리 · §10 설치 스크립트 현관과 바이너리 전환 실측 | M2(호환) 설계 |
| `ms-v018-plugin.md` · `ms-v018-knowledge.md` | 구 v0.18 milestone 둘 — 처분 사유의 기록 | 구 기획 정리 |
| `ref-uninstall-gen088.ts.txt` | 홈 자산 allowlist 제거 로직 (사용자 소유물 보존 원칙) | M3 migration skill |
| `ref-adapter-install.ts.txt` · `ref-adapter-settings.ts.txt` | 구 21파일 설치 경로와 settings.json 검증-후-쓰기 패턴 | M3 홈 자산 정리 |

`ref-*.ts.txt`는 **참조용 사본**이다 — 빌드·인덱스에 물리지 않게 확장자를 바꿔뒀고, M3가 로직을 새 구조로 다시 쓴다.
