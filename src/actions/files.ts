import { and, eq, type InferSelectModel } from 'drizzle-orm';
import { Files, Projects } from '../database/schema';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db } from '../database/database';
import { permission } from './authentication';
import { config } from '../config';
import { file } from 'astro/loaders';

export type File = Omit<Omit<InferSelectModel<typeof Files>, 'content'>, 'uploadToken'> & { url: string };

export const files = {
    loadAll: defineAction({
        input: z.object({ projectId: z.string() }),
        async handler(input, context) {
            const user = await permission(context, (u) => true);

            const files = await db
                .select({
                    id: Files.id,
                    project: Files.project,
                    name: Files.name,
                })
                .from(Files)
                .innerJoin(Projects, eq(Files.project, Projects.id))
                .where(and(eq(Files.project, input.projectId), eq(Projects.username, user.username)));

            return files.map((file) => ({
                ...file,
                url: `${config.secure ? 'https' : 'http'}://${config.host}/files/${file.id}`,
            })) satisfies File[];
        },
    }),

    delete: defineAction({
        input: z.object({ id: z.string() }),
        async handler(input, context) {
            const user = await permission(context, (u) => true);

            const file = await db
                .select({ id: Files.id })
                .from(Files)
                .innerJoin(Projects, eq(Files.project, Projects.id))
                .where(and(eq(Files.id, input.id), eq(Projects.username, user.username)))
                .get();

            if (!file) {
                throw new Error('File not found');
            }

            await db.delete(Files).where(and(eq(Files.id, input.id)));
        },
    }),
};
