import { render } from '@testing-library/react';
// import * as UnleashClient from '@unleash/proxy-client-react';
import { flagManager } from '../flag-manager';
import { IfFlagEnabled } from './if-flag-enabled';

// Mock module for all tests
// vi.mock('@unleash/proxy-client-react');

describe('IfFlagEnabled', () => {
  it('should render flagged component when the flag is enabled', async () => {
    // Provide the specific mock implementation you need for that test
    vi.spyOn(flagManager, 'getDynamicFlag').mockReturnValue(true);

    const fakeFlag = 'my-flag'; // Force type to avoid TypeScript Error
    const { container } = render(
      <IfFlagEnabled flagName={fakeFlag} fallback={<div>Flag is disabled</div>}>
        <div>Flag is enabled</div>
      </IfFlagEnabled>,
    );

    expect(container.innerHTML).toMatch(/Flag is enabled/i);
  });

  it('should render fallback component when the flag is disabled', async () => {
    // Provide the specific mock implementation you need for that test
    vi.spyOn(flagManager, 'getDynamicFlag').mockReturnValue(false);

    const fakeFlag = 'my-flag';
    const { container } = render(
      <IfFlagEnabled flagName={fakeFlag} fallback={<div>Flag is disabled</div>}>
        <div>Flag is enabled</div>
      </IfFlagEnabled>,
    );

    expect(container.innerHTML).toMatch(/Flag is disabled/i);
  });

  it('should render fallback when the flag is not found', async () => {
    vi.spyOn(flagManager, 'getDynamicFlag').mockImplementation(() => {
      throw new Error('Flag not found');
    });

    const fakeFlag = 'my-flag';
    const { container } = render(
      <IfFlagEnabled flagName={fakeFlag} fallback={<div>Flag not found</div>}>
        <div>Flag is enabled</div>
      </IfFlagEnabled>,
    );

    expect(container.innerHTML).toMatch(/Flag not found/i);
  });
});
