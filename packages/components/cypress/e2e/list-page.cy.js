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
    cy.get('span.ant-menu-title-content').debug();
    cy.get('span.ant-menu-title-content').should(
      'have.text',
      'HomeQueryCreate DBSettings'
    );
  });
});

describe('DB Table: ListPage Test', () => {
  beforeEach(() => {
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

  it('displays iam/roles by default', () => {
    cy.visit('http://localhost:3000/iam/roles/list');
    cy.get('.ant-segmented-item-selected > .ant-segmented-item-label').should(
      'have.text',
      'Table View'
    );
  });
});
