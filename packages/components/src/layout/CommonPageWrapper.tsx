import React, { useRef } from 'react';
import { GithubDbV2 } from '@db-man/github';

import CommonPageContext from '../contexts/commonPage';
import NotFound from '../components/NotFound';

import * as constants from '../constants';

const { Provider } = CommonPageContext;

type Props = {
  children: React.ReactNode;
};

// TODO: Because this file is copied from DbTablePage.tsx, so some of the codes are duplicated
const CommonPageWrapper = (props: Props) => {
  const githubDbV2Ref = useRef<GithubDbV2 | null>(null);

  if (!localStorage.getItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN)) {
    // Normally this is because we dont enable any db connection
    return <NotFound name="enabled db connection" />;
  }

  githubDbV2Ref.current = new GithubDbV2({
    personalAccessToken:
      localStorage.getItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN) || '',
    repoPath: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_PATH) || '',
    owner: localStorage.getItem(constants.LS_KEY_GITHUB_OWNER) || '',
    repoName: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_NAME) || '',
    dbsSchema: JSON.parse(
      localStorage.getItem(constants.LS_KEY_DBS_SCHEMA) || '{}',
    ),
    dbModes: (localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES) ||
      'normal') as GithubDbV2['dbModes'],
  });

  const pageInfo = () => {
    return {
      // e.g. ['split-table']
      appModes: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES)
        ? localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES)!.split(',')
        : [],
      githubDbV2: githubDbV2Ref.current,
    };
  };

  return (
    <Provider value={pageInfo()}>
      <div className="dbm-page">{props.children}</div>
    </Provider>
  );
};

export default CommonPageWrapper;
