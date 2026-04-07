import { Column, JobApplication } from '@/lib/models/models.types';
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Edit2, ExternalLink, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

interface JobApplicationProps {
  job: JobApplication;
  columns: Column[];
}

const JobApplicationCard = ({ job, columns }: JobApplicationProps) => {
  return (
    <>
      <Card className="transition-shadow bg-white shadow-sm cursor-pointer hover:shadow-lg group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="mb-1 text-sm font-semibold">{job.position}</h3>
              <p className="mb-2 text-xs text-muted-foreground">{job.company}</p>
              {job.description && (
                <p className="mb-2 text-xs text-muted-foreground line-clamp-2">{job.description}</p>
              )}
              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {job.tags.map((tag, key) => (
                    <span
                      key={key}
                      className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {job.jobUrl && (
                <a
                  target="_blank"
                  href={job.jobUrl}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 mt-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex items-start gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-6 h-6">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  {columns
                    .filter((col) => col._id !== job.columnId)
                    .map((column, key) => (
                      <DropdownMenuItem key={key}>Move to {column.name}</DropdownMenuItem>
                    ))}

                  <DropdownMenuItem>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete{' '}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default JobApplicationCard;
