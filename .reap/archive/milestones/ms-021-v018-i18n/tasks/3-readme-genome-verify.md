# 3 — README en/ko, RELEASE_NOTES, genome, 재검증

- `README.md`를 en으로 다시 쓰고 현재 한국어 본문은 `README.ko.md`로. 두 파일의 절 구조가 같아야 한다
- `RELEASE_NOTES.md` 0.18.0 절 en. "한국어 전용" 항목을 지우고 "en 기본, ko 카탈로그(`config.language: ko`)"로
- `.reap/genome/application.md` "사용자에게 보이는 문자열은 한국어" → "사용자 문자열은 카탈로그(en 기본·ko). 커밋 메시지는 한국어"
- `~/cdws/reap_v17`의 0.17.8 RELEASE_NOTES·NOTICE·로케일에서 "v0.18 is Korean-only" 문장 제거 (gen-0081 산출물 수정 — 그 리포의 커밋 하나 더, push 없음)
- 왕복 1(ms-019 task 1)을 en 출력으로 다시: `scripts/verify-package.sh` + `claude --plugin-dir` 1회
