import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import BreadcrumbWrapper from './BreadcrumbWrapper';

describe('BreadcrumbWrapper', () => {
  it('renders "Home" link', () => {
    render(<BrowserRouter><BreadcrumbWrapper /></BrowserRouter>);
    const el = screen.getByText(/Home/i);
    expect(el).toBeInTheDocument();
  });
});
