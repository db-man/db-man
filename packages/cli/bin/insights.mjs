import { exec } from 'child_process';
import { insightsUtils } from '@db-man/github';

// Function to execute git log command
function getGitLogAsync() {
  return new Promise((resolve, reject) => {
    exec(
      'git log --follow --numstat --pretty="%H %ad" --date=short -- db_files_dir/iam/roles.data.json',
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing git log: ${error}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        // console.log(`Git log output:\n${stdout}`);
        resolve(stdout);
      }
    );
  });
}

const insightsAsync = async () => {
  const rawLog = await getGitLogAsync();
  console.log('rawLog:', rawLog);

  let tmp = insightsUtils.convertCommitData(rawLog);
  console.log('after convertCommitData:', tmp);

  tmp = insightsUtils.processCSVData(tmp);
  console.log('after processCSVData:', tmp);

  // Write the converted data to stdout
  console.log(tmp);
};

export default insightsAsync;
