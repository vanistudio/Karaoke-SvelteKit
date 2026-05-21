import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema';
import { seedDatabase } from '../src/lib/server/db/seed';

const connectionString = process.env.APP_DATABASE_URI;

if (!connectionString) {
	throw new Error('APP_DATABASE_URI is not set');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

try {
	await seedDatabase(db);
	console.log('Database seed completed.');
} finally {
	await client.end();
}
