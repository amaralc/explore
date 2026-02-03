import { Config } from 'jest';

const config: Config = {
  displayName: 'things-assets-catalog-base',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', { jsc: { target: 'es2022' } }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/teams/things/assets-catalog/base',
  verbose: true,
};

export default config;
