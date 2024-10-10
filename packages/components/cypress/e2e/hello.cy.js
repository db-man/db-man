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

const ghOwner = 'db-man';
// export CYPRESS_DBM_TOKEN=123; npx cypress open
// CYPRESS_DBM_TOKEN=123 npx cypress open
const ghToken = Cypress.env('DBM_TOKEN');
const ghRepoName = 'split-table-db';
const ghRepoPath = 'dbs';
const ghRepoModes = 'split-table';

describe('hello', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('displays Settings by default', () => {
    cy.get('span.ant-menu-title-content').debug();
    cy.get('span.ant-menu-title-content').should('have.text', 'HomeSettings');
  });
});

// Custom command to log in
Cypress.Commands.add('enableDbConnection', () => {
  cy.visit('http://localhost:3000/settings');

  // add a new connection row
  cy.get('.dbm-create-connection-btn').click();
  cy.get('.ant-table-row > :nth-child(1)').should('have.text', '0');

  // fill in the connection details
  cy.get('.dbm-new-connection-editable-cell-title-owner').type(ghOwner);
  cy.get('.dbm-new-connection-editable-cell-title-token').type(ghToken);
  cy.get('.dbm-new-connection-editable-cell-title-repo').type(ghRepoName);
  cy.get('.dbm-new-connection-editable-cell-title-path').type(ghRepoPath);
  cy.get('.dbm-new-connection-editable-cell-title-modes').type(ghRepoModes);

  // save the connection
  cy.get('.dbm-save-connection-link').click();
  // load the connection
  cy.get('.dbm-enable-connection-btn').click();

  // Wait for the Ant Design message to appear
  // wait DOM ready of antd `message.info('Finish loading DBs schema! Will reload window in 3s!');`
  cy.contains(
    'div',
    'Finish loading DBs schema! Will reload window in 3s!'
  ).should('be.visible');
});

describe.only('Settings: Setup DB Connection', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/settings');
  });

  it('displays "Settings" title by default', () => {
    cy.get('h1.ant-typography').should('have.text', 'Settings');
  });

  it('click button to create new connection', () => {
    // add a new connection row
    cy.get('.dbm-create-connection-btn').click();
    cy.get('.ant-table-row > :nth-child(1)').should('have.text', '0');

    // fill in the connection details
    cy.get('.dbm-new-connection-editable-cell-title-owner').type(ghOwner);
    cy.get('.dbm-new-connection-editable-cell-title-token').type(ghToken);
    cy.get('.dbm-new-connection-editable-cell-title-repo').type(ghRepoName);
    cy.get('.dbm-new-connection-editable-cell-title-path').type(ghRepoPath);
    cy.get('.dbm-new-connection-editable-cell-title-modes').type(ghRepoModes);

    // save the connection
    cy.get('.dbm-save-connection-link').click();
    // load the connection
    cy.get('.dbm-enable-connection-btn').click();

    // check local storage
    cy.window().then((window) => {
      const ls = window.localStorage;

      const dbConnection = JSON.parse(ls.getItem(LS_KEY_DB_CONNECTIONS))[0];
      expect(dbConnection).to.deep.equal({
        key: '1',
        owner: ghOwner,
        token: ghToken,
        repo: ghRepoName,
        path: ghRepoPath,
        modes: ghRepoModes,
      });

      expect(ls.getItem(LS_KEY_GITHUB_OWNER)).to.equal(ghOwner);
      expect(ls.getItem(LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN)).to.equal(ghToken);
      expect(ls.getItem(LS_KEY_GITHUB_REPO_MODES)).to.equal(ghRepoModes);
      expect(ls.getItem(LS_KEY_GITHUB_REPO_NAME)).to.equal(ghRepoName);
      expect(ls.getItem(LS_KEY_GITHUB_REPO_PATH)).to.equal(ghRepoPath);
    });

    // Wait for the Ant Design message to appear
    // wait DOM ready of antd `message.info('Finish loading DBs schema! Will reload window in 3s!');`
    cy.contains(
      'div',
      'Finish loading DBs schema! Will reload window in 3s!'
    ).should('be.visible');

    // check local storage
    cy.window().then((window) => {
      const dbsSchema = JSON.parse(
        window.localStorage.getItem(LS_KEY_DBS_SCHEMA)
      );
      expect(dbsSchema.iam.length).not.to.equal(0);
    });
  });
});

describe('DB Table: iam/users ListPage Test', () => {
  before(() => {
    // Enable DB connection once before all tests and store the DB schema in localStorage
    cy.enableDbConnection().then(() => {});
  });

  it('displays iam/users by default', () => {
    cy.visit('http://localhost:3000/iam/users/list');
    cy.get('.ant-segmented-item-selected > .ant-segmented-item-label').should(
      'have.text',
      'Table View'
    );
  });
});

describe('DB Table: iam/roles ListPage Test', () => {
  before(() => {
    // Enable DB connection once before all tests and store the DB schema in localStorage
    cy.enableDbConnection().then(() => {});
  });

  it('displays iam/roles by default', () => {
    cy.visit('http://localhost:3000/iam/roles/list');
    cy.get('.ant-segmented-item-selected > .ant-segmented-item-label').should(
      'have.text',
      'Table View'
    );
  });
});
