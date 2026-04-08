'use client';

import { useState } from 'react';
import { Board, Column } from '../models/models.types';
import jobApplication from '../models/job-application';

const useBoards = (initialBoard?: Board | null) => {
  const [board, setBoard] = useState<Board | null>(initialBoard || null);
  const [columns, setColumns] = useState<Column[]>(initialBoard?.columns || []);
  const [error, setError] = useState<string | null>(null);

  const moveJob = async (jobApplicationId: string, newColumnId: string, newOrder: number) => {};

  return { board, columns, error, moveJob };
};

export default useBoards;
