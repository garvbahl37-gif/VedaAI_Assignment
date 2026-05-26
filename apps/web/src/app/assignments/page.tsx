'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import { EmptyState } from '@/components/assignments/EmptyState';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { FilterBar } from '@/components/assignments/FilterBar';
import { useAssignmentStore } from '@/stores/assignmentStore';
import { api } from '@/lib/api';

export default function AssignmentsPage() {
  const {
    assignments,
    isLoading,
    error,
    setAssignments,
    setLoading,
    setError,
    removeAssignment,
  } = useAssignmentStore();

  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.listAssignments();
        if (!cancelled) setAssignments(res.assignments);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [setAssignments, setLoading, setError]);

  const filtered = useMemo(() => {
    if (!query.trim()) return assignments;
    const q = query.toLowerCase();
    return assignments.filter((a) => a.title.toLowerCase().includes(q));
  }, [assignments, query]);

  async function handleDelete(id: string) {
    const ok = window.confirm('Delete this assignment? This cannot be undone.');
    if (!ok) return;
    try {
      await api.deleteAssignment(id);
      removeAssignment(id);
    } catch (err) {
      window.alert(`Failed to delete: ${(err as Error).message}`);
    }
  }

  const isEmpty = !isLoading && assignments.length === 0;

  return (
    <>
      <TopHeader title="Assignment" />

      <div className="px-4 lg:px-6">
        {/* Title block */}
        <div className="flex items-start gap-2.5 mt-2 mb-5">
          <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block shrink-0" />
          <div>
            <h1 className="text-[22px] font-bold text-ink leading-tight">
              Assignments
            </h1>
            <p className="mt-0.5 text-[13.5px] text-ink-muted">
              Manage and create assignments for your classes.
            </p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingGrid />
        ) : error ? (
          <div className="mt-8 text-[13px] text-red-600">Failed to load: {error}</div>
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <>
            <FilterBar query={query} onQueryChange={setQuery} />

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 pb-32">
              {filtered.map((a) => (
                <AssignmentCard key={a._id} assignment={a} onDelete={handleDelete} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center text-[13px] text-ink-muted py-10">
                No matches for &ldquo;{query}&rdquo;.
              </div>
            )}

            {/* Floating Create Assignment pill */}
            <Link
              href="/assignments/create"
              className="hidden lg:inline-flex fixed bottom-6 left-1/2 -translate-x-1/2 z-20 items-center h-12 rounded-full bg-ink hover:bg-black px-5 gap-2 shadow-lg"
            >
              <Sparkles size={15} strokeWidth={2.2} className="text-white" />
              <span className="text-[13.5px] font-medium text-white">
                Create Assignment
              </span>
            </Link>
          </>
        )}
      </div>
    </>
  );
}

function LoadingGrid() {
  return (
    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-line rounded-2xl p-5 h-[120px] shimmer" />
      ))}
    </div>
  );
}
