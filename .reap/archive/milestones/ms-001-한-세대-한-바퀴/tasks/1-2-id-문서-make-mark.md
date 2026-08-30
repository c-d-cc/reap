# Task 1.2 — id, 문서, `make`, `mark` — **완료 (gen-0002-exec)**

한 태스크로 묶는 이유는 셋이 한 동작(항목을 만들고 표시한다)의 부분이고, 따로 두면 각각이 쓰이지 않는 상태로 끝나기 때문이다.

## 공개 인터페이스

```ts
// id.ts
export type Kind = "milestone" | "plan-generation" | "exec-generation" | "source" | "backlog" | "idea";
export type Row = { id: string; title: string; createdAt: string };
export function kindOf(id: string): Kind | null;
export function isValid(id: string): boolean;
export function isRegistered(kind: Kind): boolean;
export function readRegistry(root: string, kind: Kind): Row[];
export function issue(root: string, kind: Kind, title: string, today: string): string;

// doc.ts
export type Data = Record<string, unknown>;
export type Entry = { id: string; kind: Kind; path: string; dir: string; data: Data };
export function parseDoc(text: string): { data: Data; body: string };
export function formatDoc(data: Data, body: string): string;
export function patch(path: string, fields: Data): void;      // null인 값은 필드를 삭제
export function slugify(title: string): string;
export function listEntries(root: string, kind: Kind): Entry[];
export function findEntry(root: string, kind: Kind, needle: string):
  | { entry: Entry } | { ambiguous: Entry[] } | { missing: true };
```

## 명령

```bash
reap make milestone  --title "<t>" [--slug <s>]
reap make generation --milestone <ms-id> --title "<t>" [--slug <s>]
reap mark generation <gen-id> --closed      # closedAt, endCommit(현재 HEAD), status
reap mark generation <gen-id> --aborted     # 기록 삭제
```

`make generation`은 id 발급 · 템플릿 복사 · 기계적 사실(시각·시작 커밋·소속·유형) 스탬프 · 경로 배치 · 세션 바인딩, 이 다섯만 한다. milestone은 디렉토리를 만들고 `context.md`·`decisions.md`·`handoff.md`를 **빈 파일로** 둔다 — 안내 문구를 넣으면 지워지지 않은 채 남아 진짜 내용과 섞인다.

## 종류별 위치
- milestone: `milestones/<ms-id>-<slug>/milestone.md`
- exec generation: `milestones/<...>/generations/<exec-id>-<slug>.md`
- plan generation: `plan/generations/<plan-id>-<slug>.md` *(경로만 지원. plan 축 자체는 증분 3)*

## 증명해야 할 동작
- 번호는 1부터 순차 발급되고 계열마다 독립적으로 센다. 다음 번호가 **행에서** 나온다
- `kindOf`가 헷갈리는 것들을 가른다: `gen-0004-plan` vs `ps-a3f8c2`(접두사 겹침), `ms-a3f8c2`(번호 계열에 해시 → null), `zz-001`(→ null). **6자리 숫자는 6자리 hex이기도 하므로 자릿수만으로는 못 가른다**
- **`patch`가 본문을 바이트 단위로 보존한다.** 같은 파일에 두 번 연속 걸어도 본문이 그대로여야 한다
- **본문이 빈 줄로 시작하면 그 빈 줄이 보존된다** (하나가 사라지지도 늘지도 않는다)
- `null`을 주면 필드가 지워진다
- slug가 경로에 못 쓰는 문자를 없애되 **한글은 남긴다**
- `findEntry`가 정확한 id를 최우선으로 맞추고, **둘 이상 걸리면 후보를 돌려주고 하나를 고르지 않는다**
- 생성된 generation의 **본문이 비어 있다**
- exec인데 `--milestone`이 없으면 거부한다
- **커밋이 없어도 `--closed`가 통과한다** — `mark`는 검사하지 않는다

## 함정
- **레지스트리 제목이 왕복되어야 한다.** 마크다운 테이블에 쓰는 이상 제목의 `|`와 개행이 표를 깬다. 쓸 때만 이스케이프하고 읽을 때 되돌리지 않으면 `createdAt`이 조용히 사라진다 — 이전 판에서 실제로 그랬고, **제목만 검사하는 테스트는 그것을 통과시킨다.** `|`가 든 제목과 개행이 든 제목 각각에 대해 제목과 `createdAt`을 함께 검사한다.
- frontmatter 구분자 뒤 공백 줄 처리를 `formatDoc`이 쓰는 형식과 맞춰야 한다. 어긋나면 `patch`를 부를 때마다 본문 앞에 빈 줄이 하나씩 쌓이고, 그것은 "도구가 본문을 건드리지 않는다"는 이 프로젝트의 중심 약속을 조용히 깬다. **위의 "두 번 연속 patch" 테스트가 이것을 잡는 장치다.**
- CRLF로 쓰인 문서에서 본문 앞에 `\r`이 남지 않아야 한다.
- 정확한 id를 접두사보다 먼저 맞추지 않으면 `ms-001`이 `ms-0011`의 접두사이기도 해서 모호해진다.
- git이 없는 곳에서도 `make`는 동작해야 한다. 시작 커밋을 못 구한다고 거부하면 그것은 흐름 제어다.

**완료 판정:** 바이너리로 `init` → `make milestone` → `make generation` → 커밋 → `mark --closed`가 돌고, 파일이 규약된 자리에 규약된 모양으로 생긴다.
