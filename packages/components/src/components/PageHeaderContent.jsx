import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

import { dbs } from '../dbs';

const withRouter = (Component) => {
  function Wrapper(props) {
    const params = useParams();
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Component params={params} {...props} />;
  }
  return Wrapper;
};
function PageHeaderContent(props) {
  const { params } = props;

  if (!dbs) {
    return null;
  }

  return (
    <div className="page-header">
      <div key="logo" className="logo" />
      <Menu
        key="menu"
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['home']}
        selectedKeys={[params.dbName]}
        items={[
          { key: 'home', label: <Link to="/">Home</Link> },
          ...Object.keys(dbs || {}).map((dbName) => (
            { key: dbName, label: <Link to={`/${dbName}`}>{dbName}</Link> }
          )),
          { key: 'settings', label: <Link to="/settings">Settings</Link> },
        ]}
      />
    </div>
  );
}

PageHeaderContent.propTypes = {
  params: PropTypes.shape({
    dbName: PropTypes.string,
  }),
};
PageHeaderContent.defaultProps = {
  params: {},
};

export default withRouter(PageHeaderContent);
