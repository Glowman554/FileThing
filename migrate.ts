import { createClient } from '@libsql/client';
import { Pool } from 'pg';
import { config } from './src/config';

const sqliteDb = createClient({
    url: 'file:data.db',
});

const pgClient = new Pool({
    connectionString: config.database.url,
});

async function migrateUsers() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM users');
    const users = sqliteRes.rows.map((row) => ({
        username: row.username,
        passwordHash: row.passwordHash,
        administrator: row.administrator === 1,
    }));

    console.log(`Migrating ${users.length} users...`);

    await pgClient.query(`DELETE FROM users`);
    for (const user of users) {
        await pgClient.query(`INSERT INTO users (username, "passwordHash", administrator) VALUES ($1, $2, $3)`, [
            user.username,
            user.passwordHash,
            user.administrator,
        ]);
    }

    console.log('Done!');
}

async function migrateSessions() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM sessions');
    const sessions = sqliteRes.rows.map((row) => ({
        username: row.username,
        token: row.token,
        creationDate: row.creationDate,
    }));

    console.log(`Migrating ${sessions.length} sessions...`);

    await pgClient.query(`DELETE FROM sessions`);
    for (const session of sessions) {
        await pgClient.query(
            `INSERT INTO sessions (username, token, "creationDate") VALUES ($1, $2, to_timestamp($3))`,
            [session.username, session.token, session.creationDate]
        );
    }

    console.log('Done!');
}

async function migrateProjects() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM projects');
    const projects = sqliteRes.rows.map((row) => ({
        name: row.name,
        id: row.id,
        username: row.username,
        projectToken: row.projectToken,
    }));

    console.log(`Migrating ${projects.length} projects...`);

    await pgClient.query(`DELETE FROM projects`);
    for (const project of projects) {
        await pgClient.query(`INSERT INTO projects (id, name, username, "projectToken") VALUES ($1, $2, $3, $4)`, [
            project.id,
            project.name,
            project.username,
            project.projectToken,
        ]);
    }

    console.log('Done!');
}

async function migrateFiles() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM files');
    const files = sqliteRes.rows.map((row) => ({
        id: row.id,
        project: row.project,
        name: row.name,
        uploadToken: row.uploadToken,
    }));

    console.log(`Migrating ${files.length} files...`);

    await pgClient.query(`DELETE FROM files`);
    for (const file of files) {
        await pgClient.query(`INSERT INTO files (id, project, name, "uploadToken") VALUES ($1, $2, $3, $4)`, [
            file.id,
            file.project,
            file.name,
            file.uploadToken,
        ]);
    }

    console.log('Done!');
}

await pgClient.connect();
await migrateUsers();
await migrateSessions();
await migrateProjects();
await migrateFiles();
await pgClient.end();
