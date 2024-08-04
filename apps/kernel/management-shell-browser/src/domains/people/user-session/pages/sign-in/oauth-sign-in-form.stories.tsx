import type { Meta, StoryObj } from '@storybook/react';
import { AppProviders } from '../../../../../app-providers';

import { OauthSignInForm } from './oauth-sign-in-form';

const meta: Meta<typeof OauthSignInForm> = {
  component: OauthSignInForm,
  decorators: [
    (Story) => (
      <AppProviders>
        <Story />
      </AppProviders>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OauthSignInForm>;

export const Primary: Story = {
  name: 'With Google and ORCID providers',
  args: {
    providers: ['google', 'orcid'],
  },
};
