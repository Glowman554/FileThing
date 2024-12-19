// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm';
import { blob, int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const Users = sqliteTable('users', {
    username: text('username').primaryKey().notNull(),
    administrator: int({ mode: 'boolean' }).default(false).notNull(),
    passwordHash: text('passwordHash').notNull(),
});

export const Sessions = sqliteTable('sessions', {
    username: text('username')
        .references(() => Users.username, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    token: text('token').primaryKey().notNull(),
    creationDate: integer('creationDate', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});

export const Projects = sqliteTable('projects', {
    name: text('name').notNull().unique(),
    id: text('id').notNull().primaryKey(),
    username: text('username')
        .references(() => Users.username, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    projectToken: text('projectToken').notNull(),
});

export const Files = sqliteTable('files', {
    id: text('id').notNull().primaryKey(),
    project: text('project')
        .references(() => Projects.id, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    name: text('name').notNull(),
    uploadToken: text('uploadToken').notNull(),
    content: blob('content', { mode: 'buffer' }),
});
