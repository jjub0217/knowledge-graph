import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // @ → src 폴더 (Vitest에게 알려줌)
    },
  },
  // setupFiles: ['./src/test/setup.ts']  = Vitest에게 "테스트 전에 이 파일을 먼저 실행해"   라고 지시
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.ts'] },
})
