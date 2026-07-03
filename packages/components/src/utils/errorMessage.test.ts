import { buildErrorMessage, getErrorDetail } from './errorMessage';

describe('getErrorDetail', () => {
  it('returns the message from an Error instance', () => {
    expect(getErrorDetail(new Error('network failed'))).toBe('network failed');
  });

  it('returns a string directly', () => {
    expect(getErrorDetail('boom')).toBe('boom');
  });

  it('stringifies object values', () => {
    expect(getErrorDetail({ code: 500, reason: 'bad gateway' })).toBe(
      '{"code":500,"reason":"bad gateway"}',
    );
  });
});

describe('buildErrorMessage', () => {
  it('appends the error detail when present', () => {
    expect(
      buildErrorMessage('Failed to save', new Error('permission denied')),
    ).toBe('Failed to save Reason: permission denied');
  });

  it('returns the prefix when no detail is available', () => {
    expect(buildErrorMessage('Failed to save', undefined)).toBe(
      'Failed to save',
    );
  });
});
