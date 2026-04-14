import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { initializeUserBoard } from '../init-user-board';
import connectDB from '../db';

const mongooseInstance = await connectDB();
const client1 = mongooseInstance.connection.getClient();
const db = client1.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client: client1,
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
          if (user.id) {
            await initializeUserBoard(user.id);
          }
        },
      },
    },
  },
});

export const getSession = async () => {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  return result;
};
export const signOut = async () => {
  const result = await auth.api.signOut({
    headers: await headers(),
  });

  if (result.success) {
    redirect('/sign-in');
  }
};
