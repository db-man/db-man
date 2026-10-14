import {
  GITHUB_ERROR_TYPES,
  createGithubError,
  isGithubError,
} from './errors';

describe('createGithubError', () => {
  it('should carry the type and the message as given', () => {
    const err = createGithubError('NOT_FOUND', 'no such file');

    expect(err).toBeInstanceOf(Error);
    expect(err.type).toBe('NOT_FOUND');
    // The message is what consumers display, so the type never replaces it —
    // the two answer different questions.
    expect(err.message).toBe('no such file');
    expect(err.status).toBeUndefined();
    expect(err.cause).toBeUndefined();
  });

  it('should carry the status and the original error when given', () => {
    const upstream = new Error('Bad credentials');
    const err = createGithubError('UNAUTHORIZED', 'token is invalid', {
      status: 401,
      cause: upstream,
    });

    expect(err.status).toBe(401);
    expect(err.cause).toBe(upstream);
  });
});

describe('isGithubError', () => {
  it('should accept an error built here', () => {
    expect(isGithubError(createGithubError('CONFLICT', 'stale sha'))).toBe(
      true,
    );
  });

  // What `instanceof` cannot do: this package ships two copies of itself
  // (`dist/` and `es6/`), each with its own class identity, so an error raised
  // by one and caught by the other fails `instanceof`. The guard reads the
  // `type` field instead, and that travels with the value.
  it('should recognise an error by its type, whatever its class', () => {
    const fromAnotherCopy = { name: 'Error', message: 'x', type: 'CONFLICT' };

    expect(isGithubError(fromAnotherCopy)).toBe(true);
  });

  it('should reject a plain error, a string, null and undefined', () => {
    expect(isGithubError(new Error('boom'))).toBe(false);
    expect(isGithubError('NOT_FOUND')).toBe(false);
    expect(isGithubError(null)).toBe(false);
    expect(isGithubError(undefined)).toBe(false);
  });

  // A `type` field alone is not proof — anything can have one.
  it('should reject a type that is not in the vocabulary', () => {
    expect(isGithubError({ type: 'SOMETHING_ELSE' })).toBe(false);
    expect(isGithubError({ type: 404 })).toBe(false);
  });

  it('should know every type it exports', () => {
    GITHUB_ERROR_TYPES.forEach((type) => {
      expect(isGithubError(createGithubError(type, 'x'))).toBe(true);
    });
  });
});
