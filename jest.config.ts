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
  collectCoverageFrom: ['src/**/*.ts', 'src/**/*.tsx'],
} as Config.InitialOptions;
