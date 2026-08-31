---
id: ms-014
slug: v018-compat
title: 호환 — 차단 이중화와 0.17.8 다리
from: loop-0003-plan
refs:
  - ps-4b485d:03-compat.md
status: closed
openedAt: 2026-08-30T23:55:10Z
closedAt: 2026-08-31T14:06:16Z
---

## Background

loop-0003의 M2. 근거는 `ps-4b485d:03-compat.md`와 v0.18 브랜치 `docs/inherited/plugin-distribution.md` §9(0.17.8 다리 설계 — latest를 0.17.8에 두고 0.18은 `next` 태그, floor는 승격 대비 안전장치, upgrade agent가 이행 수행). 전제 확인: §9 설계가 사람의 "둘 다" 결정(latest 회피 + floor)과 정합. main의 check-version 코드는 온전(55c020d 기준). 발행은 전 구간 범위 밖.

## Exit Criteria

- v0.18 `package.json`에 `reap.autoUpdateMinVersion: "0.18.0"`이 있고, 배포 정책(0.18은 latest로 올리지 않는다 — `next` 태그)이 v0.18 문서에 명문화돼 있다
- 기능 대조 미결 6건(03-compat.md의 표)이 전부 판정돼 그 결과가 규율할 자리(spec·plan·backlog)에 반영됐고, 03-compat.md에 미결 표가 남아 있지 않다
- main에 0.17.8 다리 코드가 있다: 버전 확인이 **하루 한 번만** npm을 치고, `next` 태그에 0.18 이상이 있으면 자동 갱신 대신 이행 안내를 내며, `reap update`가 upgrade agent 설치로 넘긴다(네트워크 실패 시 중단·수동 안내)
- main에서 기존 테스트가 통과하고 다리의 새 동작에 테스트가 있다
- 발행된 것은 없다 — npm에 어떤 태그도 올라가지 않았다

## Out of Scope

- **발행 전부** — 0.17.8 publish, next 태그, latest 승격. 이 계획(ps-4b485d) 전체의 경계
- **upgrade agent 정의 파일의 완성** — §9는 "reap github repo에 두고 `reap update`가 받는다"고 정했다. agent 본문이 수행할 migration은 M3의 skill이 담당하므로, 여기서는 설치·안내 경로까지만 만들고 agent 본문은 M3 뒤에 채운다
- **설치 스크립트(curl | bash 현관, §10)** — 배포 단계의 일

## Plan Items

1. 기능 대조 6건 판정 — [tasks/1-feature-verdicts.md](tasks/1-feature-verdicts.md)
2. v0.18 차단 이중화 — [tasks/2-block-dual.md](tasks/2-block-dual.md)
3. 0.17.8 다리 구현 (main) — [tasks/3-bridge.md](tasks/3-bridge.md)
4. 검증 — [tasks/4-verify.md](tasks/4-verify.md)

## Constraints

- task 3은 **main 브랜치의 구 코드** 위에서 한다 — v0.18과 코드 스타일·구조가 다르며, 그쪽 관례(영어 주석·기존 테스트 형식)를 따른다
- 세대 기록은 계속 이 리포(정본), 산출 커밋 해시는 References에

## Open Questions

- 기능 대조 6건의 각 판정 — task 1이 위임 하에 근거와 함께 정하고 Dialogue에 남긴다
- 0.17.8의 "0.18 안내"가 읽을 자리 — §9는 latest 기준으로 썼으나 채택안에서 0.18은 `next`에 있다. `next` 태그 조회로 조정하는 것이 맞는지 task 3이 확인한다

## 이 milestone이 끝나면 물어볼 것

- 기능 6건의 판정 중 사람이 뒤집고 싶은 것이 있는가
- 0.17.8 다리를 구 코드 위에 얹는 작업의 마찰 — 구 코드를 더 건드릴 일이 남았는가
- floor·정책·다리의 삼중 차단이 과한가, 적정한가

## Fitness (2026-08-31, 사람)

1. 기능 6건 판정 — **"없다"** (뒤집을 것 없음, 확정)
2. 0.17.8 다리 — 처음엔 **"왜 얹는 거지? 어떤 모듈인지 알려달라"**: 차단만 하면 기존 사용자가 0.18의 존재를 모르게 되므로 latest에 앉을 0.17.8이 안내 방송국이라는 설명과 모듈 표를 제시 → **"이정도면 된다"**
3. 삼중 차단 — **"적정하다"**

읽기: 2의 질문은 결함이 아니라 설명 부족 — 다리의 존재 이유가 기록에는 있었지만 fitness 질문에 요약되지 않았다. milestone을 닫는 질문에는 산출물만이 아니라 그 존재 이유를 한 줄 붙일 것.
