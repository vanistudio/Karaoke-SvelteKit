import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.APP_DATABASE_URI) throw new Error('APP_DATABASE_URI is not set');

const client = postgres(env.APP_DATABASE_URI);

export const db = drizzle(client, { schema });
