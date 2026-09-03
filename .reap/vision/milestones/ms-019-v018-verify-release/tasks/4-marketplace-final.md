# 4 — 마켓플레이스와 최종 체크

`~/cdws/ctod-plugins`: `.gitmodules`의 `plugins/reap2` → `plugins/reap`(url c-d-cc/reap), marketplace.json 항목 name `reap`·source `./plugins/reap/plugin`, `tools/validate_marketplace.py` 통과. **submodule은 push된 커밋만 싣는다** — v0.18이 아직 origin에 없으면 포인터를 옮길 수 없다. 그 경우 `.gitmodules`·marketplace.json까지만 준비하고 포인터는 push 뒤의 일로 06-release에 적는다. Q5의 답 전이면 커밋하지 않는다.

최종: 06-release "발행 직전 체크" 명령을 전부 실제로 돌려 출력을 세대 기록에 붙인다. `docs/release-policy.md`와 06이 어긋나면 06을 고친다(정책은 policy가 소유).
