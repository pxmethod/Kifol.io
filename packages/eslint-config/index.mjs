import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
/** @type {import('eslint').Linter.Config[]} */
const next = require('eslint-config-next')

export default [
  ...next,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/no-unescaped-entities': 'off',
      // React Compiler–style rules in eslint-plugin-react-hooks v7; warn until refactors land (keeps CI green).
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
]
