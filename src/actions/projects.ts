import { and, eq, type InferSelectModel } from 'drizzle-orm';
import { db } from '../database/database';
import { Projects } from '../database/schema';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createRandomToken, permission } from './authentication';
import { v4 } from 'uuid';

export async function getProject(token: string) {
    const project = await db.select().from(Projects).where(eq(Projects.projectToken, token)).get();
    if (!project) {
        throw new Error('Invalid project token');
    }

    return project;
}

export type Project = InferSelectModel<typeof Projects>;
export type PartialProject = Omit<Project, 'projectToken'>;

export const projects = {
    create: defineAction({
        input: z.object({
            name: z.string(),
        }),
        async handler(input, context) {
            const user = await permission(context, (u) => true);

            const inserted = await db
                .insert(Projects)
                .values({
                    name: input.name,
                    id: v4(),
                    username: user.username,
                    projectToken: createRandomToken(),
                })
                .returning()
                .get();

            return inserted.id;
        },
    }),

    delete: defineAction({
        input: z.object({
            id: z.string(),
        }),
        async handler(input, context) {
            const user = await permission(context, (u) => true);

            await db
                .delete(Projects)
                .where(and(eq(Projects.id, input.id), eq(Projects.username, user.username)))
                .execute();
        },
    }),

    loadAll: defineAction({
        async handler(input, context) {
            const user = await permission(context, (u) => true);

            return db
                .select({
                    name: Projects.name,
                    id: Projects.id,
                    username: Projects.username,
                })
                .from(Projects)
                .where(eq(Projects.username, user.username));
        },
    }),

    load: defineAction({
        input: z.object({
            id: z.string(),
        }),
        async handler(input, context) {
            const user = await permission(context, (u) => true);

            const loaded = db
                .select({
                    name: Projects.name,
                    id: Projects.id,
                    username: Projects.username,
                })
                .from(Projects)
                .where(and(eq(Projects.id, input.id), eq(Projects.username, user.username)))
                .get();

            if (!loaded) {
                throw new Error('Project not found');
            }

            return loaded;
        },
    }),
};
