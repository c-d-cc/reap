---
type: task
status: pending
priority: high
createdAt: 2026-08-19T22:18:38.341Z
---

# auto-update 가 PATH 의 reap 버전을 읽는다 — 설치 중인 그 패키지가 아니다

gen-088 에서 자기진단 게이트가 배포본을 진단하고 있던 원인.

## Problem

`performAutoUpdate` (`src/cli/commands/check-version.ts`) 는 "지금 설치된 버전"을 이렇게 얻는다:

```ts
export function getInstalledVersion(): string | null {
  const result = execSync("reap --version", ...);
  ...
}
```

**PATH 위의 reap 이지 이 코드가 속한 패키지가 아니다.** 둘이 다를 수 있고, 다를 때 REAP 은 남의 버전을
근거로 자기를 업데이트한다.

### gen-088 이 이것에 걸린 방식 — 자기진단 게이트가 배포본을 진단하고 있었다

`scripts/check-self-diagnosis.sh` § 2 는 tarball 을 격리 prefix 에 전역 설치한다. 그 prefix 의 bin 은
PATH 에 없으므로 postinstall 이 부르는 `reap --version` 은 **개발자/러너의 기존 전역 reap** 을 읽는다.
그것이 npm `latest` 와 다르면 `npm install -g @c-d-cc/reap@latest` 가 실행되고, npm 이 lifecycle script 에
`npm_config_prefix` 를 물려주므로 그 업그레이드가 **같은 격리 prefix 로 들어가 방금 설치한 tarball 을
덮어쓴다.**

측정 (gen-088, 2026-08-20):

| 확인 | 결과 |
|---|---|
| tarball 안의 `dist/cli/index.js` | `09d0983e…` |
| 설치 후 같은 파일 | `dcfa945e…` |
| npm 배포본 0.17.5 의 같은 파일 | `dcfa945e…` — **byte-identical** |
| 같은 설치를 `--ignore-scripts` 로 | `09d0983e…` |
| 격리 HOME 의 npm 로그 | `verbose argv "install" "--global" "@c-d-cc/reap@latest"` |

조건은 "작업 트리와 같은 버전 번호가 이미 배포돼 있고 PATH 의 reap 이 latest 와 다를 때"다.
gen-087 때는 성립하지 않았다(배포본 0.17.5 에 gen-087 코드가 들어 있으므로 그 배포는 gen-087 이후다).

### 사용자에게도 일어나는가

전역 설치에서는 postinstall 시점에 bin 이 이미 링크돼 있어 PATH 의 reap 이 곧 그 설치다 — 값이 같다.
문제가 되는 것은 **둘이 갈리는 경우**다:

- 프로젝트에 로컬 설치(`npm i @c-d-cc/reap`)하는데 전역에 낡은 reap 이 있는 사용자 →
  postinstall 이 전역 버전을 읽고 **전역 설치를 자동 업그레이드**한다. 사용자는 로컬 설치를 했을 뿐이다.
- PATH 에 여러 reap 이 있는 환경(버전 매니저 전환 직후 등).

빈도는 낮지만 **"내가 건드리지 않은 설치가 바뀐다"** 라 조용히 넘길 성질은 아니다.

## Solution

`getInstalledVersion()` 이 **자기 package.json** 을 읽게 한다. `src/cli/index.ts` 의 `readVersion()` 이
이미 같은 일을 하며(`import.meta.url` 기준 + `dist/.dev-build` 마커), 그것을 공유하거나 같은 방식으로
구현하면 된다. postinstall 과 SessionStart 양쪽에서 이쪽이 옳은 값이다.

부수 효과(의도된 것): 로컬 빌드는 `dist/.dev-build` 때문에 버전에 `+dev` 가 붙고
`performAutoUpdate` 가 dev-build 로 판단해 skip 한다. CI 빌드에는 마커가 없다(`scripts/build.sh` 는
`CI` 가 비어 있을 때만 찍는다).

### 정정 — 이 수정은 "로컬이 전역을 건드리는" 경로를 **닫지 않는다. 방향을 뒤집는다**

gen-088 이 이 backlog 을 만들며 "로컬 설치 사용자가 전역의 낡은 reap 때문에 전역을 업데이트당하는 경로도
같이 닫힌다"고 적었다. **틀렸다.**

- **지금**: PATH 의 전역 버전을 읽는다 → 전역이 최신이면 `installed === latest` 로 skip.
  **전역이 낡았을 때** 발동해 전역을 올린다.
- **수정 후**: 자기(로컬) 버전을 읽는다 → **로컬이 낡았을 때** latest 와 달라지고,
  7단계가 여전히 **전역을** 업데이트한다.

트리거 조건이 "전역이 낡음" → "자기가 낡음" 으로 바뀔 뿐이고, 후자가 옳다. 그러나 **"로컬 설치인데
전역을 업데이트한다"는 동작 자체는 이 수정 전에도 있었고 수정 후에도 남는다.**

### 그래서 실제로는 결함이 둘이다

1. **어느 버전을 읽는가** — 이 backlog 의 본체. `getInstalledVersion()` 이 PATH 를 읽는다.
2. **어디에 설치하는가** — 7단계가 무조건 `npm install -g` 다. 로컬 설치의 postinstall 이
   전역을 바꾸는 것은 그 자체로 별개 결함이며, (1)이 만든 것이 아니라 **(1)이 드러낸 것**이다.

(1)을 고칠 때 (2)를 함께 판단할 것 — 로컬 설치에서는 auto-update 를 아예 하지 않는 것이 맞아 보이지만
(사용자가 그 프로젝트의 버전을 고정한 것이므로) 그 판단은 이 backlog 을 여는 세대의 몫이다.
**둘을 한 세대에서 다루되 근거를 따로 적어라** — 위 문단이 그렇게 하지 않아 틀린 채로 남을 뻔했다.

### gen-088 이 게이트 쪽에서 이미 한 것

소스를 고치지 않고도 게이트가 정직해지도록 두 가지를 넣었다:

1. § 2 · § 8 의 설치를 `PATH="$PREFIX/bin:$PATH"` 로 수행 — **실제 전역 설치와 같은 조건**을 만든다.
2. 설치 직후 **번들 sha 가 방금 pack 한 것과 같은지 단언** — 다음에 무엇이 원인이 되든 침묵이 통과로
   읽히지 않는다. 가짜 `reap --version` shim 으로 조건을 강제해 red → 수정 → green 을 확인했다.

**따라서 게이트는 이미 막혀 있고, 이 backlog 은 남은 사용자 대면 경로(로컬 설치 사용자)를 위한 것이다.**
게이트의 sha 단언은 이 수정 이후에도 남겨 둘 것 — 원인이 아니라 성질을 검사하기 때문이다.

## Files to Change

- `src/cli/commands/check-version.ts` — `getInstalledVersion()` 구현 교체
- `src/cli/index.ts` — `readVersion()` 을 공유 가능한 자리로 옮길지 판단 (현재 CLI 진입점 안의 지역 함수)
- `tests/unit/` — 주입 seam 을 두고 "PATH 의 값이 아니라 자기 버전을 읽는다"를 고정
- `scripts/check-self-diagnosis.sh` — 변경 불필요. sha 단언이 이 수정의 회귀 검사도 겸한다
