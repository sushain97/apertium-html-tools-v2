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

  collectCoverageFrom: ['src/**/*.ts', 'src/**/*.tsx'],
} as Config.InitialOptions;
