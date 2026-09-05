# 1 — `reap setup`, init 연동, doctor 참고, v0.17 명령 shim

- `src/setup.ts`: `setup(runner)` — `claude` 존재 확인 → `claude plugin marketplace list`에 `ctod-plugins` 없으면 `claude plugin marketplace add c-d-cc/plugins` → `claude plugin list`에 `reap@ctod-plugins` 없으면 `claude plugin install reap@ctod-plugins -y`. 결과는 무엇을 했고 무엇이 이미 있었는지 한 줄씩. `claude` 없으면 ok:false + 안내. runner는 주입(테스트)
- `init`: 설치하지 않는다 — 플러그인이 감지되지 않으면(`settings.json` `enabledPlugins`) `reap setup` 안내 한 줄만 붙인다. init이 홈을 건드리면 `bun test`가 개발 머신에 플러그인을 깔게 된다(v0.17 자체 설치 교훈)
- `doctor`: `~/.claude/settings.json` `enabledPlugins`에 `reap@`로 시작하는 항목이 없으면 참고 `plugin_missing`
- `cli.ts`: `check-version`·`load-context`·`update`·`run`·`status`·`install-skills` → `cli.legacy_command` 메시지, exit 0 (훅이 부르는 둘은 stdout이 세션 문맥으로 들어간다)
- 메시지는 en·ko 카탈로그. 사용법에 `setup` 줄
- 테스트: setup(가짜 runner 4케이스), legacy shim, doctor 참고(HOME 임시)
