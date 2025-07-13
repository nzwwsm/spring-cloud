import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        'test/',
        '**/*.test.ts',
        '**/*.config.ts',
        'coverage/',
        '.vscode/',
        '.idea/',
        'src/components/BusinessInfoCom.vue'
      ],
      include: ['src/**/*.{js,ts,vue}'],
      all: true,
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    },
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}) 