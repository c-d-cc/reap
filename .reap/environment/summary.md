# Environment Summary

## 현재 상태 (2026-08-23)

```
.reap/                 REAP가 자기 자신에게 쓰는 저장소
  map.md                이 디렉토리가 무엇을 어디에 두는지 (씨앗)
  plan/                 sources.yml · conventions/ · loops/ (기획 축의 사이클, 3단 밖)
  vision/               하려는 것 — memory · milestones
  life/                 하는 중 — generations · backlog
  archive/              끝난 것 — generations · milestones · backlog
docs/superpowers/specs/reap/   plan source ps-4f2a91 (설계 문서 10개)
plugin/                 skill 9종(evolve·carve-milestone·complete·cleanup·loop·interview·init·report-issue·orchestrate) + 어휘 문서 + SessionStart 훅
                        spec의 9종이 전부 있다
src/
  cli.ts        엔트리, 인자 파싱, 디스패치, 출력 규약 (--version · init[--check] · make · mark · bind · ctx · plan · seq · carrier · doctor · index · orch)
  store.ts      .reap/ 레이아웃 — 루트 탐색, 경로, config, 세션, workspace-id
  git.ts        git 상태 조회 (외부 의존의 유일한 창구)
  id.ts         id 형식과 append-only 레지스트리 — generation은 gen-NNNN-<type> 한 계열
  doc.ts        frontmatter, slug, 항목 목록과 찾기
  entries.ts    make(milestone·generation·backlog·idea)와 mark
  ctx.ts        세션 맥락 조립 — genome·summary·상태 줄만. 나머지는 지도로 알린다
  doctor.ts     사후 검증 — 결함(실패)과 참고. 안내선 GUIDE는 이 리포 실측에서
  carrier.ts    carrier 표식 — 리포를 훑어 발급·조회·검사. 표식 자체가 레지스트리
  index/        코드 인덱스 — languages(문법 15 + scm 질의, 바이너리에 실림) · parser · graph · resolve(import/call) · store(.reap/.index) · indexer(커밋 단위 갱신·질의)
  orch.ts       병렬 조율 — claim(O_EXCL·TTL·탈취 로그)·release·barrier·roster(claude agents)·status. 공유 상태는 ~/.reap/orch/
  plan.ts       plan source — sources.yml 읽기(Bun.YAML)·쓰기(손 형식), make plan-source, --ref 검증
  templates.ts  번들 템플릿과 프로젝트 오버라이드
  templates/    번들 템플릿 원본 (텍스트 임포트로 바이너리에 실린다)
  text-modules.d.ts   `*.md`·`*.yml` 텍스트 임포트를 위한 타입 선언
tests/          <module>.test.ts · helpers.ts · hook.test.sh (셸)
```

증분 2까지 반영됐다.

- 저장 레이아웃 3단 · 세대 id 한 계열(`gen-NNNN-<type>`) · `fix` 유형 · `cleanup` skill
- **milestone 디렉토리에는 `milestone.md`·`handoff.md`·`tasks/`뿐이다.** `context.md`는 21세대 동안 0바이트여서, `decisions.md`는 spec 밖에 규범이 사는 둘째 자리를 만들어서 내렸다. 규범은 `05-knowledge.md`의 "결정 로그를 두지 않는다" 절
- **frontmatter의 시간은 종류를 가리지 않고 초 단위 ISO다.** 예외는 sequence 레지스트리의 `createdAt` 칸 하나(날짜)
- 명령은 `init` · `make`(loop·milestone·generation·backlog·idea·plan-source) · `mark`(loop·generation·backlog·milestone·idea) · `ctx` · `plan sources|convention` · `seq` · `carrier new|list` · `doctor`. spec이 약속한 `decide`는 **만들지 않기로 했고**, spec의 명령이 전부 있다. `index`는 이 리포에서 파일 26·심볼 173·해석률 99%
- **YAML 파서는 들이지 않는다.** `sources.yml`은 `Bun.YAML.parse`로 읽는다(Bun 1.3 내장). 쓰기는 손 형식이다 — `Bun.YAML.stringify`는 흐름 형식으로 내서 손으로 쓴 파일과 모양이 달라진다

## 빌드와 테스트

```bash
bun test         # 177개
./tests/hook.test.sh   # 훅 스크립트 5종 (bun test가 돌리지 않는다)
bun run typecheck   # tsc --noEmit
bun run build       # bun build --compile → dist/reap (약 89.5MB — 문법 15개 28MB 포함)
bun run build:node  # bun build --target=node → dist/node/reap.js + wasm 16개 (gitignore, npm 채널)
```

Bun 1.3.10 · TypeScript 5.9 · web-tree-sitter 0.22.6(dev, 번들에 인라인) · tree-sitter-wasms(문법, dev).

`build:node`는 ESM 235KB(`reap.js`, shebang·실행 비트 포함) + wasm 16개 27MB를 `dist/node/`에 낸다.
`npm pack --dry-run`으로 실측한 tarball은 18파일 · 2.7MB(unpacked 28.3MB). `src/`·`tests/`·`plugin/`·`.reap/`는
`files: ["dist/node"]`라 담기지 않는다.

## 템플릿 번들링

`import x from "./templates/a.md" with { type: "text" }`. `bun run`과 컴파일 바이너리 양쪽에서
UTF-8 그대로 실린다 (probe로 확인). 템플릿은 문자열 상수가 아니라 **진짜 파일**이라 편집이 쉽다.
새 템플릿을 더할 때는 `src/templates/`에 파일을 놓고 `templates.ts`의 `BUNDLED`에 임포트를 추가한다.

## 개발 중 플러그인 로드

```bash
claude --plugin-dir ./plugin
```

세션 한정으로 로컬 플러그인이 로드된다. 마켓플레이스도 설치 절차도 필요 없다.
