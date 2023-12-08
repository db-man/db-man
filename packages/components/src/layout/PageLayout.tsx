import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Layout } from 'antd';

import BreadcrumbWrapper from './BreadcrumbWrapper';
import LeftSideMenu from '../components/LeftSideMenu';
import PageHeaderContent from '../components/PageHeaderContent';

const { Header, Content, Sider } = Layout;

export default function PageLayout() {
  const { dbName, tableName, action } = useParams();
  return (
    <Layout>
      <Header className='header' style={{ height: '30px', lineHeight: '30px' }}>
        <PageHeaderContent />
      </Header>
      <Layout>
        <Sider width={300} className='site-layout-background' collapsible>
          {dbName ? (
            <LeftSideMenu
              dbName={dbName}
              tableName={tableName}
              action={action}
            />
          ) : null}
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <BreadcrumbWrapper
            dbName={dbName}
            tableName={tableName}
            action={action}
          />
          <Content
            className='site-layout-background'
            style={{
              // padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
