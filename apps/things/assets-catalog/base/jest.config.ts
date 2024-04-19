import { Config } from 'jest';

const config: Config = {
  displayName: 'things-assets-catalog-base',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': '@swc/jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/apps/things/assets-catalog/base',
  verbose: true,
};

export default config;
