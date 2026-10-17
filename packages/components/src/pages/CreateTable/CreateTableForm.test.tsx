import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import CreateTableForm from './CreateTableForm';
import CommonPageContext from '../../contexts/commonPage';
import * as constants from '../../constants';

jest.mock('../../pages/Settings/helpers', () => ({
  reloadDbsSchemaAsync: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { reloadDbsSchemaAsync } = jest.requireMock(
  '../../pages/Settings/helpers',
);

const commit = { html_url: 'https://github.com/db-man/db.test/commit/8' };

function makeGithubDbV2(overrides: Record<string, unknown> = {}) {
  return {
    createTableSchema: jest.fn().mockResolvedValue({ commit }),
    ...overrides,
  };
}

function renderForm(githubDbV2 = makeGithubDbV2(), dbName = 'iam') {
  render(
    <CommonPageContext.Provider value={{ appModes: [], githubDbV2 } as any}>
      <CreateTableForm dbName={dbName} />
    </CommonPageContext.Provider>,
  );
  return { githubDbV2 };
}

const nameInput = () => screen.getAllByRole('textbox')[0] as HTMLInputElement;
const createButton = () => screen.getByRole('button', { name: 'Create' });

beforeEach(() => {
  (reloadDbsSchemaAsync as jest.Mock).mockReset();
  (reloadDbsSchemaAsync as jest.Mock).mockResolvedValue(undefined);
});

describe('CreateTableForm', () => {
  it('creates the table schema within the given database', async () => {
    const { githubDbV2 } = renderForm();

    fireEvent.change(nameInput(), { target: { value: 'posts' } });
    fireEvent.click(createButton());

    await waitFor(() => {
      expect(githubDbV2.createTableSchema).toHaveBeenCalledWith('iam', {
        name: 'posts',
        description: '',
        tables: [],
      });
    });
    expect(
      await screen.findByText('Table schema created.'),
    ).toBeInTheDocument();
  });

  it('passes the dbName it was given', async () => {
    const { githubDbV2 } = renderForm(makeGithubDbV2(), 'shop');

    fireEvent.click(createButton());

    await waitFor(() => {
      expect(githubDbV2.createTableSchema).toHaveBeenCalledWith(
        'shop',
        expect.anything(),
      );
    });
  });

  it('shows an error alert when creation fails', async () => {
    const githubDbV2 = makeGithubDbV2({
      createTableSchema: jest.fn().mockRejectedValue(new Error('nope')),
    });
    renderForm(githubDbV2);

    fireEvent.click(createButton());

    expect(
      await screen.findByText('Failed to create table schema on server!'),
    ).toBeInTheDocument();
  });

  it('reloads the dbs schema using the stored connection', async () => {
    localStorage.setItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN, 'tok2');
    localStorage.setItem(constants.LS_KEY_GITHUB_OWNER, 'o');
    localStorage.setItem(constants.LS_KEY_GITHUB_REPO_NAME, 'r');
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Reload DBs Schema' }));

    await waitFor(() => {
      expect(reloadDbsSchemaAsync).toHaveBeenCalledWith(
        'tok2',
        'o',
        'r',
        expect.anything(),
      );
    });
  });
});
