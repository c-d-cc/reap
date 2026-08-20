---
id: gen-073-cfbb45
type: embryo
goal: "release 직전 문서-버전 일치 검증 script 신설 + reap.cc 문서에 0.17.1/0.17.2 반영 + 로케일 drift 보정"
parents: ["gen-072-66bfbb"]
---
# gen-073-cfbb45
**Goal**: 0.17.2 를 깨끗이 릴리즈 가능한 상태로 만들고, 문서 누락이 재발하지 않도록 검증 장치를 릴리즈 경로에 심는다.

**결과**: 완전 구현. 세 축 모두 완료.

| 축 | 내용 |
|---|---|
| 소급 반영 | 5 로케일 changelog 에 0.17.2 + 0.17.1 추가, ja/de/zh-CN 의 0.16.5 누락 보정 → 전부 20 항목. `RELEASE_NOTES.md` 승격 |
| 오도 제거 | reap.cc 가 가르치던 폐기 lifespan 분류를 content-type + pruning 으로 교체 (**2곳 × 5 로케일 = 10개 위치**) |
| 재발 방지 | `scripts/check-docs-version.sh` 신규 + release.yml publish 전 게이트 + versionBump skill Step 5-1 |

**검증**: typecheck pass / CLI build 0.77MB / docs vite build 성공 / 문서 검증 전건 통과 / unit 454-0 / e2e 263-1 / scenario 35-5 (뒤 둘 pre-existing, baseline 동일)