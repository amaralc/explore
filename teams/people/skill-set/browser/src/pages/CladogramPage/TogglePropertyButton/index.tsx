import { Button } from '@mantine/core';
import { useToggle } from '@mantine/hooks';

export const TogglePropertyButton = ({
  togglePropertyCallback,
  propertyArray = ['Active', 'Inactive'],
}: {
  togglePropertyCallback: () => void;
  propertyArray: Array<string>;
}) => {
  const [value, toggle] = useToggle(propertyArray);

  return (
    <Button
      fullWidth
      onClick={() => {
        togglePropertyCallback();
        toggle();
      }}
    >
      {value}
    </Button>
  );
};
