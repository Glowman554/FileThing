import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getProject } from './projects';
import { v4 } from 'uuid';
import { createRandomToken } from './authentication';
import { db } from '../database/database';
import { Files } from '../database/schema';

function getFileExtension(name: string) {
    const parts = name.split('.');
    if (parts.length < 2) {
        return undefined;
    }

    return parts[parts.length - 1];
}

export const files = {
    prepare: defineAction({
        input: z.object({ name: z.string() }),
        async handler(input, context) {
            const token = context.request.headers.get('Authentication');
            if (!token) {
                throw new Error('Missing authentication token');
            }

            const project = await getProject(token);

            const extension = getFileExtension(input.name);
            const id = v4() + (extension ? `.${extension}` : '');
            const uploadToken = createRandomToken();

            await db.insert(Files).values({ id, name: input.name, project: project.name, uploadToken: uploadToken });

            return {
                uploadToken,
                id,
            };
        },
    }),
};
