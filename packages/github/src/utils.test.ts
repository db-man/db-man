import { formatDate } from './utils';

describe('formatDate', () => {
  it('should format date', () => {
    expect(
      formatDate(new Date('2021-07-04T01:16:01.000Z')),
    ).toBe('2021-07-04 09:16:01');
  });
});
