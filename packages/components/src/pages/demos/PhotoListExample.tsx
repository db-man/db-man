import React from 'react';

import PhotoList from '../../components/PhotoList';
import { getColumnRender } from '../../ddRender/ddRender';
import renderFuncTpl from './renderFuncTpl.json';
import { TYPE_GET_PAGE } from '../../constants';

export const mockPhotos = [
  {
    url: 'https://img.alicdn.com/imgextra/i4/2215303353339/O1CN01VY1jcw1aXJL8LNRKa_!!2215303353339.jpg',
    imgSrc:
      'https://img.alicdn.com/imgextra/i4/2215303353339/O1CN01VY1jcw1aXJL8LNRKa_!!2215303353339.jpg',
    description: 'Image 1',
  },
  {
    url: 'https://img.alicdn.com/imgextra/i1/2331926889/O1CN01vZChZl20lDMs1t8rC_!!2331926889.jpg',
    imgSrc:
      'https://img.alicdn.com/imgextra/i1/2331926889/O1CN01vZChZl20lDMs1t8rC_!!2331926889.jpg',
    description: 'Image 2',
  },
  {
    url: 'https://img.alicdn.com/imgextra/i3/2215580087668/O1CN011Cqzdd26Vzqqnj1bT_!!2215580087668.jpg',
    imgSrc:
      'https://img.alicdn.com/imgextra/i3/2215580087668/O1CN011Cqzdd26Vzqqnj1bT_!!2215580087668.jpg',
    description: 'Image 3',
  },
];

const PhotoListExample = () => {
  // To render the 'photo' column on a GetPage using 'PhotoList' component
  const getPageRenderFn = getColumnRender(TYPE_GET_PAGE, {
    id: 'photos',
    name: 'Photos',
    type: 'STRING_ARRAY',
    // [TYPE_CREATE_UPDATE_PAGE]: ['MultiLineInputBox', 'WithPreview'],
    // 'type:listPage': [
    //   'ImageLink',
    //   '{"url":"{{record.photos.[0]}}","imgSrc":"{{record.photos.[0]}}"}',
    // ],
    [TYPE_GET_PAGE]: ['PhotoList', renderFuncTpl],
  });

  const record = {
    id: 'foo',
    photos: [
      'https://img.alicdn.com/imgextra/i4/2215303353339/O1CN01VY1jcw1aXJL8LNRKa_!!2215303353339.jpg',
    ],
  };
  const value = record.photos;

  return (
    <div>
      <h1>Render from ddRender (failed):</h1>
      {getColumnRender(TYPE_GET_PAGE, {
        id: 'photos',
        name: 'Photos',
        type: 'STRING_ARRAY',
        [TYPE_GET_PAGE]: ['PhotoList', '["PhotoList","]'],
      })(value, record)}

      <h1>Render from ddRender:</h1>
      {getPageRenderFn(value, record)}

      <h1>Render from component:</h1>
      <PhotoList photos={mockPhotos} />
    </div>
  );
};

export default PhotoListExample;
