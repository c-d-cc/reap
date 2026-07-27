# Completion

## Summary

**Goal**: REAP 이 설치한 agent 정의가 OpenCode 를 동작 불능으로 만드는 문제 수정. 0.17.3 묶음 4/5.

**결과**: 완료. 유저 환경 복구됨.

**핵심 변경**: `src/adapters/opencode/install.ts` — `toOpenCodeAgent()` 로 frontmatter 를 OpenCode 스키마로 변환한 뒤 write. claude-code 는 무변경.

**검증**: 게이트 4종 pass / unit 470-0 / e2e **278-0**(+6) / scenario 44-0 / 실환경 `opencode agent list` 정상

## Lessons Learned

### 잘 된 것 — 문서 대조에 멈추지 않고 실측했다

backlog 는 OpenCode 문서와 대조해 "5개 필드 중 4개가 틀렸다"고 적었다. 실측하니 **오류를 내는 것은 `tools` 하나**였고, 나머지는 무시된다.

수정 내용은 결과적으로 같았지만(어차피 정리했으므로), **심각도와 우선순위 판단이 달라질 수 있었다.** 문서에 없는 필드가 곧 오류는 아니다.

그리고 실측이 더 나은 설계를 줬다 — `tools` 를 record 로만 바꿔도 되지만 그건 deprecated 필드이고, `permission` 이 현행임을 probe 로 확인해 그쪽을 택했다. **deprecated 를 따라가는 것이 이번 사고의 원인과 같은 계열**이다.

### 잘 된 것 — 재현 명령을 바로잡았다

`opencode auth list` 로는 재현되지 않았다. agent 를 로드하지 않기 때문이다. 하마터면 **"재현 불가"로 결론내고 유저가 겪은 실제 버그를 없는 것으로 처리할 뻔했다.**

`agent list` 로 바꾸자 정확한 오류 메시지가 나왔고 원인이 한 번에 확정됐다. **비슷해 보이는 다른 명령으로는 버그가 숨는다** — 사용자가 실제로 실행한 경로를 재현해야 한다.

### 개선점 — 표식이 사용자 파일로 새어나갔다

carrier 주석을 3줄(내부 경로 포함)로 템플릿에 넣었더니 **변환된 파일 본문에 그대로 들어가 사용자가 `src/adapters/...` 를 보게 됐다.**

표식은 개발자용이지만 **그 파일이 사용자에게 배포된다면 사용자 관점에서도 무해해야 한다.** 한 줄로 줄이고 설명은 코드로 옮겼다. gen-078 에서 carrier 를 도입할 때 "어디에 붙이는가"만 생각하고 "그게 어디로 흘러가는가"는 보지 않았다.

### 개선점 — 예고된 갭이 하루 만에 사고가 됐다

gen-079 는 층2 검증을 만들며 deferred 에 적었다:

> **OpenCode adapter 검증** — 같은 구조로 확장 가능하나 `opencode` CLI 의 헤드리스 지원 여부를 확인하지 않았다. **adapter 가 둘이므로 갭도 둘이다.**

**바로 그 갭에서 사고가 났다.** 그것도 REAP 이 사용자의 다른 도구를 멈추는 형태로.

gen-063/064/066 의 검증은 전부 "파일이 올바른 위치에 놓이는가"였고, **"그 파일을 클라이언트가 읽을 수 있는가"는 한 번도 확인되지 않았다.** 층2 를 만들면서 한쪽만 덮은 것이 대가를 치렀다.

deferred 는 "나중에 해도 되는 것"이 아니라 **"지금 위험이 열려 있다는 기록"** 이다.

## Next Generation Hints

1. **(b) opencode 샌드박스 검증** — 유저 지시의 다음 단계. 본 세대가 선행 조건이었고 충족됐다(REAP 설치가 더 이상 opencode 를 깨뜨리지 않음). OpenShell 게이트웨이 동작 중, opencode 로그인 완료(`auth.json` 전달 가능)
2. **0.17.3 릴리즈** — (b) 완료 후 릴리즈 노트에 gen-077~081 일괄 보강 → 태그
3. 이후: `ci-에서-테스트-실행` / interview 재설계 / daemon 2건

## Change Proposals

### genome 변경 없음

본 세대 교훈("문서 대조 ≠ 실측", "재현 명령을 바로잡아라")은 기존 원칙의 적용이다 — evolution.md § "검사를 만들 때 — 먼저 실패시켜라", longterm 의 "Check, don't reason about it".

`evolution.md` 는 270줄/임계 300 으로 여유 30줄이다. 중복 추가를 피한다.

### 신규 backlog 없음

deferred 2건(설치 시 파싱 검증, 잔재 정리)은 실질 위험이 낮아 hints 에도 올리지 않는다. gen-078 의 "hints 는 backlog 가 아니다" 교훈에 따라, 실제로 착수할 것이면 그때 backlog 화한다.

### 정리 필요 — 임시 파일

`/tmp/reap-agent-quarantine/` (구 형식 백업), `/tmp/oc-test`, `/tmp/oc-schema-test` 가 남아 있다. 유저 환경은 이미 복구됐으므로 삭제해도 무방하다.
