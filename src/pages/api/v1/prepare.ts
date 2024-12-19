import { type APIContext } from 'astro';
import { z } from 'zod';
import { config, validateOrThrow } from '../../../config';
import { getProject } from '../../../actions/projects';
import { v4 } from 'uuid';
import { db } from '../../../database/database';
import { Files } from '../../../database/schema';
import { createRandomToken } from '../../../actions/authentication';

export const prerender = false;

const schema = z.object({ name: z.string() });

function getFileExtension(name: string) {
    const parts = name.split('.');
    if (parts.length < 2) {
        return undefined;
    }

    return parts[parts.length - 1];
}

export async function POST(context: APIContext) {
    const input = validateOrThrow(schema, await context.request.json());

    const token = context.request.headers.get('Authentication');
    if (!token) {
        throw new Error('Missing authentication token');
    }

    const project = await getProject(token);

    const extension = getFileExtension(input.name);
    const id = v4() + (extension ? `.${extension}` : '');
    const uploadToken = createRandomToken();

    await db.insert(Files).values({ id, name: input.name, project: project.name, uploadToken: uploadToken });

    const result = {
        uploadToken,
        id,
        url: new URL(`${config.baseUrl}/files/${id}`).toString(),
    };

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
        },
    });
}
