'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  COLOR_CLASSES,
  GROUP_COLORS,
  type Group,
  type GroupColor,
} from '@/stores/groupsStore';

export interface GroupDraft {
  name: string;
  classLevel: string;
  subject: string;
  studentCount: number;
  description: string;
  color: GroupColor;
}

interface GroupEditDialogProps {
  open: boolean;
  group?: Group | null;
  onClose: () => void;
  onSave: (draft: GroupDraft) => void;
}

const EMPTY_DRAFT: GroupDraft = {
  name: '',
  classLevel: '',
  subject: '',
  studentCount: 30,
  description: '',
  color: 'emerald',
};

export function GroupEditDialog({ open, group, onClose, onSave }: GroupEditDialogProps) {
  const [draft, setDraft] = useState<GroupDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setErrors([]);
      if (group) {
        setDraft({
          name: group.name,
          classLevel: group.classLevel,
          subject: group.subject,
          studentCount: group.studentCount,
          description: group.description ?? '',
          color: group.color,
        });
      } else {
        setDraft(EMPTY_DRAFT);
      }
    }
  }, [open, group]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!draft.name.trim()) errs.push('Group name is required.');
    if (!draft.classLevel.trim()) errs.push('Class level is required.');
    if (!draft.subject.trim()) errs.push('Subject is required.');
    if (draft.studentCount < 0 || draft.studentCount > 500)
      errs.push('Student count must be between 0 and 500.');
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;
    onSave({
      ...draft,
      name: draft.name.trim(),
      classLevel: draft.classLevel.trim(),
      subject: draft.subject.trim(),
      description: draft.description.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-line overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-[16px] font-semibold text-ink">
            {group ? 'Edit Group' : 'New Group'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-surface-subtle text-ink-muted flex items-center justify-center"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <Field
            label="Group Name"
            value={draft.name}
            placeholder="e.g. 6-A Science"
            onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Class Level"
              value={draft.classLevel}
              placeholder="Class 6"
              onChange={(v) => setDraft((d) => ({ ...d, classLevel: v }))}
            />
            <Field
              label="Subject"
              value={draft.subject}
              placeholder="Science"
              onChange={(v) => setDraft((d) => ({ ...d, subject: v }))}
            />
          </div>
          <NumberField
            label="Student Count"
            value={draft.studentCount}
            onChange={(v) => setDraft((d) => ({ ...d, studentCount: v }))}
          />
          <Field
            label="Description (optional)"
            value={draft.description}
            placeholder="Notes about this group"
            onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
          />

          <div>
            <span className="text-[12.5px] font-medium text-ink-muted block mb-2">
              Color
            </span>
            <div className="flex flex-wrap gap-2">
              {GROUP_COLORS.map((c) => {
                const cls = COLOR_CLASSES[c];
                const active = draft.color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, color: c }))}
                    className={[
                      'h-8 w-8 rounded-full transition-all',
                      cls.strip,
                      active ? 'ring-2 ring-offset-2 ring-ink scale-110' : 'opacity-80 hover:opacity-100',
                    ].join(' ')}
                    aria-label={`Color ${c}`}
                  />
                );
              })}
            </div>
          </div>

          {errors.length > 0 && (
            <ul className="rounded-md border border-red-200 bg-red-50 p-3 text-[12px] text-red-700 space-y-0.5">
              {errors.map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
            </ul>
          )}
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
            className="h-10 px-5 rounded-full bg-ink text-[13px] font-medium text-white hover:bg-black"
          >
            {group ? 'Save Changes' : 'Create Group'}
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

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[12.5px] font-medium text-ink-muted">{label}</span>
      <input
        type="number"
        min={0}
        max={500}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(500, Number(e.target.value) || 0)))}
        className="w-full h-10 rounded-xl bg-white border border-line px-3.5 text-[13.5px] text-ink focus:outline-none focus:border-brand"
      />
    </label>
  );
}
