import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { config } from '../config';

import * as schema from './schema';
import { hashSync } from '@node-rs/bcrypt';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { sql } from 'drizzle-orm';
import { DataFile } from '../file';
import { stat } from 'fs/promises';

export const client = createClient({ ...config.database });
export const db = drizzle(client, { schema });

await extractFilesFromDatabase().catch((err) => {
    console.error('Error extracting files from database:', err);
});

await migrate(db, {
    migrationsFolder: './drizzle',
});

await db
    .insert(schema.Users)
    .values({ username: 'admin', administrator: true, passwordHash: hashSync('admin') })
    .onConflictDoNothing();

async function extractFilesFromDatabase() {
    const columns = await db.run(sql`PRAGMA table_info('files')`);
    const hasContentColumn = columns.rows.some((row) => (row.name as string) === 'content');

    if (!hasContentColumn) {
        console.log('No content column found in files table, skipping file extraction');
        return;
    }

    const files = await db.run(sql`SELECT id, project, content FROM files`);

    for (const file of files.rows) {
        const id = file.id as string;
        const project = file.project as string;
        const content = file.content as ArrayBuffer | null;

        if (content) {
            console.log(`Extracting file ${id} from project ${project}`);

            const dataFile = new DataFile(project, id);
            await dataFile.write(Buffer.from(content));
        }
    }
}
