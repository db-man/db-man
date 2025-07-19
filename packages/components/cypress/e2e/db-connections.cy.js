/// <reference types="cypress" />

// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

import {
  LS_KEY_DB_CONNECTIONS,
  LS_KEY_GITHUB_OWNER,
  LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN,
  LS_KEY_GITHUB_REPO_MODES,
  LS_KEY_GITHUB_REPO_NAME,
  LS_KEY_GITHUB_REPO_PATH,
  LS_KEY_DBS_SCHEMA,
} from '../../src/constants';

import { ghToken, ghConfig } from '../support/constants';

describe('Settings: Setup DB Connection', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/settings');
  });

  it('displays "Settings" title by default', () => {
    cy.get('h1.ant-typography').should('have.text', 'Settings');
  });

  it('click button to create new connection', () => {
    // add a new connection row
    cy.get('.dbm-editable-table-add-row-btn').click();
    // the column of the new row is an input box, and the context is empty string
    cy.get('.ant-table-row > :nth-child(1) input').should('have.value', '');
    // fill in the connection details
    cy.get('.dbm-editable-table-new-row-editable-cell-title--key').type('1');
    cy.get('.dbm-editable-table-new-row-editable-cell-title--owner').type(
      ghConfig.repoOwner
    );
    cy.get('.dbm-editable-table-new-row-editable-cell-title--token').type(
      ghToken
    );
    cy.get('.dbm-editable-table-new-row-editable-cell-title--repo').type(
      ghConfig.repoName
    );

    // save the connection
    cy.get('.dbm-editable-table-save-link').click();
    // load the connection
    cy.get('.dbm-enable-connection-btn').click();

    // check local storage
    cy.window().then((window) => {
      const ls = window.localStorage;

      const dbConnection = JSON.parse(ls.getItem(LS_KEY_DB_CONNECTIONS))[0];
      expect(dbConnection).to.deep.equal({
        key: '1',
        owner: ghConfig.repoOwner,
        token: ghToken,
        repo: ghConfig.repoName,
      });

      expect(ls.getItem(LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN)).to.equal(ghToken);
      expect(ls.getItem(LS_KEY_GITHUB_OWNER)).to.equal(ghConfig.repoOwner);
      expect(ls.getItem(LS_KEY_GITHUB_REPO_NAME)).to.equal(ghConfig.repoName);
    });

    // Wait for the Ant Design message to appear
    // wait DOM ready of antd `message.info('Finish loading DBs schema! Will reload window in 3s!');`
    cy.contains(
      'div',
      'Finish loading DBs schema! Will reload window in 3s!'
    ).should('be.visible');

    // check local storage
    cy.window().then((window) => {
      const ls = window.localStorage;
      expect(ls.getItem(LS_KEY_GITHUB_REPO_PATH)).to.equal(ghConfig.repoPath);
      expect(ls.getItem(LS_KEY_GITHUB_REPO_MODES)).to.equal(ghConfig.dbModes);
      const dbsSchema = JSON.parse(
        window.localStorage.getItem(LS_KEY_DBS_SCHEMA)
      );
      expect(dbsSchema.iam.length).not.to.equal(0);
    });
  });
});
