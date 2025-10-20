import React, { useRef } from 'react';
import { GithubDb } from '@db-man/github';

import CommonPageContext from '../contexts/commonPage';
import NotFound from '../components/NotFound';

import * as constants from '../constants';

const { Provider } = CommonPageContext;

type Props = {
  children: React.ReactNode;
};

// TODO: Because this file is copied from DbTablePage.tsx, so some of the codes are duplicated
const CommonPageWrapper = (props: Props) => {
  const githubDbRef = useRef<GithubDb | null>(null);

  if (!localStorage.getItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN)) {
    // Normally this is because we dont enable any db connection
    return <NotFound name="enabled db connection" />;
  }

  githubDbRef.current = new GithubDb({
    personalAccessToken:
      localStorage.getItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN) || '',
    repoPath: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_PATH) || '',
    owner: localStorage.getItem(constants.LS_KEY_GITHUB_OWNER) || '',
    repoName: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_NAME) || '',
    dbsSchema: JSON.parse(
      localStorage.getItem(constants.LS_KEY_DBS_SCHEMA) || '{}'
    ),
  });

  const pageInfo = () => {
    return {
      // e.g. ['split-table']
      appModes: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES)
        ? localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES)!.split(',')
        : [],
      githubDb: githubDbRef.current,
    };
  };

  return (
    <Provider value={pageInfo()}>
      <div className="dbm-page-v2">{props.children}</div>
    </Provider>
  );
};

export default CommonPageWrapper;
