/**
 * The primary purpose of the insights utils is to transform raw git commit log data
 * into a more meaningful format that shows the total number of lines in a file on each date.
 * This can be useful for tracking the growth or reduction of a file over time,
 * understanding the impact of changes, and visualizing the development history of a project.
 */

/**
 * Convert git log commit data to csv format which has 3 columns: date, added_line_count, deleted_line_count
 * The input is generated from `git --no-pager log --follow --numstat --pretty="%H %ad" --date=short -- db_files_dir/iam/roles.data.json`
 */
export function parseGitCommitDataToCSV(input: string): string[] {
  const lines = input.trim().split('\n');
  const result: string[] = [];

  for (let i = 0; i < lines.length; i += 3) {
    // lines[i]="commit_hash_1 2024-10-01"
    // lines[i + 2]="1\t0\ta.txt"
    const date = lines[i].split(' ')[1];
    const [num1, num2] = lines[i + 2].split('\t').slice(0, 2);
    result.push(`${date},${num1},${num2}`);
  }

  return result;
}

/**
 * Processes git change logs and calculates the total lines of code for each date.
 *
 * @param {string[]} gitChangeLogs - Array of strings representing git change logs in the format 'YYYY-MM-DD,added,deleted'.
 * @returns {string[]} - Array of strings representing the processed CSV data with total lines of code for each date.
 *
 * Example output:
 * ```json
 * [
 *   "date,total_lines_of_file_on_this_day",
 *   "2024-10-01,1",
 *   "2024-10-02,2"
 * ]
 * ```
 */
export function calcTotalLinesByDateFromGitLogs(
  gitChangeLogs: string[]
): string[] {
  const result: string[] = [];
  let totalLines = 0;

  // Iterate over the git change logs
  for (let i = gitChangeLogs.length - 1; i >= 0; i--) {
    const [date, added, deleted] = gitChangeLogs[i].split(',');
    const addedLines = parseInt(added);
    const deletedLines = parseInt(deleted);

    if (i === gitChangeLogs.length - 1) {
      // If it's the first entry, it's the creation of the file
      totalLines = addedLines;
    } else {
      totalLines += addedLines - deletedLines;
    }

    result.unshift(`${date},${totalLines}`);
  }

  // Add header to the result
  result.unshift('date,total_lines_of_file_on_this_day');

  return result;
}
