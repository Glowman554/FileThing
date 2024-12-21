import type { APIContext } from 'astro';
import { and, eq } from 'drizzle-orm';
import { Files } from '../../../../database/schema';
import { db } from '../../../../database/database';
import { getProject } from '../../../../actions/projects';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authentication',
};

export async function GET(context: APIContext) {
    const { id } = context.params;

    const token = context.request.headers.get('Authentication');
    if (!token) {
        throw new Error('Missing authentication token');
    }
    const project = await getProject(token);

    await db.delete(Files).where(and(eq(Files.id, id!), eq(Files.project, project.id)));

    return new Response('{}', {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });
}
