# reap v0.18 — reap의 귀환

**상태:** loop-0003이 쓰는 중
**범위:** reap 리포에 v0.18 브랜치를 세우고, 호환 기능을 만들고, migration skill을 만드는 데까지. **배포(발행)는 범위 밖이다.**

REAP(`~/cdws/reap`)는 reap(`~/cdws/reap`)의 v0.18을 위해 별도로 만들어진 저장소다. 최소 구동 pipeline이 돌고 구조가 가벼워진 것이 확인됐으므로, 이제 reap 리포로 돌아간다.

## 읽는 순서

| | 무엇 |
|---|---|
| [01-situation.md](01-situation.md) | 실측한 상황과 확정된 결정 — 왜 이렇게 하는가 |
| [02-branch-return.md](02-branch-return.md) | M1: v0.18 브랜치 신설과 이식·개명 |
| [03-compat.md](03-compat.md) | M2: 자동 업데이트 차단과 기능 대조 |
| [04-migration-skill.md](04-migration-skill.md) | M3: v0.17 → v0.18 migration skill |

## 다른 문서와의 관계

- **`ps-4f2a91`**(`docs/superpowers/specs/reap/`)은 REAP 제품 spec이다 — 무엇이 참이어야 하는가. **소비 완료로 판정됐다**(2026-08-31, 사람). 이 세트는 그것을 확장하지 않고, 그 제품을 reap으로 되돌려 넣는 **작전**을 담는다
- reap 리포의 구 v0.18 기획(ms-001·ms-002·`vision/design/plugin-distribution.md`)의 처분은 [01-situation.md](01-situation.md)가 정한다

## 잘린 것

- M1 ([02-branch-return.md](02-branch-return.md)) → **ms-013** (2026-08-31, 닫힘)
- M2 ([03-compat.md](03-compat.md)) → **ms-014** (2026-08-31, 닫힘)
- M3 ([04-migration-skill.md](04-migration-skill.md)) → **ms-015** (2026-08-31)
