# Shortterm Memory

## 세션 요약 (gen-075, 2026-07-26)

### gen-075: genome 크기 threshold 재설계 — 0.17.2 마지막 작업

threshold 100 이 배포 evolution.md(193줄)보다 작아 `reap init` 직후부터 warning 이 뜨던 문제. **파일별 threshold + 근거 명시**로 재설계 (application 250 / evolution 300 / invariants 50).

문제를 "수치가 작다"가 아니라 **"근거가 없다"** 로 정의한 것이 핵심. 각 수치를 "그 파일이 무엇을 담는가"에서 도출하고 코드 주석 + `reap-guide.md` § File Size Guidelines 에 남겼다.

부수: docs 의 `summary.md ~100 lines` 가 코드값(250)과 불일치 → 5 로케일 수정. gen-073 이 추가한 **carrier 4중 확인(docs 포함)이 실제로 잡아낸 사례**.

**0.17.2 릴리즈 노트 보강 완료** — `RELEASE_NOTICE.md` en/ko + `RELEASE_NOTES.md` + docs 5 로케일에 gen-073/074/075 내용 반영. 문서 게이트 통과.

검증: unit **461-0**(+7) / e2e 263-1(pre-existing) / scenario 44-0.

### 다음 세션 — 0.17.2 릴리즈부터

1. **릴리즈** — 문서·노트 모두 정합. `git tag v0.17.2 && git push origin main v0.17.2` (**유저 확인 필수**). 이후 issue #21 코멘트 + close
2. **interview 기능** (backlog, 0.18.0) — 3건 orchestrate 의 마지막
3. daemon 2건은 유저 보류

### 미결 사항

- **e2e `init-repair` 1 fail — 4세대째 pre-existing.** gen-072~075 연속. scenario 5건도 같은 경로를 밟다 gen-074 에서 고쳤다. backlog 화 권장
- **`genome/evolution.md` 여유 30줄** (270/300). 규칙 추가 전 기존과 중복 확인할 것 — 임계를 다시 올릴 신호가 아니다

### Backlog 상태

pending 3건 — interview / daemon 2건(보류).
consumed: `genome-line-threshold100-...` (gen-075).
