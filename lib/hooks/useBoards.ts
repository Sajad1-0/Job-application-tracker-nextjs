'use client';

import { useEffect, useState } from 'react';
import { Board, Column } from '../models/models.types';
import jobApplication from '../models/job-application';

const useBoards = (initialBoard?: Board | null) => {
  const [board, setBoard] = useState<Board | null>(initialBoard || null);
  const [columns, setColumns] = useState<Column[]>(initialBoard?.columns || []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBoard) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBoard(initialBoard);
      setColumns(initialBoard.columns || []);
    }
  }, [initialBoard]);

  const moveJob = async (jobApplicationId: string, newColumnId: string, newOrder: number) => {};

  return { board, columns, error, moveJob };
};

export default useBoards;
