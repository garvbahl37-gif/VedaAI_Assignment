import { TopHeader } from '@/components/layout/TopHeader';

export default function SettingsPage() {
  return (
    <>
      <TopHeader title="Settings" />
      <div className="px-4 lg:px-8 py-8 max-w-3xl mx-auto">
        <h1 className="text-[20px] font-semibold text-ink">Settings</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          Profile, school details, and integrations live here.
        </p>
      </div>
    </>
  );
}
