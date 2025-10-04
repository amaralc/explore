/* eslint-disable */
export default {
  displayName: 'researchers-peers-adapters',
  preset: '../../../../jest.preset.js',
  globals: {},
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/teams/people/researchers/peers/adapters',
};
