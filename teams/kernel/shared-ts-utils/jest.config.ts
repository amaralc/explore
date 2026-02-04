/* eslint-disable */
export default {
  displayName: 'base',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', { jsc: { target: 'es2022' } }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/teams/people/organizations-management/base',
};
