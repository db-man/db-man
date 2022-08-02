import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

export default function Form({ values, onChange }) {
  const handleChange = (key) => (event) => {
    onChange(key, event.target.value);
  };
  return (
    <div>
      Settings
      <div>
        Owner:
        {' '}
        <Input
          placeholder="e.g. user_name"
          value={values.owner}
          onChange={handleChange('owner')}
        />
        {' '}
        <br />
        Personal token:
        {' '}
        <Input
          placeholder="e.g. 123"
          value={values.token}
          onChange={handleChange('token')}
        />
        {' '}
        <br />
        Repo:
        {' '}
        <Input
          placeholder="e.g. repo_name"
          value={values.repoName}
          onChange={handleChange('repoName')}
        />
        {' '}
        <br />
        Path:
        {' '}
        <Input
          placeholder="e.g. dbs_path"
          value={values.repoPath}
          onChange={handleChange('repoPath')}
        />
        {' '}
        (A path in a github repo)
        <br />

      </div>

    </div>
  );
}

Form.propTypes = {
  values: PropTypes.shape({
    owner: PropTypes.string,
    token: PropTypes.string,
    repoName: PropTypes.string,
    repoPath: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
};
Form.defaultProps = {
  values: {
    owner: '',
    token: '',
    repoName: '',
    repoPath: '',
  },
};
