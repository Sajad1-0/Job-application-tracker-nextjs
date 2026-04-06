'use server';

import { getSession } from '@/lib/auth/auth';
import { connect } from 'http2';
import connectDB from '../db';

interface jobApplicationData {
  company: string;
  position: string;
  location?: string;
  salary?: string;
  jobUrl?: string;
  tags?: string;
  description?: string;
  notes?: string;
  columnId: string;
  boardId: string;
}

export const createJobApplication = async (data: jobApplicationData) => {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  await connectDB();

  const {
    company,
    position,
    location,
    salary,
    jobUrl,
    tags,
    description,
    notes,
    columnId,
    boardId,
  } = data;

  if (!company || !position || !columnId || !boardId) {
    throw new Error('Missing required fields');
  }
};
