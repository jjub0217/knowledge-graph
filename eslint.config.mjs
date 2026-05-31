import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals' // React·Hooks·접근성 포함
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier' // 포맷 규칙은 Prettier가 담당 → 충돌 규칙 끔
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**', 'out/**', 'build/**', 'next-env.d.ts',
    'node_modules', '*.config.js', '*.config.ts', '*.config.mjs', 'public',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2023 },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      // 코드 품질
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-unused-vars': 'off', // TS가 처리
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // React (17+ / TS 환경)
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-boolean-value': 'warn',
      'react/jsx-fragments': 'warn',
      'react/jsx-no-useless-fragment': 'warn',
      // 잡음 방지
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-duplicate-imports': 'warn',
      // 팀 규칙
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'], // 타입은 interface로
      'react/function-component-definition': ['error', {
        namedComponents: 'function-declaration', // 이름 있는 컴포넌트 = function 선언
        unnamedComponents: 'arrow-function',
      }],
    },
  },
  prettier, // 항상 마지막: 포맷 충돌 규칙 끔
])

export default eslintConfig
