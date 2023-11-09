import { render } from '@testing-library/react';
import * as UnleashClient from '@unleash/proxy-client-react';
import { FlaggedComponent } from './flagged-component';

// Mock module for all tests
vi.mock('@unleash/proxy-client-react');

describe('FlaggedComponent', () => {
  it('should render flagged component when the flag is enabled', async () => {
    // Provide the specific mock implementation you need for that test
    vi.mocked(UnleashClient.useFlag).mockReturnValue(true);

    const { container } = render(
      <FlaggedComponent flagName="my-flag" fallback={<div>Flag is disabled</div>}>
        <div>Flag is enabled</div>
      </FlaggedComponent>,
    );

    expect(container.innerHTML).toMatch(/Flag is enabled/i);
  });

  it('should render fallback component when the flag is disabled', async () => {
    // Provide the specific mock implementation you need for that test
    vi.mocked(UnleashClient.useFlag).mockReturnValue(false);

    const { container } = render(
      <FlaggedComponent flagName="my-flag" fallback={<div>Flag is disabled</div>}>
        <div>Flag is enabled</div>
      </FlaggedComponent>,
    );

    expect(container.innerHTML).toMatch(/Flag is disabled/i);
  });

  it.only('should throw error when the flag is not found', async () => {
    vi.mocked(UnleashClient.useFlag).mockImplementation(() => {
      throw new Error('Flag not found');
    });

    try {
      render(
        <FlaggedComponent flagName="my-flag" fallback={<div>Flag not found</div>}>
          <div>Flag is enabled</div>
        </FlaggedComponent>,
      );
      fail('should throw error');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
