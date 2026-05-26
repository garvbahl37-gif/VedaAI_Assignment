import { TopHeader } from '@/components/layout/TopHeader';

export default function GroupsPage() {
  return (
    <>
      <TopHeader title="My Groups" />
      <div className="px-4 lg:px-8 py-8 max-w-3xl mx-auto">
        <h1 className="text-[20px] font-semibold text-ink">My Groups</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          Coming soon — manage classes and student rosters here.
        </p>
      </div>
    </>
  );
}
