import React from 'react';

import { getColumnRender } from '../../ddRender/ddRender';
import { ImageLink } from '../../components/Links';

const Demos = () => {
  const fn = getColumnRender('type:listPage', {
    id: 'photos',
    name: 'Photos',
    type: 'STRING_ARRAY',
    'type:createUpdatePage': ['MultiLineInputBox', 'WithPreview'],
    'type:listPage': [
      'ImageLink',
      '{"url":"{{record.photos.[0]}}","imgSrc":"{{record.photos.[0]}}"}',
    ],
    'type:getPage': [
      'ImageLink',
      '{"url":"{{record.photos.[0]}}","imgSrc":"{{record.photos.[0]}}"}',
    ],
  });

  return (
    <>
      Render from ddRender:
      {fn('https://docs.mapbox.com/mapbox-gl-js/assets/cat.png', {
        id: 'foo',
        photos: ['https://docs.mapbox.com/mapbox-gl-js/assets/cat.png'],
      })}
      Render from component:
      <ImageLink>https://docs.mapbox.com/mapbox-gl-js/assets/cat.png</ImageLink>
    </>
  );
};

export default Demos;
