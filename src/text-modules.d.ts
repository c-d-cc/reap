declare module "*.md" {
  const content: string;
  export default content;
}
declare module "*.yml" {
  const content: string;
  export default content;
}
declare module "*.scm" {
  const content: string;
  export default content;
}
/** `with { type: "file" }` — 컴파일 바이너리에 실리고 런타임에 경로를 준다 (probe로 확인, gen-0058). */
declare module "*.wasm" {
  const path: string;
  export default path;
}
