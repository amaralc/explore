import { Box, Text } from '@mantine/core';

export const LabeledStars = () => {
  return (
    <Box>
      <Text size="xs">
        <span role="img" aria-label="1 Star">
          ⭐
        </span>{' '}
        I've heard about it
        <br />
        <span role="img" aria-label="2 Stars">
          ⭐ ⭐
        </span>{' '}
        I kind of know it but currently struggle with that
        <br />
        <span role="img" aria-label="3 Stars">
          ⭐ ⭐ ⭐
        </span>{' '}
        I know my way around it, and could learn more if I fell its necessary.
        <br />
        <span role="img" aria-label="4 Stars">
          ⭐ ⭐ ⭐ ⭐
        </span>{' '}
        I am good at it and understand it deeply, but would have a hard time explaining it in detail.
        <br />
        <span role="img" aria-label="5 Stars">
          ⭐ ⭐ ⭐ ⭐ ⭐
        </span>{' '}
        I'm great at it. I understand it deeply, practice and mentor others on a daily basis
      </Text>
    </Box>
  );
};
