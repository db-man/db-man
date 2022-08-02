function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'antd';
import { ImageLink } from './Links';
const listGrid = {
  gutter: 16,
  xs: 1,
  sm: 2,
  md: 4,
  lg: 4,
  xl: 4,
  xxl: 3
};

const renderItem = item => /*#__PURE__*/React.createElement(List.Item, null, /*#__PURE__*/React.createElement(ImageLink, {
  url: item.url,
  imgSrc: item.imgSrc,
  description: item.description
}));

export default class PhotoList extends React.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "renderDup", () => {
      const {
        photos
      } = this.props;
      const photoMap = {};
      photos.forEach(photo => {
        if (photoMap[photo.url] === undefined) {
          photoMap[photo.url] = 0;
        } else {
          photoMap[photo.url] += 1;
        }
      });
      return Object.keys(photoMap).filter(key => photoMap[key] > 1).map(key => photoMap[key]).join(',');
    });
  }

  render() {
    const {
      photos
    } = this.props;
    return /*#__PURE__*/React.createElement("div", null, this.renderDup(), /*#__PURE__*/React.createElement(List, {
      grid: listGrid,
      dataSource: photos,
      renderItem: renderItem
    }));
  }

}
PhotoList.propTypes = {
  photos: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string.isRequired,
    imgSrc: PropTypes.string.isRequired,
    description: PropTypes.string
  }))
};
PhotoList.defaultProps = {
  photos: []
};