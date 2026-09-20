## sess-9bf47826 · 2026-09-21T09:40:00Z

**ms-022가 사람 검수 하나만 남기고 멈춰 있다.** 28쪽 전부 작성됐고 placeholder는 0이다
(`grep -c PlaceholderPage site/src/routes.ts`). milestone의 Exit Criteria가 *"사람 검수 —
이 milestone은 검수 전까지 닫지 않는다. handoff에 '검수 대기'로"* 라고 못 박은 그 검수다.

**검수할 8항목은 이 파일에 없다.** `gen-0124`가 milestone의 옛 `handoff.md`를 이리로 옮겼고,
사람 판단으로 그 절을 통째로 지웠다(2026-09-21). 되살리려면:

```
git show 6efafa3a^:.reap/vision/milestones/ms-022-v018-site/handoff.md
```

Claim과 Barrier · 설정 · Doctor · 비교 · orchestrate · skill 레퍼런스 · CLI 레퍼런스 ·
v0.17 이주 여덟 쪽을 각각 무엇과 대조할지가 거기 있다.

**검수하려면 사이트를 띄운다** — `npm run dev --prefix site`(5174). 이 세션이 확인했을 때
이미 떠 있었다(다른 세션의 Vite dev, 같은 리포).

### 미결 — Exit Criteria가 기각된 접근을 이름으로 부른다

ms-022의 **제목과 Exit Criteria가 여전히 "VitePress"**다. 2026-09-04에 사람이 기각했고
(기존 reap.cc 디자인·톤 유지, 내용만 v0.18), `Background`가 *"아래 Exit Criteria의 VitePress
항목은 07 G10대로 v0.17 앱 이식으로 읽는다"* 로 덮어쓰고 있다. **읽는 순서에 기대는 상태**라
Background를 건너뛴 사람은 없는 요구를 검사하게 된다. 검수 전에 제목과 Exit Criteria를
실물(`site/`, Vite+React+Tailwind+wouter, 28쪽)에 맞추는 편이 낫다 — 닫으면 그 제목 그대로
archive에 남는다.
