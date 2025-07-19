import foo from './utils';

describe('foo', () => {
  it('should return proper value', () => {
    expect(foo()).toBe('bar');
  });
});
