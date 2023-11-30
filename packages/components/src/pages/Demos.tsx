import React from 'react';
import { Collapse } from 'antd';

import PhotoListExample from './demos/PhotoListExample';
import ImageLinkExample from './demos/ImageLinkExample';

const { Panel } = Collapse;

const Demos = () => {
  return (
    <Collapse defaultActiveKey={['PhotoList']}>
      <Panel header='ImageLink' key='ImageLink'>
        <ImageLinkExample />
      </Panel>
      <Panel header='PhotoList' key='PhotoList'>
        <PhotoListExample />
      </Panel>
    </Collapse>
  );
};

export default Demos;
