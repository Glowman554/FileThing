import { type APIContext } from 'astro';
import { z } from 'zod';
import { config, validateOrThrow } from '../../../config';
import { getProject } from '../../../actions/projects';
import { v4 } from 'uuid';
import { db } from '../../../database/database';
import { Files } from '../../../database/schema';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authentication, Content-Type',
};

const schema = z.object({ url: z.string().url() });

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

    const name = input.url.split('/').pop();
    if (!name) {
        throw new Error('Invalid URL');
    }
    const extension = getFileExtension(name);
    const id = v4() + (extension ? `.${extension}` : '');

    const content = await fetch(input.url).then((res) => res.arrayBuffer());

    await db
        .insert(Files)
        .values({ id, name, project: project.id, content: Buffer.from(content) })
        .execute();

    const result = {
        id,
        url: `${config.secure ? 'https' : 'http'}://${config.host}/files/${id}`,
    };

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });
}

export async function OPTIONS(context: APIContext) {
    return new Response(null, {
        status: 200,
        headers,
    });
}
