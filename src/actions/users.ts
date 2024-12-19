import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { permission } from './authentication';
import { db } from '../database/database';
import { Users } from '../database/schema';
import { hashSync } from '@node-rs/bcrypt';
import { eq } from 'drizzle-orm';

export const users = {
    create: defineAction({
        input: z.object({
            username: z.string(),
            password: z.string(),
            administrator: z.boolean(),
        }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            await db.insert(Users).values({
                username: input.username,
                passwordHash: hashSync(input.password),
                administrator: input.administrator,
            });
        },
    }),

    delete: defineAction({
        input: z.object({ username: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            await db.delete(Users).where(eq(Users.username, input.username));
        },
    }),

    update: defineAction({
        input: z.object({
            username: z.string(),
            administrator: z.boolean(),
        }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            await db
                .update(Users)
                .set({ administrator: input.administrator })
                .where(eq(Users.username, input.username));
        },
    }),

    loadAll: defineAction({
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            return db.select({ username: Users.username, administrator: Users.administrator }).from(Users);
        },
    }),
};
