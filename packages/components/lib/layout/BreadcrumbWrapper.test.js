import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import BreadcrumbWrapper from './BreadcrumbWrapper';
describe('BreadcrumbWrapper', () => {
  it('renders "Home" link', () => {
    render( /*#__PURE__*/React.createElement(BrowserRouter, null, /*#__PURE__*/React.createElement(BreadcrumbWrapper, null)));
    const el = screen.getByText(/Home/i);
    expect(el).toBeInTheDocument();
  });
});