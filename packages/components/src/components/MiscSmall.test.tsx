import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';
import Warning from './Warning';
import ExternalLink from './ExternalLink';
import CommitSuccessMessage from './CommitSuccessMessage';
import Message from './Message';

describe('NotFound', () => {
  it('renders the name and a link to settings', () => {
    render(
      <MemoryRouter>
        <NotFound name='Table' />
      </MemoryRouter>
    );
    expect(screen.getByText(/Table not found/)).toBeInTheDocument();
    expect(screen.getByText('Go to Settings').closest('a')).toHaveAttribute(
      'href',
      '/settings'
    );
  });
});

describe('Warning', () => {
  it('renders the warning texts', () => {
    render(<Warning />);
    expect(
      screen.getByText('Google API not loaded!')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/turn off the Adblock Plus/)
    ).toBeInTheDocument();
  });
});

describe('ExternalLink', () => {
  it('renders an external anchor', () => {
    render(<ExternalLink href='https://example.com' text='Docs' />);
    const link = screen.getByText('Docs').closest('a') as HTMLElement;
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });
});

describe('CommitSuccessMessage', () => {
  it('renders the message with the commit link', () => {
    render(
      <CommitSuccessMessage
        message='Record updated'
        url='https://github.com/commit/1'
      />
    );
    expect(screen.getByText(/Record updated/)).toBeInTheDocument();
    expect(screen.getByText('Commit link').closest('a')).toHaveAttribute(
      'href',
      'https://github.com/commit/1'
    );
  });
});

describe('Message', () => {
  it('renders the message body', () => {
    render(<Message message='Loading gapi...' />);
    expect(screen.getByText('Loading gapi...')).toBeInTheDocument();
  });

  it('renders nothing when message is empty', () => {
    const { container } = render(<Message message='' />);
    expect(container).toBeEmptyDOMElement();
  });
});
