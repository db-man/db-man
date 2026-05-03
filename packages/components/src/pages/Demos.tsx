import React from 'react';
import { Outlet, useParams } from 'react-router';
import { Collapse, CollapseProps } from 'antd';

import PhotoListExample from './demos/PhotoListExample';
import ImageLinkExample from './demos/ImageLinkExample';

const Demos = () => {
  const params = useParams();

  const items: CollapseProps['items'] = [
    {
      key: 'ImageLink',
      label: 'ImageLink',
      children: <ImageLinkExample />,
    },
    {
      key: 'PhotoList',
      label: 'PhotoList',
      children: <PhotoListExample />,
    },
  ];

  return (
    <>
      {!params.component && (
        <Collapse items={items} defaultActiveKey={['PhotoList']} />
      )}
      <Outlet />
    </>
  );
};

export default Demos;
