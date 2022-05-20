import type { Config } from '@jest/types';
import { baseConfig } from './jest.config';

export const config: Config.InitialOptions = {
  ...baseConfig,
  moduleNameMapper: {
    '^src/(.*)': '<rootDir>/src/$1',
  },
  rootDir: '.',
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
  coverageDirectory: '<rootDir>/coverage-e2e',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/*.spec.ts',
    '!<rootDir>/src/**/*.nock.ts',
  ],
};

export default config;
