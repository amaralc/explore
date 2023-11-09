import { render } from '@testing-library/react';
import * as UnleashClient from '@unleash/proxy-client-react';
import { IfFlagEnabled } from './if-flag-enabled';

// Mock module for all tests
vi.mock('@unleash/proxy-client-react');

describe('IfFlagEnabled', () => {
  it('should render flagged component when the flag is enabled', async () => {
    // Provide the specific mock implementation you need for that test
    vi.mocked(UnleashClient.useFlag).mockReturnValue(true);

    const { container } = render(
      <IfFlagEnabled flagName="my-flag" fallback={<div>Flag is disabled</div>}>
        <div>Flag is enabled</div>
      </IfFlagEnabled>,
    );

    expect(container.innerHTML).toMatch(/Flag is enabled/i);
  });

  it('should render flagged component when the flag is enabled', async () => {
    // Provide the specific mock implementation you need for that test
    vi.mocked(UnleashClient.useFlag).mockReturnValue(false);

    const { container } = render(
      <IfFlagEnabled flagName="my-flag" fallback={<div>Flag is disabled</div>}>
        <div>Flag is enabled</div>
      </IfFlagEnabled>,
    );

    expect(container.innerHTML).toMatch(/Flag is disabled/i);
  });

  it('should render fallback when the flag is not found', async () => {
    vi.mocked(UnleashClient.useFlag).mockImplementation(() => {
      throw new Error('Flag not found');
    });

    const { container } = render(
      <IfFlagEnabled flagName="my-flag" fallback={<div>Flag not found</div>}>
        <div>Flag is enabled</div>
      </IfFlagEnabled>,
    );

    expect(container.innerHTML).toMatch(/Flag not found/i);
  });
});
