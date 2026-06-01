// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm';
import { integer, pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const Users = pgTable('users', {
    username: text('username').primaryKey().notNull(),
    administrator: boolean('administrator').default(false).notNull(),
    passwordHash: text('passwordHash').notNull(),
});

export const Sessions = pgTable('sessions', {
    username: text('username')
        .references(() => Users.username, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    token: text('token').primaryKey().notNull(),
    creationDate: timestamp('creationDate', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const Projects = pgTable('projects', {
    name: text('name').notNull().unique(),
    id: text('id').notNull().primaryKey(),
    username: text('username')
        .references(() => Users.username, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    projectToken: text('projectToken').notNull(),
});

export const Files = pgTable('files', {
    id: text('id').notNull().primaryKey(),
    project: text('project')
        .references(() => Projects.id, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    name: text('name').notNull(),
    uploadToken: text('uploadToken'),
});
