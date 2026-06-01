import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from '../config';

import * as schema from './schema';
import { hashSync } from '@node-rs/bcrypt';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

export const db = drizzle(config.database.url, { schema });

await migrate(db, {
    migrationsFolder: './drizzle',
});

await db
    .insert(schema.Users)
    .values({ username: 'admin', administrator: true, passwordHash: hashSync('admin') })
    .onConflictDoNothing();
