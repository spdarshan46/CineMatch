// prisma.config.ts (in F:\Projects\movies\backend)
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'), // e.g., "file:./dev.db"
  },
})