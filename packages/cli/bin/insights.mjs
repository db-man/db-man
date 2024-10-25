import { exec } from 'child_process';
import { insightsUtils } from '@db-man/github';

// Function to execute git log command
function getGitLogAsync(dir, dbTable) {
  return new Promise((resolve, reject) => {
    // git --no-pager log --follow --numstat --pretty="%H %ad" --date=short -- db_files_dir/iam/roles.data.json
    const cmd = `git --no-pager log --follow --numstat --pretty="%H %ad" --date=short -- ${dir}/${dbTable}.data.json`;
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

const insightsAsync = async (dir, dbTable) => {
  const rawLog = await getGitLogAsync(dir, dbTable);
  console.log('rawLog:', rawLog);

  let tmp = insightsUtils.convertCommitData(rawLog);
  console.log('after convertCommitData:', tmp);

  tmp = insightsUtils.calcTotalLinesByDateFromGitLogs(tmp);
  console.log('after calcTotalLinesByDateFromGitLogs:', tmp);

  // Write the converted data to stdout
  console.log(tmp.join('\n'));
};

export default insightsAsync;
