import { exec } from 'child_process';
import { insightsUtils } from '@db-man/github';

// Function to execute git log command
function getGitLogAsync(dbTable) {
  return new Promise((resolve, reject) => {
    // git log --follow --numstat --pretty="%H %ad" --date=short -- db_files_dir/iam/roles.data.json
    const cmd = `git log --follow --numstat --pretty="%H %ad" --date=short -- db_files_dir/${dbTable}.data.json`;
    console.log(`Executing git log command: ${cmd}`);
    exec(cmd, (error, stdout, stderr) => {
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
    });
  });
}

const insightsAsync = async (dbTable) => {
  const rawLog = await getGitLogAsync(dbTable);
  console.log('rawLog:', rawLog);

  let tmp = insightsUtils.convertCommitData(rawLog);
  console.log('after convertCommitData:', tmp);

  tmp = insightsUtils.processCSVData(tmp);
  console.log('after processCSVData:', tmp);

  // Write the converted data to stdout
  console.log(tmp.join('\n'));
};

export default insightsAsync;
