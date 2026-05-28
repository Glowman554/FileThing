import { type APIContext } from 'astro';
import { z } from 'zod';
import { validateOrThrow } from '../../../config';
import { actions } from 'astro:actions';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authentication, Content-Type',
};

const schema = z.object({ name: z.string() });

export async function POST(context: APIContext) {
    const input = validateOrThrow(schema, await context.request.json());

    const token = context.request.headers.get('Authentication');
    if (!token) {
        throw new Error('Missing authentication token');
    }

    const result = await context.callAction(actions.projects.prepare, { token, name: input.name });

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
