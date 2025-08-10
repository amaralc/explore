import { render } from '@testing-library/react';
import { flagManager } from '../flag-manager';
import { FlaggedComponent } from './flagged-component';

// import * as UnleashClient from '@unleash/proxy-client-react';
// Mock module for all tests
// vi.mock('@unleash/proxy-client-react');

describe('FlaggedComponent', () => {
  it('should render flagged component when the flag is enabled', async () => {
    // Provide the specific mock implementation you need for that test
    vi.spyOn(flagManager, 'getDynamicFlag').mockReturnValue(true);

    const { container } = render(
      <FlaggedComponent flagName="VITE_FEATURE_FLAG_PEER_547_GOOGLE_SSO_ENABLED" fallback={<div>Flag is disabled</div>}>
        <div>Flag is enabled</div>
      </FlaggedComponent>,
    );

    expect(container.innerHTML).toMatch(/Flag is enabled/i);
  });

  it('should render fallback component when the flag is disabled', async () => {
    // Provide the specific mock implementation you need for that test
    vi.spyOn(flagManager, 'getDynamicFlag').mockReturnValue(false);

    const { container } = render(
      <FlaggedComponent flagName="untitledSectionEnabled" fallback={<div>Flag is disabled</div>}>
        <div>Flag is enabled</div>
      </FlaggedComponent>,
    );

    expect(container.innerHTML).toMatch(/Flag is disabled/i);
  });

  it('should throw error when the flag is not found', async () => {
    const invalidFlagName = 'invalid-flag';

    vi.spyOn(flagManager, 'getDynamicFlag').mockImplementation(() => {
      throw new Error('Flag not found');
    });

    const mockAndRender = () => {
      try {
        return render(
          <FlaggedComponent flagName={invalidFlagName} fallback={<div>Flag not found</div>}>
            <div>Flag is enabled</div>
          </FlaggedComponent>,
        );
      } catch (error) {
        return error;
      }
    };

    const result = mockAndRender();
    expect(result).toBeInstanceOf(Error);
    if (result instanceof Error) {
      expect(result.message).toEqual('Flag not found');
    }
  });
});
