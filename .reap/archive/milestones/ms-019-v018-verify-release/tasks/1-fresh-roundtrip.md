# 1 — 새 프로젝트 왕복

scratchpad에 `prefix/`(npm 전역 임시)와 `proj/`(빈 git 리포). `npm pack` → `npm i -g --prefix prefix <tgz>` → `PATH=prefix/bin:$(PATH에서 bun 제거)`. `reap --version` · `reap init` · `reap make loop/milestone/generation` · `reap ctx --hook`이 JSON을 내고 · `reap doctor` 0.

skill 경유는 `claude -p --plugin-dir ./plugin "…"` 비대화 실행으로 `/reap:evolve`가 세대를 여는지 본다. 비대화가 불가하면 그 사실과 대안(사람이 대화 세션에서 확인)을 기록.

함정: 훅은 세션 시작에 읽힌다 — `--plugin-dir`로 띄운 세션의 첫 출력에 상태 줄이 있는지가 훅 검증이다.
