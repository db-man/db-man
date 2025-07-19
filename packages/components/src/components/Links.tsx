import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

import * as types from './types';
import { PhotoType } from './PhotoList';
import { downloadImage } from '../utils';
import { LS_SHOW_DOWNLOAD_BUTTON } from '../constants';

export function Fragment({ children }: { children: React.ReactNode }) {
  return <React.Fragment>{children}</React.Fragment>;
}

const isShow = () =>
  localStorage.getItem(LS_SHOW_DOWNLOAD_BUTTON) === 'true'
    ? {}
    : { display: 'none' };

export function Link({
  children = '',
  href = '',
  text = '',
}: {
  children?: string;
  href?: string;
  text?: string;
}) {
  if (children) {
    return (
      <a
        className='dbm-dd-link'
        href={children}
        target='_blank'
        rel='noreferrer'
      >
        {children}
      </a>
    );
  }
  return (
    <a className='dbm-dd-link' href={href} target='_blank' rel='noreferrer'>
      {text}
    </a>
  );
}
Link.propTypes = types.linkShape;

export function Links({
  links = [],
}: {
  links: {
    href?: string;
    text?: string;
  }[];
}) {
  return (
    <div>
      {links.map(({ href, text }, index) => (
        /* eslint-disable-next-line react/no-array-index-key */
        <Link key={index} href={href} text={text} />
      ))}
    </div>
  );
}
Links.propTypes = {
  links: PropTypes.arrayOf(types.link),
};

/**
 * @param {string|string[]|undefined} props.description
 * @returns
 */
export function ImageLink({
  children = '',
  url = '',
  imgSrc = '',
  description = '',
}: {
  children?: string;
} & PhotoType) {
  let url2 = url;
  let imgSrc2 = imgSrc;
  if (children) {
    url2 = children;
    imgSrc2 = children;
  }
  return (
    <div className='dbm-dd-image-link'>
      <a href={url2} rel='noreferrer' target='_blank'>
        <span>{url2}</span>
        <img alt='ImageLink' src={imgSrc2} />
      </a>
      <br />
      {description}
      <div style={isShow()}>
        <Button
          className='dbm-dd-image-link-download-btn'
          onClick={() => {
            downloadImage(url2);
          }}
        >
          Download
        </Button>
      </div>
    </div>
  );
}
ImageLink.propTypes = {
  children: PropTypes.string,
  url: PropTypes.string,
  imgSrc: PropTypes.string,
  description: PropTypes.string,
};

// eslint-disable-next-line react/prop-types
export function ImageLinks({
  imgs,
  limit = 3,
}: {
  imgs: PhotoType[];
  limit?: number;
}) {
  if (!imgs) return null;

  let results = imgs;
  if (limit !== null) {
    // eslint-disable-next-line react/prop-types
    results = imgs.slice(0, limit);
  }
  // eslint-disable-next-line react/no-array-index-key, react/jsx-props-no-spreading
  return (
    <div className='dbm-dd-image-links'>
      {results.map((img, index) => (
        <ImageLink key={index} {...img} />
      ))}
    </div>
  );
}
