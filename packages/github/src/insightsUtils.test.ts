import {
  parseGitCommitDataToCSV,
  calcTotalLinesByDateFromGitLogs,
} from './insightsUtils';

// change logs generated from `git --no-pager log --follow --numstat --pretty="%H %ad" --date=short -- db_files_dir/iam/roles.data.json`, and format into CSV with `parseGitCommitDataToCSV` function
const gitChangeLogs = [
  '2024-06-17,6,0', // added 6 lines of code, and deleted 0 lines of code
  '2023-08-24,13,7', // added 13 lines of code, and deleted 7 lines of code
  '2023-08-24,8,0', // role.data.json is created on 2023-08-24, and has 8 lines of code added
];

describe('parseGitCommitDataToCSV', () => {
  it('should convert commit data correctly', () => {
    const input = `aa952ec79a059ef8a23ca1688568cec997441230 2024-06-17

6\t0\tdbs/iam/roles.data.json
a0c8b7e71e7bca83b66e29c121f8d1b316fc9d84 2023-08-24

13\t7\tdbs/iam/roles.data.json
c20789949d09621e8db0e90c9d09cc6a9052d6fb 2023-08-24

8\t0\tdbs/iam/roles.data.json`;

    const actualOutput = parseGitCommitDataToCSV(input);
    expect(actualOutput[0]).toBe(gitChangeLogs[0]);
    expect(actualOutput[1]).toBe(gitChangeLogs[1]);
    expect(actualOutput[2]).toBe(gitChangeLogs[2]);
  });
});

describe('calcTotalLinesByDateFromGitLogs', () => {
  it('should process CSV data correctly', () => {
    const expectedOutput: string[] = [
      'date,total_lines_of_file_on_this_day',
      '2024-06-17,20', // 14+(6-0) = 20
      '2023-08-24,14', // 8+(13-7) = 14
      '2023-08-24,8', // new file started from 8 lines of code
    ];
    const actualOutput = calcTotalLinesByDateFromGitLogs(gitChangeLogs);
    expect(actualOutput[0]).toBe(expectedOutput[0]);
    expect(actualOutput[1]).toBe(expectedOutput[1]);
    expect(actualOutput[2]).toBe(expectedOutput[2]);
  });
});
