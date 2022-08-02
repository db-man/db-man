import { getUrlParams } from './utils';
describe('getUrlParams', () => {
  test('should return proper value', () => {
    expect(getUrlParams()).toEqual({});
  });
});