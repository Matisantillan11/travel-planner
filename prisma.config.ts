import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local so Prisma CLI has access to DATABASE_URL
// (Next.js loads .env.local automatically; Prisma CLI does not)
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
