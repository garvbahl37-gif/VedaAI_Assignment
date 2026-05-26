import { TopHeader } from '@/components/layout/TopHeader';

export default function LibraryPage() {
  return (
    <>
      <TopHeader title="My Library" />
      <div className="px-4 lg:px-8 py-8 max-w-3xl mx-auto">
        <h1 className="text-[20px] font-semibold text-ink">My Library</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          Coming soon — your saved papers, rubrics, and templates.
        </p>
      </div>
    </>
  );
}
