'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Eye, Trash2 } from 'lucide-react';
import type { Assignment } from '@vedaai/shared';
import { format } from 'date-fns';

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
}

export function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const assignedOn = format(new Date(assignment.createdAt), 'dd-MM-yyyy');
  const due = format(new Date(assignment.dueDate), 'dd-MM-yyyy');

  return (
    <div className="relative bg-white border border-line rounded-2xl px-5 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_18px_rgba(0,0,0,0.06)] transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/assignments/${assignment._id}/output`}
          className="flex-1 min-w-0"
        >
          <h3 className="text-[18px] font-bold text-ink leading-snug truncate underline underline-offset-4 decoration-1">
            {assignment.title}
          </h3>
        </Link>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen((v) => !v);
            }}
            className="h-7 w-7 rounded hover:bg-surface-subtle flex items-center justify-center text-ink-muted"
            aria-label="More options"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-10 w-48 rounded-xl bg-white border border-line shadow-lg py-1 text-[14px]">
              <Link
                href={`/assignments/${assignment._id}/output`}
                className="flex items-center gap-2.5 px-4 py-2.5 text-ink hover:bg-surface-subtle"
                onClick={() => setMenuOpen(false)}
              >
                <Eye size={15} strokeWidth={1.8} />
                View Assignment
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(assignment._id);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} strokeWidth={1.8} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 text-[13px]">
        <span>
          <span className="font-semibold text-ink">Assigned on</span>
          <span className="text-ink-muted"> : {assignedOn}</span>
        </span>
        <span>
          <span className="font-semibold text-ink">Due</span>
          <span className="text-ink-muted"> : {due}</span>
        </span>
      </div>
    </div>
  );
}
