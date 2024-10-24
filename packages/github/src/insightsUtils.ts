/**
 * The primary purpose of the insights utils is to transform raw git commit log data
 * into a more meaningful format that shows the total number of lines in a file on each date.
 * This can be useful for tracking the growth or reduction of a file over time,
 * understanding the impact of changes, and visualizing the development history of a project.
 */

/**
 * Convert git log commit data to csv format which has 3 columns: date, added_line_count, deleted_line_count
 */
export function convertCommitData(input: string): string[] {
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
 * Process CSV data to show the total number of lines in a file on each date.
 */
export function processCSVData(lines: string[]): string[] {
  // Initialize an object to store the aggregated data
  const aggregatedData = {};

  // Process each line
  lines.forEach((line) => {
    const [date, added, deleted] = line.split(',').map((item) => item.trim());
    const addedLines = parseInt(added, 10);
    const deletedLines = parseInt(deleted, 10);

    // If the date is not in the aggregatedData object, initialize it
    if (!aggregatedData[date]) {
      aggregatedData[date] = 0;
    }

    // Update the total lines for the date
    aggregatedData[date] += addedLines + deletedLines;
  });

  // Convert the aggregated data to a more meaningful format that shows the total number of lines in a file on each date.
  const output = ['date,total_lines_of_file_on_this_day'];
  let totalLines = 0;
  for (const date in aggregatedData) {
    totalLines += aggregatedData[date];
    output.push(`${date},${totalLines}`);
  }

  return output;
}
