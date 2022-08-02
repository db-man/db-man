import React from 'react';
import { render, screen } from '@testing-library/react';
import { Fragment, Link, Links, ImageLink, ImageLinks } from './Links';
describe('Fragment', () => {
  it('renders "foo" text', () => {
    render( /*#__PURE__*/React.createElement(Fragment, null, "foo"));
    const el = screen.getByText(/foo/i);
    expect(el).toBeInTheDocument();
  });
});
describe('Link', () => {
  describe('given a text to child', () => {
    it('renders link with "foo" text', () => {
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      render( /*#__PURE__*/React.createElement(Link, null, "https://foo.com/"));
      const linkElement = screen.getByText(/foo/i);
      expect(linkElement).toBeInTheDocument();
    });
  });
  describe('given a text to props', () => {
    it('renders link with "bar" text', () => {
      render( /*#__PURE__*/React.createElement(Link, {
        href: "https://foo.com/",
        text: "bar"
      }));
      const linkElement = screen.getByText(/bar/i);
      expect(linkElement).toBeInTheDocument();
    });
  });
});
describe('Links', () => {
  it('renders one link with "bar" text', () => {
    render( /*#__PURE__*/React.createElement(Links, {
      links: [{
        href: 'https://foo.com/',
        text: 'bar'
      }]
    }));
    const linkElement = screen.getByText(/bar/i);
    expect(linkElement).toBeInTheDocument();
  });
});
describe('ImageLink', () => {
  it('renders one image', () => {
    render( /*#__PURE__*/React.createElement(ImageLink, {
      url: "",
      imgSrc: ""
    }));
    const imgElement = screen.getByRole('img');
    expect(imgElement).toBeInTheDocument();
  });
});
describe('ImageLinks', () => {
  it('invalid inputs', () => {
    const {
      container
    } = render( /*#__PURE__*/React.createElement(ImageLinks, null));
    expect(container.children).toHaveLength(0);
  });
  it('renders 2 images', () => {
    render( /*#__PURE__*/React.createElement(ImageLinks, {
      imgs: [{
        url: '',
        imgSrc: ''
      }, {
        url: '',
        imgSrc: ''
      }]
    }));
    const imgElements = screen.getAllByRole('img');
    expect(imgElements[0]).toBeInTheDocument();
    expect(imgElements[1]).toBeInTheDocument();
  });
  it('renders 1 image when input is 2 images', () => {
    render( /*#__PURE__*/React.createElement(ImageLinks, {
      imgs: [{
        url: '',
        imgSrc: ''
      }, {
        url: '',
        imgSrc: ''
      }],
      limit: 1
    }));
    const imgElements = screen.getAllByRole('img');
    expect(imgElements[0]).toBeInTheDocument();
    expect(imgElements).toHaveLength(1);
  });
});