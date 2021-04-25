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
    '\\.(css|gif|png|jpg)$': 'identity-obj-proxy',
  },
  setupFiles: ['./src/testSetup.ts'],
  setupFilesAfterEnv: ['./src/testEnvSetup.ts'],
  collectCoverageFrom: ['src/**/*.ts', 'src/**/*.tsx'],
} as Config.InitialOptions;
