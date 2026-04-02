'use client';
import { Board } from '@/lib/models/models.types';
import React from 'react';

interface KanbanBoardProps {
  board: Board;
  userId: string;
}

const KanbanBoard = ({ board, userId }: KanbanBoardProps) => {
  return <div>KanbanBoard</div>;
};

export default KanbanBoard;
