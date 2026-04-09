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

export const updateJobApplication = async (
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

  const updatesToApply: Partial<{
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

    if (order !== undefined && order !== null) {
      newOrderValue = order * 100;

      const jobsThatNeedToShift = jobsInTargetColumn.slice(order);
      for (const job of jobsThatNeedToShift) {
        await JobApplication.findByIdAndUpdate(job._id, { $set: { order: job.order + 100 } });
      }
    } else {
      if (jobsInTargetColumn.length > 0) {
        const lastJobOrder = jobsInTargetColumn[jobsInTargetColumn.length - 1].order || 0;
        newOrderValue = lastJobOrder + 100;
      } else {
        newOrderValue = 0;
      }
    }

    updatesToApply.columnId = newColumnId;
    updatesToApply.order = newOrderValue;

    await Column.findByIdAndUpdate(newColumnId, { $push: { jobApplications: id } });
  } else if (order !== undefined && order !== null) {
    const otherJobsInColumn = await JobApplication.find({
      columnId: currentColumnId,
      _id: { $ne: id },
    })
      .sort({ order: 1 })
      .lean();
    const currentJobOrder = jobApplication.order || 0;
    const currentPositionIndex = otherJobsInColumn.findIndex((job) => job.order > currentJobOrder);

    const oldPositionIndex =
      currentPositionIndex === -1 ? otherJobsInColumn.length : currentPositionIndex;

    const newOrderValue = order * 100;

    if (order < oldPositionIndex) {
      const jobToShiftDown = otherJobsInColumn.slice(order, oldPositionIndex);

      for (const job of jobToShiftDown) {
        await JobApplication.findByIdAndUpdate(job._id, { $set: { order: job.order + 100 } });
      }
    } else if (order > oldPositionIndex) {
      const jobToShiftUp = otherJobsInColumn.slice(oldPositionIndex, order);

      for (const job of jobToShiftUp) {
        const newOrder = Math.max(0, job.order - 100);
        await JobApplication.findByIdAndUpdate(job._id, { $set: { order: newOrder } });
      }
    }
    updatesToApply.order = newOrderValue;
  }

  const updated = await JobApplication.findByIdAndUpdate(id, updatesToApply, { new: true });

  revalidatePath('/dashboard');

  return { data: JSON.parse(JSON.stringify(updated)) };
};

export const deleteJobApplication = async (id: string) => {
  const session = await getSession();

  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const jobApplication = await JobApplication.findById(id);

  if (!jobApplication) {
    return { error: 'Job application not found' };
  }

  if (jobApplication.userId !== session.user.id) {
    return { error: 'Unauthorized' };
  }

  await Column.findByIdAndUpdate(jobApplication.columnId, { $pull: { jobApplication: id } });

  await JobApplication.deleteOne({ _id: id });
  revalidatePath('/dashboard');

  return { success: true };
};
