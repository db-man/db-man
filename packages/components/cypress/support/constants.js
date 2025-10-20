// CYPRESS_DBM_GH_TOKEN=123 npx cypress open
export const ghToken = Cypress.env('DBM_GH_TOKEN');

export const ghConfig = {
  token: Cypress.env('DBM_GH_TOKEN'),
  repoOwner: 'db-man',
  repoName: 'split-table-db',
  repoPath: 'db_files_dir',
  dbModes: 'split-table',
};
