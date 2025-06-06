// export CYPRESS_DBM_TOKEN=123; npx cypress open
// CYPRESS_DBM_TOKEN=123 npx cypress open
export const ghToken = Cypress.env('DBM_TOKEN');

export const ghConfig = {
  token: Cypress.env('DBM_TOKEN'),
  repoOwner: 'db-man',
  repoName: 'split-table-db',
  repoPath: 'db_files_dir',
  dbModes: 'split-table',
};
