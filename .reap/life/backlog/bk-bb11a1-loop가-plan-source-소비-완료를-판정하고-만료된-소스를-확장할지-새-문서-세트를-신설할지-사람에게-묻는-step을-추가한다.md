---
id: bk-bb11a1
slug: loop가-plan-source-소비-완료를-판정하고-만료된-소스를-확장할지-새-문서-세트를-신설할지-사람에게-묻는-step을-추가한다
type: process
title: loop가 plan source 소비 완료를 판정하고, 만료된 소스를 확장할지 새 문서 세트를 신설할지 사람에게 묻는 step을 추가한다
createdAt: 2026-08-30T23:09:54Z
status: open
---

## 배경

loop-0003에서 계획을 ps-4f2a91에 쓰려다 사람이 막았다 — 그 소스는 소비 완료였고, 별도 문서 세트(ps-4b485d)를 신설했다. loop skill의 "plan source에 쓴다" 판단에는 **소스가 아직 살아 있는가**를 묻는 단계가 없어서, agent가 만료된 spec을 계속 확장할 뻔했다.

## 할 일

- loop skill(또는 `06-agent.md`의 쓰기 판단 여섯)에 **소비 완료 판정** 단계를 더한다: 이 loop의 산출이 기존 소스의 주제를 확장하는가, 아니면 소스가 이미 소비 완료여서 새 세트가 필요한가
- 판정이 애매하면 **사람에게 묻는다** (interview) — 확장이냐 신설이냐는 문서 체계의 사업 판단이다
- 소비 완료를 소스에 표시하는 방법(sources.yml의 상태 필드? convention의 수명 절?)도 함께 정한다
