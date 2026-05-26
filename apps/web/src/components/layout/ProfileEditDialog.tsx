'use client';

import { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { useProfileStore } from '@/stores/profileStore';
import type { SchoolProfile } from '@vedaai/shared';

interface ProfileEditDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileEditDialog({ open, onClose }: ProfileEditDialogProps) {
  const profile = useProfileStore();
  const setProfile = useProfileStore((s) => s.setProfile);

  const [draft, setDraft] = useState<SchoolProfile>({
    schoolName: profile.schoolName,
    city: profile.city,
    principalName: profile.principalName ?? '',
    teacherName: profile.teacherName ?? '',
    defaultClass: profile.defaultClass ?? '',
    defaultSubject: profile.defaultSubject ?? '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft({
        schoolName: profile.schoolName,
        city: profile.city,
        principalName: profile.principalName ?? '',
        teacherName: profile.teacherName ?? '',
        defaultClass: profile.defaultClass ?? '',
        defaultSubject: profile.defaultSubject ?? '',
      });
      setSaved(false);
    }
  }, [open, profile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = () => {
    setProfile({
      schoolName: draft.schoolName.trim() || 'My School',
      city: draft.city.trim(),
      principalName: draft.principalName?.trim() || '',
      teacherName: draft.teacherName?.trim() || '',
      defaultClass: draft.defaultClass?.trim() || '',
      defaultSubject: draft.defaultSubject?.trim() || '',
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-line overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-[16px] font-semibold text-ink">Edit School Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-surface-subtle text-ink-muted flex items-center justify-center"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field
            label="School Name"
            value={draft.schoolName}
            placeholder="Delhi Public School"
            onChange={(v) => setDraft((d) => ({ ...d, schoolName: v }))}
            autoFocus
          />
          <Field
            label="City / Location"
            value={draft.city}
            placeholder="Bokaro Steel City"
            onChange={(v) => setDraft((d) => ({ ...d, city: v }))}
          />
          <Field
            label="Principal Name"
            value={draft.principalName ?? ''}
            placeholder="Optional"
            onChange={(v) => setDraft((d) => ({ ...d, principalName: v }))}
          />
          <Field
            label="Your Name (Teacher)"
            value={draft.teacherName ?? ''}
            placeholder="John Doe"
            onChange={(v) => setDraft((d) => ({ ...d, teacherName: v }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Default Class"
              value={draft.defaultClass ?? ''}
              placeholder="Class 6"
              onChange={(v) => setDraft((d) => ({ ...d, defaultClass: v }))}
            />
            <Field
              label="Default Subject"
              value={draft.defaultSubject ?? ''}
              placeholder="Science"
              onChange={(v) => setDraft((d) => ({ ...d, defaultSubject: v }))}
            />
          </div>
          <p className="text-[11.5px] text-ink-muted leading-snug">
            Your school name will be printed at the top of every generated question paper.
            Default class &amp; subject pre-fill the create-assignment form.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-line bg-surface-page">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-full border border-line bg-white text-[13px] font-medium text-ink hover:bg-surface-subtle"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-ink text-[13px] font-medium text-white hover:bg-black"
          >
            {saved ? (
              <>
                <Check size={14} />
                Saved
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}

function Field({ label, value, placeholder, onChange, autoFocus }: FieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[12.5px] font-medium text-ink-muted">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-xl bg-white border border-line px-3.5 text-[13.5px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand"
      />
    </label>
  );
}
