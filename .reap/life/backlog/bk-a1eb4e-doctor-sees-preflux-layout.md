---
id: bk-a1eb4e
slug: doctor-sees-preflux-layout
type: fix
title: doctor가 이주 전 레이아웃을 못 본다 — life/loops가 있어도 결함 0이다
createdAt: 2026-09-11T21:49:09Z
status: open
---

개명(2026-09-12) 뒤 실측한 것이다. 이주 안 된 프로젝트에서 `reap doctor`는 **결함 0**을 내고, `reap seq flux`는 0개를 내며, 상태 줄에는 열린 것이 **아예 안 나온다.**

원인은 `src/doctor.ts`가 끊긴 참조를 세기 전에 *id 형식이 아닌 것은 참조로 세지 않는다*고 거르는 데 있다. 옛 id는 이제 형식이 아니므로 `from:`이 그것을 가리켜도 안 센다.

**요란하게 깨지는 대신 조용히 사라진다.** 그리고 초록불이 "이주가 끝났다"로 읽힌다 — 안 돌린 프로젝트도 똑같이 초록이다.

할 일 — `life/`나 `archive/` 아래에 옛 이름의 디렉토리가 있거나 `sequence/`에 옛 레지스트리가 있으면 `doctor`가 **결함**으로 보고하고 `loop-to-flux` 스킬을 가리킨다. 이름을 바꾸는 일은 또 있을 수 있으므로 "옛 레이아웃이 남았다"를 일반화할지도 함께 본다.
