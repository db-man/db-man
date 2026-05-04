import React from 'react';
import { Outlet, useParams } from 'react-router';
import { Collapse, CollapseProps } from 'antd';

import PhotoListExample from './demos/PhotoListExample';
import ImageLinkExample from './demos/ImageLinkExample';
import FormDemo from '../components/Form/FormDemo';

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
    {
      key: 'Form',
      label: 'Form',
      children: <FormDemo />,
    },
  ];

  return (
    <>
      {!params.component && (
        <Collapse items={items} defaultActiveKey={['Form']} />
      )}
      <Outlet />
    </>
  );
};

export default Demos;
