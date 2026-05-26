import { TopHeader } from '@/components/layout/TopHeader';

export default function ToolkitPage() {
  return (
    <>
      <TopHeader title="AI Teacher's Toolkit" />
      <div className="px-4 lg:px-8 py-8 max-w-3xl mx-auto">
        <h1 className="text-[20px] font-semibold text-ink">AI Teacher&apos;s Toolkit</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          Coming soon — lesson plans, rubrics, and AI-assisted grading tools.
        </p>
      </div>
    </>
  );
}
