import React from 'react';

import { getColumnRender } from '../../ddRender/ddRender';
import { ImageLink } from '../../components/Links';
import { TYPE_CREATE_UPDATE_PAGE, TYPE_GET_PAGE } from '../../constants';

const Demos = () => {
  const fn = getColumnRender('type:listPage', {
    id: 'photos',
    name: 'Photos',
    type: 'STRING_ARRAY',
    [TYPE_CREATE_UPDATE_PAGE]: ['MultiLineInputBox', 'WithPreview'],
    'type:listPage': [
      'ImageLink',
      '{"url":"{{record.photos.[0]}}","imgSrc":"{{record.photos.[0]}}"}',
    ],
    [TYPE_GET_PAGE]: [
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
      <ImageLink
        imgSrc='https://docs.mapbox.com/mapbox-gl-js/assets/cat.png'
        url='https://docs.mapbox.com/mapbox-gl-js/assets/cat.png'
      />
    </>
  );
};

export default Demos;
