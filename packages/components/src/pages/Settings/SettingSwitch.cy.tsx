import React from 'react';
import SettingSwitch from './SettingSwitch';

describe('<SettingSwitch />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<SettingSwitch label='Test' storageKey='foo' />);
  });
});
