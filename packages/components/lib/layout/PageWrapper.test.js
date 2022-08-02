import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, act, waitFor } from '@testing-library/react';
import { githubDb } from '@db-man/github';
import * as constants from '../constants';
import { setDbs } from '../dbs';
import PageWrapper from './PageWrapper';
jest.mock('@db-man/github');
describe('PageWrapper', () => {
  it('renders err when no db schema defined', () => {
    render( /*#__PURE__*/React.createElement(BrowserRouter, null, /*#__PURE__*/React.createElement(PageWrapper, null)));
    const el = screen.getByText(/No DBS schema defined in localStorage!/i);
    expect(el).toBeInTheDocument();
  });
  it('renders 404 when url not pass dbName', () => {
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem');
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');
    Object.getPrototypeOf(window.localStorage).getItem = jest.fn(key => {
      if (key === constants.LS_KEY_DBS_SCHEMA) {
        return '{"iam":[{"name":"users","columns":[{"id":"email","primary":true}]}]}';
      }

      return null;
    });
    Object.getPrototypeOf(window.localStorage).setItem = jest.fn();
    render( /*#__PURE__*/React.createElement(BrowserRouter, null, /*#__PURE__*/React.createElement(PageWrapper, null))); // screen.debug();

    const el = screen.getByText(/dbName is undefined/i);
    expect(el).toBeInTheDocument();
  });
  it('renders when no columns for this table', () => {
    const dbsSchema = {
      iam: [{
        name: 'users',
        columns: []
      }]
    };
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem');
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');
    Object.getPrototypeOf(window.localStorage).getItem = jest.fn(key => {
      if (key === constants.LS_KEY_DBS_SCHEMA) {
        return JSON.stringify(dbsSchema);
      }

      return null;
    });
    Object.getPrototypeOf(window.localStorage).setItem = jest.fn(); // Prepare db schema in localStorage

    setDbs(JSON.stringify(dbsSchema));
    render( /*#__PURE__*/React.createElement(BrowserRouter, null, /*#__PURE__*/React.createElement(PageWrapper, {
      dbName: "iam",
      tableName: "users",
      action: "list"
    })));
    const el = screen.getByText(/No columns found for this table!/i);
    expect(el).toBeInTheDocument();
  });
  it('renders', async () => {
    const dbsSchema = {
      iam: [{
        name: 'users',
        columns: [{
          id: 'userId',
          name: 'User ID',
          primary: true
        }]
      }]
    };
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem');
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');
    Object.getPrototypeOf(window.localStorage).getItem = jest.fn(key => {
      if (key === constants.LS_KEY_DBS_SCHEMA) {
        return JSON.stringify(dbsSchema);
      }

      return null;
    });
    Object.getPrototypeOf(window.localStorage).setItem = jest.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        // deprecated
        removeListener: jest.fn(),
        // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))
    });
    githubDb.getTableRows.mockReset();
    githubDb.getTableRows.mockResolvedValue({
      content: [{
        userId: '123'
      }]
    }); // Prepare db schema in localStorage

    setDbs(JSON.stringify(dbsSchema));
    act(() => {
      render( /*#__PURE__*/React.createElement(BrowserRouter, null, /*#__PURE__*/React.createElement(PageWrapper, {
        dbName: "iam",
        tableName: "users",
        action: "list"
      })));
    });
    await screen.findByText('Loading iam/users ...');
    await waitFor(() => expect(document.title).toEqual('list users'));
    await waitFor(() => expect(githubDb.getTableRows).toHaveBeenCalledTimes(1));
    await screen.findByText('123');
  });
});