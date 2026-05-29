# 개발 게이트 셋업 (린트·포맷 + 커밋 게이트) — cuddle-market 표준

> 이 프로젝트의 ESLint·Prettier 표준. **cuddle-market 설정을 그대로 가져오되 Storybook 관련만 제외**했다(이 프로젝트는 Storybook 미사용). 실제 적용은 Next.js 스캐폴딩(`create-next-app`) 후 아래 파일·의존성을 넣어서 한다. 결정 근거는 [ADR 0005](decisions/0005-tech-stack.md).

## 적용 순서 (스캐폴딩 후)
1. `create-next-app`으로 앱 생성(TypeScript·Tailwind·ESLint 예).
2. 자동 생성된 ESLint 설정을 아래 `eslint.config.mjs`로 교체.
3. `.prettierrc` 추가.
4. 아래 의존성 설치.
5. `package.json` 스크립트에 `"lint": "eslint"`, `"format": "prettier --write ."`.

## 필요한 개발 의존성(devDependencies)
```
eslint@^9  eslint-config-next  eslint-config-prettier
eslint-plugin-react  eslint-plugin-react-hooks  typescript-eslint  globals
prettier@^3  prettier-plugin-tailwindcss
```

## eslint.config.mjs (flat config)
```js
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
```

## .prettierrc
```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 130,
  "bracketSpacing": true,
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

## 커밋 게이트 (Husky + commitlint + lint-staged)

> "코드 첫 줄 전에 게이트" — `create-next-app` 직후, 첫 *코드* 커밋 전에 설치한다. (Husky·commitlint은 npm 패키지라 Node 프로젝트가 있어야 설치 가능 → brainstorming 단계엔 못 깔았음.)

설치:
```bash
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional lint-staged
npx husky init
```

설정:
- `commitlint.config.js` → `export default { extends: ['@commitlint/config-conventional'] }` (커밋 메시지 = Conventional Commits, [CLAUDE.md](../CLAUDE.md) git 섹션과 동일)
- `.husky/commit-msg` → `npx --no -- commitlint --edit "$1"` (커밋 메시지 검사)
- `.husky/pre-commit` → `npx lint-staged` (바뀐 파일만 검사)
- `package.json`의 `"lint-staged"` → `{ "*.{ts,tsx}": ["eslint --fix", "prettier --write"] }`

→ 효과: 커밋 직전 자동으로 lint·format(바뀐 파일만) + 커밋 메시지 규칙 검사. 통과 못 하면 커밋이 막힌다. (버전에 따라 명령이 다를 수 있으니 공식 문서 확인. lint-staged = 커밋 직전 *스테이징된 파일만* 검사 → 빠름.)

## cuddle-market과 다른 점
- **Storybook 제외**: `eslint-plugin-storybook` import와 `...storybook.configs["flat/recommended"]` 제거(이 프로젝트는 Storybook 미사용).
- 그 외 규칙·Prettier 설정은 동일.
