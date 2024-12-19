import { eq } from 'drizzle-orm';
import { db } from '../database/database';
import { Projects } from '../database/schema';

export async function getProject(token: string) {
    const project = await db.select().from(Projects).where(eq(Projects.projectToken, token)).get();
    if (!project) {
        throw new Error('Invalid project token');
    }

    return project;
}

export const projects = {};
