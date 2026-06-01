import { and, eq, sql, type InferSelectModel } from 'drizzle-orm';
import { db } from '../database/database';
import { Files, Projects } from '../database/schema';
import { defineAction } from 'astro:actions';
import { string, z } from 'astro:schema';
import { createRandomToken, permission } from './authentication';
import { v4 } from 'uuid';
import { config } from '../config';
import { DataFile } from '../file';

export async function getProject(token: string) {
    const project = await db.select().from(Projects).where(eq(Projects.projectToken, token)).get();
    if (!project) {
        throw new Error('Invalid project token');
    }

    return project;
}

export type Project = InferSelectModel<typeof Projects>;
export type PartialProject = Omit<Project, 'projectToken'>;

function getFileExtension(name: string) {
    const parts = name.split('.');
    if (parts.length < 2) {
        return undefined;
    }

    return parts[parts.length - 1];
}

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

            const files = await db
                .select({ id: Files.id, project: Files.project })
                .from(Files)
                .innerJoin(Projects, eq(Files.project, Projects.id))
                .where(and(eq(Files.project, input.id), eq(Projects.username, user.username)));

            for (const file of files) {
                const dataFile = new DataFile(file.project, file.id);
                if (await dataFile.checkExists()) {
                    await dataFile.delete();
                }
            }

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

            const loaded = await db
                .select()
                .from(Projects)
                .where(and(eq(Projects.id, input.id), eq(Projects.username, user.username)))
                .get();

            if (!loaded) {
                throw new Error('Project not found');
            }

            return loaded;
        },
    }),

    clearFiles: defineAction({
        input: z.object({
            id: z.string(),
        }),
        async handler(input, context) {
            await permission(context, (u) => true);

            const files = await db
                .select({ id: Files.id, project: Files.project })
                .from(Files)
                .where(eq(Files.project, input.id));

            for (const file of files) {
                const dataFile = new DataFile(file.project, file.id);
                if (await dataFile.checkExists()) {
                    await dataFile.delete();
                }
            }

            await db.delete(Files).where(eq(Files.project, input.id));
        },
    }),

    vacuum: defineAction({
        async handler(input, context) {
            await permission(context, (u) => true);

            await db.run(sql`vacuum`);
        },
    }),

    prepare: defineAction({
        input: z.object({
            token: z.string(),
            name: z.string(),
        }),
        async handler(input, context) {
            const project = await getProject(input.token);

            const extension = getFileExtension(input.name);
            const id = v4() + (extension ? `.${extension}` : '');
            const uploadToken = createRandomToken();

            await db.insert(Files).values({ id, name: input.name, project: project.id, uploadToken: uploadToken });

            const result = {
                uploadToken,
                id,
                url: `${config.secure ? 'https' : 'http'}://${config.host}/files/${id}`,
            };

            return result;
        },
    }),
};
