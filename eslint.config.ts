// @ts-check

import expoConfig from 'eslint-config-expo/flat';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  expoConfig,
  {
    ignores: ['dist/*'],
  },
);
