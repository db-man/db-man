import { GithubOutlined } from '@ant-design/icons';
import { Col, Menu, Row } from 'antd';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

import { LS_KEY_GITHUB_OWNER, LS_KEY_GITHUB_REPO_NAME } from '../constants';
import { useAppContext } from '../contexts/AppContext';

type PropsType = { params?: { dbName?: string } };

// TODO: should implement this in GithubDb or Github in @db-man/github, but first need to make sure GithubDb is initialized at the app level.
const getGitHubRepoPath = () => {
  return `https://github.com/${localStorage.getItem(
    LS_KEY_GITHUB_OWNER
  )}/${localStorage.getItem(LS_KEY_GITHUB_REPO_NAME)}`;
};

const withRouter = (Component: any) => {
  function Wrapper(props: PropsType) {
    const params = useParams();
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Component params={params} {...props} />;
  }
  return Wrapper;
};
function PageHeaderContent(props: PropsType) {
  const { params = {} } = props;
  const { dbs, getTablesByDbName } = useAppContext();

  if (!dbs) {
    return null;
  }

  return (
    <div className="dbm-page-header">
      <div key="logo" className="logo" />
      <Row>
        <Col span={20}>
          <Menu
            key="menu"
            theme="dark"
            mode="horizontal"
            className="dbm-top-navbar-menu"
            defaultSelectedKeys={['home']}
            selectedKeys={[params?.dbName || '']}
            items={[
              { key: 'home', label: <Link to="/">Home</Link> },
              ...Object.keys(dbs || {})
                .sort((dbNameA, dbNameB) => dbNameA.localeCompare(dbNameB))
                .map((dbName) => ({
                  key: dbName,
                  label: (
                    <Link to={`/${dbName}`}>
                      {dbName}({getTablesByDbName(dbName).length})
                    </Link>
                  ),
                })),
              { key: 'query', label: <Link to="/query">Query</Link> },
              {
                key: 'create-db',
                label: <Link to="/create-db">Create DB</Link>,
              },
              { key: 'settings', label: <Link to="/settings">Settings</Link> },
            ]}
          />
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          <a href={getGitHubRepoPath()} target="_blank" rel="noreferrer">
            <GithubOutlined />
          </a>
        </Col>
      </Row>
    </div>
  );
}

PageHeaderContent.propTypes = {
  params: PropTypes.shape({
    dbName: PropTypes.string,
  }),
};

export default withRouter(PageHeaderContent);
