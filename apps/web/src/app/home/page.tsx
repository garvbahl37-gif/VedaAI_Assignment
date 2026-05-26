import { TopHeader } from '@/components/layout/TopHeader';

export default function HomePage() {
  return (
    <>
      <TopHeader title="Home" />
      <div className="px-4 lg:px-8 py-8 max-w-3xl mx-auto">
        <h1 className="text-[20px] font-semibold text-ink">Welcome back 👋</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          This is your dashboard. Jump into <a className="text-brand font-medium" href="/assignments">Assignments</a> to
          create or grade student work.
        </p>
      </div>
    </>
  );
}
