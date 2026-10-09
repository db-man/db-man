import { formatDate, getRecordFileName } from './utils';

describe('formatDate', () => {
  it('should format date', () => {
    expect(
      formatDate(new Date('2021-07-04T01:16:01.000Z')),
    ).toBe('2021-07-04 09:16:01');
  });
});

describe('getRecordFileName', () => {
  it('should build the same file name for a numeric primary key and its string form', () => {
    expect(getRecordFileName(1)).toBe('1.json');
    expect(getRecordFileName('1')).toBe('1.json');
    expect(getRecordFileName(1)).toBe(getRecordFileName('1'));
  });

  it('should keep digits, dot and hyphen as-is', () => {
    expect(getRecordFileName(0)).toBe('0.json');
    expect(getRecordFileName(-1)).toBe('-1.json');
    expect(getRecordFileName(1.5)).toBe('1.5.json');
    expect(getRecordFileName(1744820403529)).toBe('1744820403529.json');
  });

  it('should sanitize characters that are not filename safe', () => {
    expect(getRecordFileName('a/b c')).toBe('a_b_c.json');
    expect(getRecordFileName('a#b')).toBe('a_b.json');
    // exponent notation contains "+", which is not portable in a file name
    expect(getRecordFileName(1e21)).toBe('1e_21.json');
  });
});
