import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { initializeUserBoard } from '../init-user-board';
import connectDB from '../db';

const mongooseInstance = await connectDB();
const client = mongooseInstance.connection.getClient();
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          console.log(`[Auth Hook] User created: ${user.id}`);
          try {
            if (user.id) {
              await initializeUserBoard(user.id);
              console.log(`[Auth Hook] Board initialized for ${user.id}`);
            }
          } catch (error) {
            console.error(`[Auth Hook] Error initializing board for user ${user.id}:`, error);
          }
        },
      },
    },
  },
});

export async function getSession() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  return result;
}

export async function signOut() {
  const result = await auth.api.signOut({
    headers: await headers(),
  });

  if (result.success) {
    redirect('/sign-in');
  }
}
