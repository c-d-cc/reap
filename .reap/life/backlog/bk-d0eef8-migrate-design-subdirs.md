---
id: bk-d0eef8
slug: migrate-design-subdirs
type: fix
title: migrate 매핑 #6 — design 하위 디렉토리 문서군과 상호 상대 링크 처리 지침
createdAt: 2026-09-04T15:44:37Z
status: open
---

## 배경

selfview 실물 이주(2026-09-05)에서 `vision/design/team-mode/` 아래 문서 10개가 서로 상대 링크로 얽혀 있었다. migration-map #6은 "문서마다 `make idea --kind file`"이라고만 해 (1) 디렉토리를 하나로 볼지 문서 단위로 볼지, (2) 문서 단위로 쪼갰을 때 깨지는 상호 링크를 어떻게 하는지가 없었다. subagent가 문서 단위 18건으로 가고 doctor의 깨진 링크 12건을 손으로 고쳤다.

## 할 일

- #6에 지침: 하위 디렉토리는 문서 단위로 발급하되, 같은 디렉토리 문서군은 idea 본문 머리에 "원본 묶음: <디렉토리>"를 적고, 상호 상대 링크는 새 idea 파일명으로 고쳐 쓴다(doctor가 잡는다). 또는 묶음을 하나의 idea로 두고 하위 파일을 그 아래 디렉토리로 옮기는 안 — 둘 중 하나로 확정
- SKILL 3/8 분량 실측에서 design은 "디렉토리 수"가 아니라 "문서 수(find -type f)"로 세게
- #3 backlog: "frontmatter status를 믿지 말고 lineage와 대조해 이미 해소된 항목은 재발급하지 않는다"를 명시 — selfview에서 8건 중 8건이 이미 해소돼 있었다
