import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';
export default function Form({
  values,
  onChange
}) {
  const handleChange = key => event => {
    onChange(key, event.target.value);
  };

  return /*#__PURE__*/React.createElement("div", null, "Settings", /*#__PURE__*/React.createElement("div", null, "Owner:", ' ', /*#__PURE__*/React.createElement(Input, {
    placeholder: "e.g. user_name",
    value: values.owner,
    onChange: handleChange('owner')
  }), ' ', /*#__PURE__*/React.createElement("br", null), "Personal token:", ' ', /*#__PURE__*/React.createElement(Input, {
    placeholder: "e.g. 123",
    value: values.token,
    onChange: handleChange('token')
  }), ' ', /*#__PURE__*/React.createElement("br", null), "Repo:", ' ', /*#__PURE__*/React.createElement(Input, {
    placeholder: "e.g. repo_name",
    value: values.repoName,
    onChange: handleChange('repoName')
  }), ' ', /*#__PURE__*/React.createElement("br", null), "Path:", ' ', /*#__PURE__*/React.createElement(Input, {
    placeholder: "e.g. dbs_path",
    value: values.repoPath,
    onChange: handleChange('repoPath')
  }), ' ', "(A path in a github repo)", /*#__PURE__*/React.createElement("br", null)));
}
Form.propTypes = {
  values: PropTypes.shape({
    owner: PropTypes.string,
    token: PropTypes.string,
    repoName: PropTypes.string,
    repoPath: PropTypes.string
  }),
  onChange: PropTypes.func.isRequired
};
Form.defaultProps = {
  values: {
    owner: '',
    token: '',
    repoName: '',
    repoPath: ''
  }
};