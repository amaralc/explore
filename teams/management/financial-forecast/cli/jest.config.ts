/* eslint-disable */
export default {
  displayName: 'management-financial-forecast-cli',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': '@swc/jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/teams/management/financial-forecast/cli',
};
