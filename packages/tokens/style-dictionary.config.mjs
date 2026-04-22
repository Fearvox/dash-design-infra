// Style Dictionary v4 config — DASH tokens
// Outputs CSS vars, TypeScript types, and raw JSON for downstream consumers.

import StyleDictionary from 'style-dictionary';

const config = {
  source: ['src/tokens.json'],

  // DTCG format — Style Dictionary 4 handles $value/$type natively.
  // No preprocessor needed.

  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
            selector: ':root'
          }
        }
      ]
    },

    js: {
      transformGroup: 'js',
      buildPath: 'build/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/esm'
        },
        {
          destination: 'tokens.d.ts',
          format: 'typescript/module-declarations'
        }
      ]
    },

    json: {
      transformGroup: 'js',
      buildPath: 'build/',
      files: [
        {
          destination: 'tokens.flat.json',
          format: 'json/flat'
        }
      ]
    }
  },

  log: {
    warnings: 'warn',
    verbosity: 'verbose',
    errors: {
      brokenReferences: 'throw'
    }
  }
};

export default config;
