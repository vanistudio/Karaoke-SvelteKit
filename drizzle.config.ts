import { defineConfig } from 'drizzle-kit';

if (!process.env.APP_DATABASE_URI) throw new Error('APP_DATABASE_URI is not set');

export default defineConfig({
	schema: './src/lib/server/db/schema/index.ts',
	dialect: 'postgresql',
	dbCredentials: { url: process.env.APP_DATABASE_URI },
	verbose: true,
	strict: true
});
