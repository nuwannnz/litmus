/**
 * RFC 9562 UUIDv7 — 48-bit unix-millisecond timestamp followed by random bits,
 * with the version (7) and variant (10xx) fields set per the spec.
 *
 * Client-generated ids make optimistic creates real (no temp-ID reconciliation)
 * and offline replay idempotent: a retried create hits a primary-key conflict,
 * not a duplicate row (architecture §3.4). Time-ordering keeps indexes healthy.
 */
export const uuidv7 = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const ts = Date.now();
  bytes[0] = (ts / 2 ** 40) & 0xff;
  bytes[1] = (ts / 2 ** 32) & 0xff;
  bytes[2] = (ts / 2 ** 24) & 0xff;
  bytes[3] = (ts / 2 ** 16) & 0xff;
  bytes[4] = (ts / 2 ** 8) & 0xff;
  bytes[5] = ts & 0xff;
  const [r6, r8] = [bytes[6] ?? 0, bytes[8] ?? 0];
  bytes[6] = (r6 & 0x0f) | 0x70;
  bytes[8] = (r8 & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
