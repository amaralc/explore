import { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        white: { name: 'white', value: '#ffffff' }
      }
    },
  },

  initialGlobals: {
    backgrounds: {
      value: 'white'
    }
  },

  tags: ['autodocs']
};

export default preview;
