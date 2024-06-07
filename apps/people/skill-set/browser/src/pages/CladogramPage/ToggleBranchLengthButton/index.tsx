import { Button } from '@mantine/core';
import { useToggle } from '@mantine/hooks';

export const ToggleBranchLengthButton = ({ toggleBranchLength }: { toggleBranchLength: () => void }) => {
  const [value, toggle] = useToggle(['Show Length', 'Hide Length']);

  return (
    <Button
      fullWidth
      onClick={() => {
        toggleBranchLength();
        toggle();
      }}
    >
      {value}
    </Button>
  );
};
