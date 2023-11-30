import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

import { useAppContext } from '../contexts/AppContext';

type PropsType = { params?: { dbName: string } };

const withRouter = (Component: any) => {
  function Wrapper(props: PropsType) {
    const params = useParams();
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Component params={params} {...props} />;
  }
  return Wrapper;
};
function PageHeaderContent(props: PropsType) {
  const { params } = props;
  const { dbs } = useAppContext();

  if (!dbs) {
    return null;
  }

  return (
    <div className='page-header'>
      <div key='logo' className='logo' />
      <Menu
        key='menu'
        theme='dark'
        mode='horizontal'
        defaultSelectedKeys={['home']}
        selectedKeys={[params?.dbName || '']}
        items={[
          { key: 'home', label: <Link to='/'>Home</Link> },
          ...Object.keys(dbs || {}).map((dbName) => ({
            key: dbName,
            label: <Link to={`/${dbName}`}>{dbName}</Link>,
          })),
          { key: 'settings', label: <Link to='/settings'>Settings</Link> },
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
