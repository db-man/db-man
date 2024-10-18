import React, { useRef } from 'react';
import { GithubDb } from '@db-man/github';

import * as constants from '../constants';
import CommonPageContext from '../contexts/commonPage';
import NavBar from '../components/NavBar';

const { Provider } = CommonPageContext;

type Props = {
  children: React.ReactNode;
};

// TODO: Because this file is copied from DbTablePageWrapper.tsx, so some of the codes are duplicated
const CommonPageWrapper = (props: Props) => {
  const githubDbRef = useRef(
    new GithubDb({
      personalAccessToken:
        localStorage.getItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN) ||
        '',
      repoPath: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_PATH) || '',
      owner: localStorage.getItem(constants.LS_KEY_GITHUB_OWNER) || '',
      repoName: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_NAME) || '',
      dbsSchema: localStorage.getItem(constants.LS_KEY_DBS_SCHEMA) || '',
    })
  );

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
      <div className='dbm-page-v2'>
        {props.children}
        <NavBar />
      </div>
    </Provider>
  );
};

export default CommonPageWrapper;
