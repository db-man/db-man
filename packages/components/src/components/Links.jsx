import React from 'react';
import PropTypes from 'prop-types';
import * as types from './types';

export function Fragment(props) {
  return props.children;
}

export function Link({ children, href, text }) {
  if (children) {
    return (
      <a
        className="dm-dd-link"
        href={children}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <a
      className="dm-dd-link"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {text}
    </a>
  );
}
Link.propTypes = types.linkShape;
Link.defaultProps = {
  children: '',
  href: '',
  text: '',
};

export function Links({ links }) {
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
Links.defaultProps = {
  links: [],
};

/**
 * @param {string|string[]|undefined} props.description
 * @returns
 */
export function ImageLink({
  children, url, imgSrc, description,
}) {
  let url2 = url;
  let imgSrc2 = imgSrc;
  if (children) {
    url2 = children;
    imgSrc2 = children;
  }
  return (
    <div>
      <a className="dm-dd-image-link" href={url2} rel="noreferrer" target="_blank">
        <span>{url2}</span>
        <img alt="ImageLink" src={imgSrc2} />
      </a>
      <br />
      {description}
    </div>
  );
}
ImageLink.propTypes = {
  children: PropTypes.string,
  url: PropTypes.string,
  imgSrc: PropTypes.string,
  description: PropTypes.string,
};
ImageLink.defaultProps = {
  children: '',
  url: '',
  imgSrc: '',
  description: '',
};

export function ImageLinks({ imgs, limit = 3 }) {
  if (!imgs) return null;

  let results = imgs;
  if (limit !== null) {
    results = imgs.slice(0, limit);
  }
  // eslint-disable-next-line react/no-array-index-key, react/jsx-props-no-spreading
  return results.map((img, index) => <ImageLink key={index} {...img} />);
}
