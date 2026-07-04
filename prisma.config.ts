import { defineConfig } from "prisma/config";

export default defineConfig({
  datasources: {
    postgresql: {
      url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/ramsatelec",
    },
  },
});
