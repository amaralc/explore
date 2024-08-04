import { render } from '@testing-library/react';

import SharedUiComponents from './shared-ui-components';

describe('SharedUiComponents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SharedUiComponents />);
    expect(baseElement).toBeTruthy();
  });
});
