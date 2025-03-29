// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import { ghToken, ghConfig } from './constants';

// Custom command to enable DB connection
Cypress.Commands.add('enableDbConnection', () => {
  // Use cy.session() to keep the session and origin between tests
  // So that we don't need to run step to enable DB connection for every test
  cy.session([], () => {
    // Enable DB connection once before all tests and store the DB schema in localStorage
    cy.visit('http://localhost:3000/settings');

    // add a new connection row
    cy.get('.dbm-editable-table-add-row-btn').click();
    // the column of the new row is an input box, and the context is empty string
    cy.get('.ant-table-row > :nth-child(1) input').should('have.value', '');

    // fill in the connection details
    cy.get('.dbm-editable-table-new-row-editable-cell-title--key').type('1');
    cy.get('.dbm-editable-table-new-row-editable-cell-title--token').type(
      ghToken
    );
    cy.get('.dbm-editable-table-new-row-editable-cell-title--owner').type(
      ghConfig.repoOwner
    );
    cy.get('.dbm-editable-table-new-row-editable-cell-title--repo').type(
      ghConfig.repoName
    );

    // save the connection
    cy.get('.dbm-editable-table-save-link').click();
    // load the connection
    cy.get('.dbm-enable-connection-btn').click();

    // Wait for the Ant Design message to appear
    // wait DOM ready of antd `message.info('Finish loading DBs schema! Will reload window in 3s!');`
    cy.contains(
      'div',
      'Finish loading DBs schema! Will reload window in 3s!'
    ).should('be.visible');
  });
});
