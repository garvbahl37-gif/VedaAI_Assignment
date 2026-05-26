'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import { useProfileStore } from '@/stores/profileStore';

export default function SettingsPage() {
  const profile = useProfileStore();
  const setProfile = useProfileStore((s) => s.setProfile);
  const reset = useProfileStore((s) => s.reset);

  const [savedSection, setSavedSection] = useState<string | null>(null);

  const markSaved = (section: string) => {
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 1400);
  };

  return (
    <>
      <TopHeader title="Settings" />
      <div className="px-4 lg:px-8 py-8 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-[22px] font-bold text-ink">Settings</h1>
          <p className="mt-1 text-[13.5px] text-ink-muted">
            Profile, generation defaults, and integrations.
          </p>
        </div>

        {/* Section: School Profile */}
        <SettingsCard
          title="School Profile"
          subtitle="Printed at the top of every generated question paper."
          saved={savedSection === 'school'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SettingField
              label="School Name"
              value={profile.schoolName}
              placeholder="Delhi Public School"
              onCommit={(v) => {
                setProfile({ schoolName: v });
                markSaved('school');
              }}
            />
            <SettingField
              label="City / Location"
              value={profile.city}
              placeholder="Bokaro Steel City"
              onCommit={(v) => {
                setProfile({ city: v });
                markSaved('school');
              }}
            />
            <SettingField
              label="Principal Name"
              value={profile.principalName ?? ''}
              placeholder="Optional"
              onCommit={(v) => {
                setProfile({ principalName: v });
                markSaved('school');
              }}
            />
            <SettingField
              label="Teacher Name"
              value={profile.teacherName ?? ''}
              placeholder="John Doe"
              onCommit={(v) => {
                setProfile({ teacherName: v });
                markSaved('school');
              }}
            />
            <div className="md:col-span-2">
              <SettingField
                label="Profile Photo URL"
                value={profile.photoUrl ?? ''}
                placeholder="https://… (paste any image URL; initials shown if empty)"
                onCommit={(v) => {
                  setProfile({ photoUrl: v });
                  markSaved('school');
                }}
              />
            </div>
          </div>
        </SettingsCard>

        {/* Section: Generation Defaults */}
        <SettingsCard
          title="Generation Defaults"
          subtitle="Pre-fill the create-assignment form and toolkit shortcuts."
          saved={savedSection === 'defaults'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SettingField
              label="Default Class"
              value={profile.defaultClass ?? ''}
              placeholder="Class 6"
              onCommit={(v) => {
                setProfile({ defaultClass: v });
                markSaved('defaults');
              }}
            />
            <SettingField
              label="Default Subject"
              value={profile.defaultSubject ?? ''}
              placeholder="Science"
              onCommit={(v) => {
                setProfile({ defaultSubject: v });
                markSaved('defaults');
              }}
            />
          </div>
        </SettingsCard>

        {/* Section: Danger Zone */}
        <SettingsCard
          title="Reset"
          subtitle="Restore all profile settings to defaults."
        >
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all profile settings to defaults?')) {
                reset();
                markSaved('reset');
              }
            }}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-line bg-white text-[13px] font-medium text-ink hover:bg-surface-subtle"
          >
            <RotateCcw size={14} />
            Reset to Defaults
          </button>
          {savedSection === 'reset' && (
            <span className="ml-3 inline-flex items-center gap-1 text-[12.5px] text-emerald-600">
              <Check size={13} /> Reset
            </span>
          )}
        </SettingsCard>
      </div>
    </>
  );
}

interface SettingsCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  saved?: boolean;
}

function SettingsCard({ title, subtitle, children, saved }: SettingsCardProps) {
  return (
    <div className="bg-white border border-line rounded-3xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[15.5px] font-bold text-ink">{title}</h2>
          <p className="mt-0.5 text-[12.5px] text-ink-muted">{subtitle}</p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1 text-[12px] text-emerald-600 font-medium">
            <Check size={13} /> Saved
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

interface SettingFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onCommit: (v: string) => void;
}

function SettingField({ label, value, placeholder, onCommit }: SettingFieldProps) {
  const [local, setLocal] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local state when store changes externally — but only when the input is not focused.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setLocal(value);
    }
  }, [value]);

  return (
    <label className="block space-y-1.5">
      <span className="text-[12.5px] font-medium text-ink-muted">{label}</span>
      <input
        ref={inputRef}
        type="text"
        value={local}
        placeholder={placeholder}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (local !== value) onCommit(local.trim());
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
        className="w-full h-10 rounded-xl bg-surface-page border border-transparent px-3.5 text-[13.5px] text-ink placeholder:text-ink-muted focus:outline-none focus:bg-white focus:border-line"
      />
    </label>
  );
}
