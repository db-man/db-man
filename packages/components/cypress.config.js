module.exports = {
  // The rest of the Cypress config options go here...
  projectId: 'mxr8b9',

  e2e: {
    // cy.session() requires enabling the experimentalSessionAndOrigin flag.
    experimentalSessionAndOrigin: true,
    // eslint-disable-next-line no-unused-vars
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
};
