import React from 'react';
import { Outlet, useParams } from 'react-router';
import { Collapse } from 'antd';

import PhotoListExample from './demos/PhotoListExample';
import ImageLinkExample from './demos/ImageLinkExample';

const { Panel } = Collapse;

const Demos = () => {
  const params = useParams();
  return (
    <>
      {!params.component && (
        <Collapse defaultActiveKey={['PhotoList']}>
          <Panel header='ImageLink' key='ImageLink'>
            <ImageLinkExample />
          </Panel>
          <Panel header='PhotoList' key='PhotoList'>
            <PhotoListExample />
          </Panel>
        </Collapse>
      )}
      <Outlet />
    </>
  );
};

export default Demos;
