/**
 * The error vocabulary of `@db-man/github`.
 *
 * Every failure that came back *from GitHub* is one of these types: a 404 is
 * `NOT_FOUND`, a stale sha is `CONFLICT`. `ROW_NOT_FOUND` is the one type the
 * db layer adds itself (a row missing from a table file is not an HTTP status).
 * Caller mistakes — a missing constructor argument, a sha passed to `createFile`
 * — stay plain `Error`s; they are not part of this vocabulary.
 *
 * ## Why a factory and a `type` field instead of a class
 *
 * `class GithubError extends Error` would make `instanceof` the way to ask "is
 * this one of ours", and that question has no reliable answer here: this
 * package ships two copies of itself (`dist/` and `es6/`), and npm dedupe is
 * not guaranteed, so the same logical error can fail `instanceof` depending on
 * which copy the thrower and the catcher each loaded. The `type` field travels
 * *with the value*, so it survives that. `isGithubError()` is the supported way
 * to ask.
 *
 * (The plan this was built from also worried that `@babel/preset-env` would
 * down-level a class to ES5 and break the prototype chain. It would not:
 * `packages/github/babel.config.js` targets `node: 'current'`. The duplicate
 * copies are the real reason, above.)
 */

/**
 * The single definition of the vocabulary. The union is derived from it, so a
 * new type cannot be added to one place and forgotten in the other.
 */
export const GITHUB_ERROR_TYPES = [
  /** 401 — the token is missing, expired or wrong. */
  'UNAUTHORIZED',
  /** 403 — the token is valid but not allowed to do this (or the file is too big for the contents API). */
  'FORBIDDEN',
  /** 404 — the path does not exist. */
  'NOT_FOUND',
  /** 422 on a create — the file is already there. */
  'ALREADY_EXISTS',
  /** 409 — the sha you wrote with is older than the file's. */
  'CONFLICT',
  /** 429 — the API rate limit was hit. */
  'RATE_LIMITED',
  /** 5xx and transport-level failures. */
  'REMOTE_FAILURE',
  /** Anything that did not fit. */
  'UNKNOWN',
  /** The db layer's own type: the row is not in the table. */
  'ROW_NOT_FOUND',
  /**
   * The db layer's own type: a row with this primary key is already in the
   * table. Distinct from `ALREADY_EXISTS`, which is about a *file* being there
   * — a record file name is sanitized (`utils.getRecordFileName`), so two
   * different keys can share one file, and calling that a duplicate key would
   * be a lie. Only normal mode can raise this one: there the duplicate is found
   * by scanning the array, with no HTTP involved.
   */
  'DUPLICATE_KEY',
] as const;

export type GithubErrorType = (typeof GITHUB_ERROR_TYPES)[number];

/**
 * An error carrying a machine-readable `type`.
 *
 * `message` stays human-readable and is what consumers display, so it is never
 * replaced by the type: the two answer different questions, and a log search
 * for an old wording keeps working.
 */
export interface GithubError extends Error {
  type: GithubErrorType;
  /** The HTTP status the remote answered with, when there was one. */
  status?: number;
  /** The original error, untouched, for debugging. */
  cause?: unknown;
}

/**
 * Build a `GithubError`.
 *
 * @param type one of `GITHUB_ERROR_TYPES`
 * @param message human-readable text; consumers display it verbatim
 * @param extra `status` / `cause` from the remote, when there are any
 */
export const createGithubError = (
  type: GithubErrorType,
  message: string,
  extra?: { status?: number; cause?: unknown },
): GithubError => {
  const err = new Error(message) as GithubError;
  err.type = type;
  if (extra?.status !== undefined) err.status = extra.status;
  if (extra?.cause !== undefined) err.cause = extra.cause;
  return err;
};

/**
 * Whether `err` is a `GithubError` from this package.
 *
 * Checks the `type` field against the vocabulary, so an unrelated object that
 * happens to carry a `type` string does not pass. Works across package copies,
 * which `instanceof` does not — see the note at the top of this file.
 */
export const isGithubError = (err: unknown): err is GithubError => {
  if (typeof err !== 'object' || err === null) return false;
  const { type } = err as { type?: unknown };
  return (
    typeof type === 'string' &&
    (GITHUB_ERROR_TYPES as readonly string[]).includes(type)
  );
};
