---
id: gen-012-856e91
type: embryo
goal: "tests/ submodule 설정 — reap-test repo self-evolve branch"
parents: ["gen-011-4a835c"]
---
# gen-012-856e91
tests/ submodule 설정 완료. reap-test repo에 self-evolve branch 생성, reap 프로젝트에 submodule 추가.

### Changes
- reap-test repo: self-evolve branch (main에서 분기), unit/e2e/scenario 구조
- `.gitmodules`: tests submodule 설정
- `.npmignore`: tests/ 추가

### Validation: PASS (typecheck, build, e2e 62/62)