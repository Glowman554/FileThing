import { type APIContext } from 'astro';
import { z } from 'zod';
import { validateOrThrow } from '../../../config';
import { actions } from 'astro:actions';

export const prerender = false;

const schema = z.object({ name: z.string() });

export async function POST(context: APIContext) {
    const params = validateOrThrow(schema, await context.request.json());

    return new Response(JSON.stringify(await context.callAction(actions.files.prepare.orThrow, params)), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
