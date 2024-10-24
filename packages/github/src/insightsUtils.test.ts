import { convertCommitData, processCSVData } from './insightsUtils';

describe('convertCommitData', () => {
  it('should convert commit data correctly', () => {
    const input = `aa952ec79a059ef8a23ca1688568cec997441230 2024-06-17
1\t0\ta.txt

a0c8b7e71e7bca83b66e29c121f8d1b316fc9d84 2023-08-24
3\t0\ta.txt

c20789949d09621e8db0e90c9d09cc6a9052d6fb 2023-08-24
10\t0\ta.txt`;

    // const expectedOutput = `2023-08-24,1,0\n2023-08-24,3,0\n2024-06-17,10,0`;
    const expectedOutput = [
      '2024-06-17,1,0',
      '2023-08-24,3,0',
      '2023-08-24,10,0',
    ];
    const actualOutput = convertCommitData(input);
    expect(actualOutput[0]).toBe(expectedOutput[0]);
    expect(actualOutput[1]).toBe(expectedOutput[1]);
    expect(actualOutput[2]).toBe(expectedOutput[2]);
  });
});

describe('processCSVData', () => {
  it('should process CSV data correctly', () => {
    const input = ['2024-10-01,1,0', '2024-10-02,3,-1', '2024-10-03,10,-2'];

    // const expectedOutput = `date,total_lines_of_file_on_this_day\n2024-10-01,1\n2024-10-02,3\n2024-10-03,11`;
    const expectedOutput = [
      'date,total_lines_of_file_on_this_day',
      '2024-10-01,1',
      '2024-10-02,3',
      '2024-10-03,11',
    ];
    const actualOutput = processCSVData(input);
    expect(actualOutput[0]).toBe(expectedOutput[0]);
    expect(actualOutput[1]).toBe(expectedOutput[1]);
    expect(actualOutput[2]).toBe(expectedOutput[2]);
  });
});
