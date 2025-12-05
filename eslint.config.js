import { configs } from 'eslint-plugin-common'

export default [
  ...configs.base,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**'],
  },
]
