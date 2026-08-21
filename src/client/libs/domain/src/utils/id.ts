/** Client-side id for optimistically created records. The API will own ids later. */
export const uid = (prefix: string): string =>
  prefix + Math.random().toString(36).slice(2, 8);
