import { type APIContext } from 'astro';
import { db } from '../../database/database';
import { Files } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { DataFile } from '../../file';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authentication, Content-Type',
};

// 90 days in seconds
const cacheLifetime = 90 * 24 * 60 * 60;

export async function GET(context: APIContext) {
    const { id } = context.params;

    const [file] = await db.select({ project: Files.project, name: Files.name }).from(Files).where(eq(Files.id, id!));
    if (!file) {
        throw new Error('Invalid file id');
    }

    const dataFile = new DataFile(file.project, id!);
    if (!(await dataFile.checkExists())) {
        throw new Error('File content not found');
    }

    const blob = new Blob([new Uint8Array(await dataFile.read())]);

    return new Response(blob, {
        status: 200,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${file.name}"`,
            'Content-Length': blob.size.toString(),
            'Cache-Control': `public, max-age=${cacheLifetime}`,
            ...headers,
        },
    });
}

export async function POST(context: APIContext) {
    const { id } = context.params;

    const token = context.request.headers.get('Authentication');
    if (!token) {
        throw new Error('Missing authentication token');
    }

    const [file] = await db
        .select({ uploadToken: Files.uploadToken, project: Files.project })
        .from(Files)
        .where(eq(Files.id, id!));
    if (!file) {
        throw new Error('Invalid file id');
    }

    const dataFile = new DataFile(file.project, id!);
    if (await dataFile.checkExists()) {
        throw new Error('File already exists');
    }

    if (file.uploadToken != token) {
        throw new Error('Invalid upload token');
    }

    const content = await context.request.arrayBuffer();
    await dataFile.write(Buffer.from(content));

    return new Response('{}', {
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
