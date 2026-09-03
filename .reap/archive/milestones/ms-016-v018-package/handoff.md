# handoff — ms-016

task 1·2·3 전부 됐다(`gen-0077-exec`, 브랜치 `ms-016-package`). Exit Criteria 다섯 중 넷이 실측으로 확인됐다:

- Bun 없는 PATH에서 tarball 설치본이 명령 전부(`--version`·`init`·`make`·`mark`·`ctx --hook`·`doctor`·`plan sources`·`index`·`orch`)를 낸다 — `scripts/verify-package.sh`
- Bun 쪽(`bun test`·`tests/hook.test.sh`·`bun run typecheck`·`bun run build`) 전부 초록
- `release.yml`의 `npm publish`는 정확히 한 줄, `--tag next` 고정
- `ci.yml`이 push·PR에서 test·hook.test·typecheck·build·`npm pack --dry-run`(`verify-package.sh` 안에서)을 돈다
- `package.json`·`plugin.json` 버전과 필드, `environment/summary.md` 빌드 절 — 됐다

**남은 것 하나:** `RELEASE_NOTES.md`가 이 브랜치에 없다. `release.yml`의 GitHub Release 잡이 `awk '/^## /{n++} n==1' RELEASE_NOTES.md`로 0.18.0 절을 뽑는데, 파일이 없으니 이 단계가 지금 실패한다 — 의도한 것이다(파일이 생기기 전에 "된 것처럼" 만들지 않는다). 0.18.0 절을 쓰는 것은 다른 세대의 몫이다.

이 milestone 밖:
- README — ms-018
- 실제 publish·태그 push·마켓플레이스 교체 — 사람(06-release.md)

이 milestone이 끝나면 물어볼 것(milestone.md) 중 아직 사람 판단이 필요한 것:
- 번들 크기(wasm 포함, unpacked 28.3MB)가 설치 체감을 해쳤는가
- `release.yml`을 읽고 "latest로 갈 길이 없다"를 확신할 수 있는가
- "Bun 없는 머신에서 설치 → 첫 세대까지"는 이 개발 머신에서 PATH만 필터링해 확인했다. Bun이 아예 없는 별도 머신·CI 러너에서의 확인은 `ci.yml`이 실제로 돌 때가 처음이다

## cleanup (닫을 때)

archive로 내림: gen-0073·0074·0075(ms-015 잔여 — 산출물이 skill·스크립트·lessons에 반영됨), gen-0077(이 milestone), gen-0078(README — 산출물이 파일). gen-0076·0079는 ms-017이 열려 있어 남김.
