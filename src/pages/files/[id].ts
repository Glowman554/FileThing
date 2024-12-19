import { type APIContext } from 'astro';
import { db } from '../../database/database';
import { Files } from '../../database/schema';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';

export const prerender = false;

export async function GET(context: APIContext) {
    const { id } = context.params;

    const file = await db
        .select({ content: Files.content, name: Files.name })
        .from(Files)
        .where(and(eq(Files.id, id!), isNotNull(Files.content)))
        .get();
    if (!file) {
        throw new Error('Invalid file id');
    }

    return new Response(file.content, {
        status: 200,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${file.name}"`,
        },
    });
}

export async function POST(context: APIContext) {
    const { id } = context.params;

    const token = context.request.headers.get('Authentication');
    if (!token) {
        throw new Error('Missing authentication token');
    }

    const file = await db
        .select({ uploadToken: Files.uploadToken })
        .from(Files)
        .where(and(eq(Files.id, id!), isNull(Files.content)))
        .get();
    if (!file) {
        throw new Error('Invalid file id');
    }

    if (file.uploadToken != token) {
        throw new Error('Invalid upload token');
    }

    await db
        .update(Files)
        .set({ content: Buffer.from(await context.request.bytes()) })
        .where(eq(Files.id, id!));

    return new Response('{}', {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
