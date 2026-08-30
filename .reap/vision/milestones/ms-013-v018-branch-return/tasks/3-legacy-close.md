# 3 — 구 기획 정리 (reap 리포)

## 무엇을

- **ms-002 (지식 축 정리)** — 닫는다. 사유: exit criteria를 reap가 실현했다 (참조 체계→id.ts·carrier, idea/→reap idea/, memory 재설계→lessons.md, interview→interview skill). 구 reap CLI로 닫지 않는다 — **손으로** status를 고치고 커밋 메시지에 사유를 적는다
- **gen-101 / `feat/plugin-distribution` 브랜치** — 승계물이 task 1에서 이미 추출됐음을 확인한 뒤, 브랜치를 닫는다(삭제 또는 legacy 계열로 보존 — 사람에게 확인). 미커밋 수정 2건의 거취 포함
- **ms-001 (배포를 plugin으로)** — 통째로 닫지 않는다. plugin 전환·릴리즈 항목은 대체됐지만 **0.17.8 이행 다리 항목은 살아 있다**(M2로 승계). milestone 문서에 그 재편을 적는다

## 함정

- 이 작업의 커밋은 reap 리포의 **main**에 가는가 v0.18 브랜치에 가는가 — 구 기획 문서(.reap/vision/)는 main의 것이므로 main. 단 main에 커밋할 때 0.17.x 발행 라인을 더럽히지 않는지 확인 (문서만, 코드 무변경)

## 완료 판정

- reap 리포에서 ms-002가 closed, 닫는 커밋 메시지에 사유가 있다
- ms-001 문서가 재편됐다 — 대체된 항목과 살아남은 항목(0.17.8 다리)이 구분된다
- feat/plugin-distribution의 거취가 정해졌고 실행됐다
