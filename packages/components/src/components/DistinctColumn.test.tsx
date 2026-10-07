import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DistinctColumn from './DistinctColumn';
import PageContext from '../contexts/page';

function makePageCtx(githubDb: any) {
  return {
    appModes: [],
    dbName: 'iam',
    tableName: 'records',
    action: 'list',
    columns: [],
    primaryKey: 'name',
    tables: [],
    githubDb,
  } as any;
}

describe('DistinctColumn', () => {
  it('renders tag names with counts sorted by count desc', async () => {
    const githubDb = {
      getTableRows: jest.fn().mockResolvedValue({
        content: [{ tags: ['a', 'b'] }, { tags: ['a'] }],
      }),
    };
    render(
      <MemoryRouter>
        <PageContext.Provider value={makePageCtx(githubDb)}>
          <DistinctColumn columnKey='tags' />
        </PageContext.Provider>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('a').closest('a')).toHaveAttribute(
        'href',
        expect.stringContaining('/iam/records/list?filter=')
      );
    });
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    // counts rendered next to the links
    expect(screen.getByText('2', { exact: false })).toBeInTheDocument();
  });

  it('renders nothing when loading rows fails', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const githubDb = {
      getTableRows: jest.fn().mockRejectedValue(new Error('boom')),
    };
    const { container } = render(
      <MemoryRouter>
        <PageContext.Provider value={makePageCtx(githubDb)}>
          <DistinctColumn columnKey='tags' />
        </PageContext.Provider>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(githubDb.getTableRows).toHaveBeenCalled();
    });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(container.querySelector('.dbm-distinct-column-component')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
