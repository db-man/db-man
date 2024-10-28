import { foo } from './utils.mjs';

describe('foo', () => {
  it('should return proper value', () => {
    expect(foo()).toBe('bar');
  });
});
