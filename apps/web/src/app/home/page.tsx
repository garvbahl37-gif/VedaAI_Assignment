'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  FileText,
  Users,
  BookOpen,
  PieChart,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import { useAssignmentStore } from '@/stores/assignmentStore';
import { useGroupsStore } from '@/stores/groupsStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { useProfileStore } from '@/stores/profileStore';
import { api } from '@/lib/api';

export default function HomePage() {
  const teacherName = useProfileStore((s) => s.teacherName) || '';
  const firstName = teacherName.trim().split(/\s+/)[0] || 'there';

  const assignments = useAssignmentStore((s) => s.assignments);
  const setAssignments = useAssignmentStore((s) => s.setAssignments);
  const groups = useGroupsStore((s) => s.groups);
  const quizzes = useLibraryStore((s) => s.quizzes);

  // Pull the assignment list once so the stats and recent-list reflect what's
  // actually in Mongo, not just whatever happened to be cached in the store
  // from a previous page visit.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.listAssignments();
        if (!cancelled) setAssignments(res.assignments);
      } catch {
        // Non-fatal: if the API is unreachable we just show whatever's in the
        // store. The /assignments page will surface a clearer error later.
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [setAssignments]);

  const recent = assignments.slice(0, 4);
  const totalStudents = groups.reduce((sum, g) => sum + g.studentCount, 0);

  return (
    <>
      <TopHeader title="Home" />

      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-7 pb-32">
        {/* Greeting */}
        <div className="flex items-start gap-2.5">
          <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block shrink-0" />
          <div>
            <h1 className="text-[22px] font-bold text-ink leading-tight">
              Welcome back, {firstName}
            </h1>
            <p className="mt-0.5 text-[13.5px] text-ink-muted">
              Here&apos;s a snapshot of your classroom. Jump into a workflow below.
            </p>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Assignments"
            value={assignments.length}
            icon={FileText}
            color="blue"
            href="/assignments"
          />
          <StatCard
            label="My Groups"
            value={groups.length}
            sub={totalStudents > 0 ? `${totalStudents} students` : undefined}
            icon={Users}
            color="amber"
            href="/groups"
          />
          <StatCard
            label="Saved Quizzes"
            value={quizzes.length}
            icon={BookOpen}
            color="purple"
            href="/library"
          />
          <StatCard
            label="Toolkit"
            value="—"
            sub="Quick MCQs"
            icon={PieChart}
            color="brand"
            href="/toolkit"
          />
        </div>

        {/* Quick actions */}
        <section>
          <h2 className="text-[14.5px] font-bold text-ink mb-3">Quick actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ActionCard
              title="Create a new assignment"
              description="Generate a curriculum-aligned question paper in under a minute."
              icon={Sparkles}
              href="/assignments/create"
              primary
            />
            <ActionCard
              title="Run a Quick Quiz"
              description="Get 1-15 MCQs on any topic without going through the full flow."
              icon={BookOpen}
              href="/toolkit"
            />
            <ActionCard
              title="Set up a group"
              description="Add a class so future assignments auto-fill the subject and level."
              icon={Users}
              href="/groups"
            />
          </div>
        </section>

        {/* Recent assignments */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14.5px] font-bold text-ink">Recent assignments</h2>
            {assignments.length > 0 && (
              <Link
                href="/assignments"
                className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-muted hover:text-ink"
              >
                View all
                <ArrowRight size={12} />
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <EmptyRecentState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recent.map((a) => (
                <RecentRow
                  key={a._id}
                  id={a._id}
                  title={a.title}
                  status={a.status}
                  createdAt={a.createdAt}
                  dueDate={a.dueDate}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────

const COLOR_CLASSES = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  brand: { bg: 'bg-brand-50', text: 'text-brand-600' },
};

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: typeof FileText;
  color: keyof typeof COLOR_CLASSES;
  href: string;
}) {
  const c = COLOR_CLASSES[color];
  return (
    <Link
      href={href}
      className="bg-white border border-line rounded-2xl p-4 hover:shadow-md active:bg-surface-page transition-all flex items-start gap-3"
    >
      <div className={`h-9 w-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center shrink-0`}>
        <Icon size={16} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] text-ink-muted">{label}</p>
        <p className="text-[20px] font-bold text-ink leading-tight">{value}</p>
        {sub && <p className="mt-0.5 text-[11px] text-ink-muted truncate">{sub}</p>}
      </div>
    </Link>
  );
}

function ActionCard({
  title,
  description,
  icon: Icon,
  href,
  primary,
}: {
  title: string;
  description: string;
  icon: typeof Sparkles;
  href: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        'rounded-2xl p-4 border transition-all flex items-start gap-3 group',
        primary
          ? 'bg-ink border-ink text-white hover:bg-black'
          : 'bg-white border-line text-ink hover:shadow-md active:bg-surface-page',
      ].join(' ')}
    >
      <div
        className={[
          'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
          primary ? 'bg-white/10 text-white' : 'bg-brand-50 text-brand-600',
        ].join(' ')}
      >
        <Icon size={16} strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-[13.5px] font-bold leading-tight ${primary ? 'text-white' : 'text-ink'}`}>
          {title}
        </p>
        <p className={`mt-1 text-[12px] leading-snug ${primary ? 'text-white/70' : 'text-ink-muted'}`}>
          {description}
        </p>
      </div>
      <ArrowRight
        size={14}
        className={[
          'mt-1 shrink-0 transition-transform group-hover:translate-x-0.5',
          primary ? 'text-white/80' : 'text-ink-muted',
        ].join(' ')}
      />
    </Link>
  );
}

function RecentRow({
  id,
  title,
  status,
  createdAt,
  dueDate,
}: {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  dueDate: string;
}) {
  const created = new Date(createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
  const due = new Date(dueDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });

  const statusClass =
    status === 'completed'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'failed'
        ? 'bg-red-50 text-red-700'
        : 'bg-amber-50 text-amber-700';

  return (
    <Link
      href={`/assignments/${id}/output`}
      className="bg-white border border-line rounded-2xl p-4 hover:shadow-md active:bg-surface-page transition-all block"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[14px] font-bold text-ink leading-snug line-clamp-2">
          {title}
        </h3>
        <span className={`shrink-0 inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold uppercase ${statusClass}`}>
          {status}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span>
          <span className="font-semibold text-ink">Assigned</span>
          <span className="text-ink-muted"> : {created}</span>
        </span>
        <span>
          <span className="font-semibold text-ink">Due</span>
          <span className="text-ink-muted"> : {due}</span>
        </span>
      </div>
    </Link>
  );
}

function EmptyRecentState() {
  return (
    <div className="bg-white border border-line rounded-2xl p-8 text-center">
      <div className="h-12 w-12 mx-auto rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
        <Sparkles size={20} strokeWidth={1.8} />
      </div>
      <p className="mt-3 text-[13.5px] font-semibold text-ink">No assignments yet</p>
      <p className="mt-1 text-[12.5px] text-ink-muted">
        Generate your first question paper to see it here.
      </p>
      <Link
        href="/assignments/create"
        className="mt-4 inline-flex items-center gap-2 h-10 px-5 rounded-full bg-ink text-[13px] font-medium text-white hover:bg-black active:bg-black"
      >
        <Plus size={14} strokeWidth={2.4} />
        Create Assignment
      </Link>
    </div>
  );
}
