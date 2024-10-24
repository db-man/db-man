import { convertCommitData, processCSVData } from './insightsUtils';

describe('convertCommitData', () => {
  it('should convert commit data correctly', () => {
    const input = `commit_hash_1 2024-10-01
1\t0\ta.txt

commit_hash_2 2024-10-02
3\t0\ta.txt

commit_hash_3 2024-10-03
10\t0\ta.txt`;

    const expectedOutput = `2024-10-01,1,0\n2024-10-02,3,0\n2024-10-03,10,0`;
    expect(convertCommitData(input)).toBe(expectedOutput);
  });
});

describe('processCSVData', () => {
  it('should process CSV data correctly', () => {
    const input = `2024-10-01,1,0
2024-10-02,3,-1
2024-10-03,10,-2`;

    const expectedOutput = `date,total_lines_of_file_on_this_day\n2024-10-01,1\n2024-10-02,3\n2024-10-03,11`;
    expect(processCSVData(input)).toBe(expectedOutput);
  });
});
