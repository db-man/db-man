import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import CreateDbPage from './index';
import CommonPageContext from '../../contexts/commonPage';
import * as constants from '../../constants';

/**
 * `reloadDbsSchemaAsync` constructs its own `Github` client and hits the
 * network, so the helper module is mocked. The implementation is set inside
 * `beforeEach` because CRA sets `resetMocks: true`.
 */
jest.mock('../../pages/Settings/helpers', () => ({
  reloadDbsSchemaAsync: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { reloadDbsSchemaAsync } = jest.requireMock(
  '../../pages/Settings/helpers',
);

const commit = { html_url: 'https://github.com/db-man/db.test/commit/7' };

function makeGithubDbV2(overrides: Record<string, unknown> = {}) {
  return {
    createDatabaseSchema: jest.fn().mockResolvedValue({ commit }),
    ...overrides,
  };
}

function renderPage(githubDbV2 = makeGithubDbV2()) {
  render(
    <CommonPageContext.Provider value={{ appModes: [], githubDbV2 } as any}>
      <CreateDbPage />
    </CommonPageContext.Provider>,
  );
  return { githubDbV2 };
}

const nameInput = () => screen.getAllByRole('textbox')[0] as HTMLInputElement;
const descriptionInput = () =>
  screen.getAllByRole('textbox')[1] as HTMLInputElement;
const createButton = () => screen.getByRole('button', { name: 'Create' });

beforeEach(() => {
  (reloadDbsSchemaAsync as jest.Mock).mockReset();
  (reloadDbsSchemaAsync as jest.Mock).mockResolvedValue(undefined);
});

describe('CreateDbPage', () => {
  it('creates the database schema from the form values', async () => {
    const { githubDbV2 } = renderPage();

    fireEvent.change(nameInput(), { target: { value: 'blog' } });
    fireEvent.change(descriptionInput(), { target: { value: 'My blog' } });
    fireEvent.click(createButton());

    await waitFor(() => {
      expect(githubDbV2.createDatabaseSchema).toHaveBeenCalledWith({
        name: 'blog',
        description: 'My blog',
        tables: [],
      });
    });
    expect(
      await screen.findByText('Database schema created.'),
    ).toBeInTheDocument();
  });

  it('creates the database schema from the JSON editor', async () => {
    const { githubDbV2 } = renderPage();

    fireEvent.click(screen.getByRole('tab', { name: 'JSON' }));
    const textareas = (await screen.findAllByRole(
      'textbox',
    )) as HTMLTextAreaElement[];
    const jsonTextarea = textareas.find((t) => t.value.startsWith('{'));
    fireEvent.change(jsonTextarea as HTMLElement, {
      target: {
        value: '{"name": "json-db", "description": "from json", "tables": []}',
      },
    });
    fireEvent.click(createButton());

    await waitFor(() => {
      expect(githubDbV2.createDatabaseSchema).toHaveBeenCalledWith({
        name: 'json-db',
        description: 'from json',
        tables: [],
      });
    });
  });

  it('shows an error alert when creation fails', async () => {
    const githubDbV2 = makeGithubDbV2({
      createDatabaseSchema: jest.fn().mockRejectedValue(new Error('boom')),
    });
    renderPage(githubDbV2);

    fireEvent.click(createButton());

    expect(
      await screen.findByText('Failed to create database schema on server!'),
    ).toBeInTheDocument();
  });

  it('reloads the dbs schema using the stored connection', async () => {
    localStorage.setItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN, 'tok');
    localStorage.setItem(constants.LS_KEY_GITHUB_OWNER, 'db-man');
    localStorage.setItem(constants.LS_KEY_GITHUB_REPO_NAME, 'db');
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Reload DBs Schema' }));

    await waitFor(() => {
      expect(reloadDbsSchemaAsync).toHaveBeenCalledWith(
        'tok',
        'db-man',
        'db',
        expect.anything(),
      );
    });
  });
});
