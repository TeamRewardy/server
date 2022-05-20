import type { Config } from '@jest/types';

export const baseConfig: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  transform: { '^.+\\.ts$': 'ts-jest' },
  reporters: ['default', 'jest-junit'],
  coverageReporters: ['cobertura', 'html', 'text', 'lcov'],
};

export const config: Config.InitialOptions = {
  ...baseConfig,
  moduleNameMapper: {
    '^src/(.*)': '<rootDir>/../src/$1',
  },
  rootDir: 'src',
  testRegex: '.spec.ts$',
  coverageDirectory: '<rootDir>/../coverage',
  collectCoverageFrom: ['<rootDir>/**/*.ts', '!<rootDir>/**/*.nock.ts'],
};

export default config;
