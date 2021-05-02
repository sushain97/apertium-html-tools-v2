import type { Config } from '@jest/types';

export default {
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
      },
    ],
  },
  moduleNameMapper: {
    '\\.(css)$': 'identity-obj-proxy',
    '\\.(gif|png|jpg)$': '<rootDir>/src/__mocks__/file.ts',
  },
  setupFiles: ['./src/testSetup.ts'],
  setupFilesAfterEnv: ['./src/testEnvSetup.ts'],
  collectCoverageFrom: ['src/**/*.ts', 'src/**/*.tsx'],
} as Config.InitialOptions;
