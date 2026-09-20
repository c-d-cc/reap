---
id: bk-b53de4
slug: marketplace-vendored
type: structure
title: 마켓플레이스가 플러그인 파일을 직접 싣는다 — submodule은 codex에서 빈 디렉토리다
from: gen-0121-exec
createdAt: 2026-09-20T05:09:06Z
status: open
---

`c-d-cc/plugins`(`~/cdws/ctod-plugins`)의 일이다 — 이 리포가 아니다. 규범은 `ps-4f2a91`의 `08-delivery.md`에 이미 반영됐다.

## 왜

codex는 Git 마켓플레이스를 `clone --filter=blob:none --no-checkout` + `sparse-checkout`으로 받고 **submodule을 가져오지 않는다.** gen-0121에서 원격 `c-d-cc/plugins`를 실제로 등록해 확인했다 — `marketplace.json`은 읽히고 플러그인 항목도 목록에 뜨는데 `plugins/reap2/`가 빈 디렉토리였다. **실체 없는 설치가 성공으로 보고된다.**

Claude Code가 GitHub 경유로 submodule을 가져오는지는 **확인하지 못했다.** 이 환경의 `ctod-plugins`는 `~/.claude/settings.json`에 로컬 디렉토리로 선언돼 있어 GitHub 경로가 한 번도 쓰인 적이 없고, 같은 이름으로 다시 등록하려 하자 소스 불일치로 거부됐다. 즉 **submodule 경로는 어느 호스트에서도 통과한 적이 없다.**

## 해야 할 것

- `.gitmodules`와 `plugins/reap` submodule을 걷어내고 그 자리에 `plugin/`의 파일을 그대로 넣는다. `marketplace.json`의 `source`는 그에 맞춰 조정한다
- **복사를 사람 손에 맡기지 않는다.** 릴리스가 이 리포의 `plugin/`을 저쪽으로 옮기게 한다 — `release.yml`에서 밀든, 저쪽에서 당기든 한쪽을 고른다
- 그 뒤 codex에서 `codex plugin marketplace add c-d-cc/plugins` → `codex plugin add reap@ctod-plugins`가 **실제로 설치되는지** 확인한다. gen-0121은 이 지점에서 막혀 실패를 봤다
- Claude Code 쪽도 GitHub 경유로 한 번 통과시켜 본다. 로컬 디렉토리 선언만으로는 배포 경로가 검증되지 않는다

## 지금 막혀 있는 것

원격 `c-d-cc/plugins`는 아직 reap2 시절 상태다(로컬이 1 커밋 앞서고 push 보류). 이 항목을 하기 전에 그 push를 사람이 결정해야 한다.
