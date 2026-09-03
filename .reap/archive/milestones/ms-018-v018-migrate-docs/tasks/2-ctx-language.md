# 2 — ctx 언어 줄

`src/ctx.ts`: 상태 줄 조립 앞에 `config.language`가 비어 있지 않으면 `응답 언어: ${language}` 한 줄. `ctx --hook`의 JSON 본문에도 같은 줄. 테스트: 있음/없음 두 케이스. `tests/hook.test.sh`의 "정상 프로젝트"가 여전히 통과.
