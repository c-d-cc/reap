# Learning — gen-012-856e91

## Source Backlog
`tests-submodule.md` — tests/ 폴더를 git submodule로 분리 (reap-test repo, self-evolve branch)

## Key Findings
- v0.15: `.gitmodules`에 `[submodule "tests"]` path=tests, url=https://github.com/c-d-cc/reap-test.git
- reap-test repo: main branch만 존재 (v0.15 테스트). self-evolve branch 생성 필요.
- v0.16 현재: tests/ 디렉토리 없음. scripts/e2e-*.sh 4개가 프로젝트 루트에 존재.
- GitHub auth: casamia918 계정으로 인증됨.

## Plan
1. reap-test repo에 self-evolve branch 생성 + 초기 구조 push
2. reap 프로젝트에 git submodule add (self-evolve branch)
3. .npmignore에 tests/ 추가 (npm 배포에 포함시키지 않음)

## Clarity Level: High
