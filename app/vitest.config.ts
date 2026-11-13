import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/core/**/*.test.ts', 'src/data/**/*.test.ts', 'src/screens/**/*.test.ts'],
  },
})
