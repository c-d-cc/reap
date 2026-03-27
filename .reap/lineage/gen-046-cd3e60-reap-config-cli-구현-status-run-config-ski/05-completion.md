# Completion — gen-046-cd3e60

## Summary

`reap config` CLI 명령을 구현하고, 3개 skill 파일(reap.config, reap.status, reap.run)을 정비했다.

### 주요 변경
- `src/cli/commands/config.ts` — 신규: config.yml 읽기 + JSON 출력
- `src/cli/index.ts` — config 명령 라우팅 추가
- `src/adapters/claude-code/skills/reap.config.md` — disable-model-invocation 제거, AI 안내 추가
- `src/adapters/claude-code/skills/reap.status.md` — disable-model-invocation 제거, 결과 해석 안내
- `src/adapters/claude-code/skills/reap.run.md` — disable-model-invocation 제거, 사용법 안내
- `tests/e2e/cli-commands.test.ts` — config 테스트 2개 추가

테스트: 454 pass (기존 452 + 2 신규)

## Lessons Learned

- status.ts 패턴을 그대로 따라가니 config.ts 구현이 매우 빠르게 완료됨. 기존 패턴 일관성의 가치.
- skill 파일의 `disable-model-invocation`은 AI가 결과를 해석하지 못하게 만드므로, 정보 조회 계열 명령에는 적합하지 않다. 이 설정은 부작용이 있는 명령(예: 파일 수정)에만 쓰여야 할 것.

## Next Generation Hints

- environment/summary.md의 CLI Commands 섹션에 config 명령 추가가 필요 (이번 generation reflect에서 처리).
- reap-guide.md의 "CLI Commands" 섹션에도 `reap config` 추가를 고려할 수 있음.
- config.yml의 legacy 필드(strict, autoIssueReport 등)가 아직 남아있어, config 출력 시 undefined로 표시되는 필드가 있음. `reap update`로 변환하면 해결됨.
