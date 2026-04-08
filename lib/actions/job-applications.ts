'use server';

import { getSession } from '@/lib/auth/auth';
import connectDB from '../db';
import { Board, Column, JobApplication } from '../models';
import { revalidatePath } from 'next/cache';

interface jobApplicationData {
  company: string;
  position: string;
  location?: string;
  salary?: string;
  jobUrl?: string;
  tags?: string[];
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

  // Verify board ownership
  const board = await Board.findOne({ _id: boardId, userId: session.user.id });

  if (!board) {
    throw new Error('Board not found or unauthorized');
  }

  // verify column belongs to board
  const column = await Column.findOne({ _id: columnId, boardId: boardId });

  if (!column) {
    throw new Error('Column not found or does not belong to board');
  }

  const maxOrder = (await JobApplication.findOne({ columnId }).sort({ order: -1 }).lean()) as {
    order: number;
  } | null;

  const jobApplication = await JobApplication.create({
    company,
    position,
    location,
    salary,
    jobUrl,
    tags: tags || [],
    description,
    notes,
    columnId,
    boardId,
    userId: session.user.id,
    status: 'applied',
    order: maxOrder ? maxOrder.order + 1 : 0,
  });

  await Column.findByIdAndUpdate(columnId, { $push: { jobApplications: jobApplication._id } });

  revalidatePath('/dashboard');

  return { data: JSON.parse(JSON.stringify(jobApplication)) };
};

const updateJobApplication = async (
  id: string,
  updates: {
    company?: string;
    position?: string;
    location?: string;
    notes?: string;
    salary?: string;
    jobUrl?: string;
    columnId?: string;
    order?: number;
    tags?: string[];
    description?: string;
  },
) => {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const jobApplication = await JobApplication.findById(id);

  if (!jobApplication) {
    throw new Error('Job application not found');
  }

  if (jobApplication.userId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  const { columnId, order, ...otherUpdates } = updates;

  const updateToApply: Partial<{
    company: string;
    position: string;
    location: string;
    notes: string;
    salary: string;
    jobUrl: string;
    columnId: string;
    order: number;
    tags: string[];
    description: string;
  }> = otherUpdates;

  const currentColumnId = jobApplication.columnId.toString();
  const newColumnId = columnId?.toString();

  const isMovingToDifferentColumn = newColumnId && newColumnId !== currentColumnId;

  if (isMovingToDifferentColumn) {
    await Column.findByIdAndUpdate(currentColumnId, { $pull: { jobApplication: id } });

    const jobsInTargetColumn = await JobApplication.find({ columnId: newColumnId, id: { $ne: id } })
      .sort({ order: 1 })
      .lean();

    let newOrderValue: number;
  }
};
