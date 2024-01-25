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

describe('hello', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('displays Settings by default', () => {
    cy.get('span.ant-menu-title-content').should('have.text', 'HomeSettings');
  });
});
