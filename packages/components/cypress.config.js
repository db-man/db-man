module.exports = {
  // The rest of the Cypress config options go here...
  projectId: 'mxr8b9',

  e2e: {
    // eslint-disable-next-line no-unused-vars
    setupNodeEvents(on, config) {
      // implement node event listeners here

      // These env vars are mandatory for cypress to work in CI.
      // If not set, just throw error, no reason to run test cases.
      if (!config.env || !config.env.DBM_GH_TOKEN) {
        // In CI, set CYPRESS_DBM_GH_TOKEN env vars to populate Cypress.env('DBM_GH_TOKEN')
        // Check `packages/components/cypress/support/constants.js` for more details.
        throw new Error(
          'Missing required Cypress env: DBM_GH_TOKEN. Set CYPRESS_DBM_GH_TOKEN in CI.'
        );
      }
      return config;
    },
  },

  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },
};
