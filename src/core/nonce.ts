import { createHash, randomBytes } from "crypto";

/** Generate a nonce + hash pair. Token format: hash(nonce + genId + stage:phase). */
export function generateToken(
  genId: string,
  stage: string,
  phase: string,
): { nonce: string; hash: string } {
  const nonce = randomBytes(16).toString("hex");
  const input = `${nonce}${genId}${stage}:${phase}`;
  const hash = createHash("sha256").update(input).digest("hex");
  return { nonce, hash };
}

/** Verify a token by recomputing hash from nonce and comparing to expected. */
export function verifyToken(
  nonce: string,
  genId: string,
  stage: string,
  phase: string,
  expectedHash: string,
): boolean {
  const input = `${nonce}${genId}${stage}:${phase}`;
  return createHash("sha256").update(input).digest("hex") === expectedHash;
}
