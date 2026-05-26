'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  BookMarked,
  Sparkles,
} from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import {
  useGroupsStore,
  COLOR_CLASSES,
  type Group,
} from '@/stores/groupsStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useProfileStore } from '@/stores/profileStore';
import { useCreateAssignmentStore } from '@/stores/createAssignmentStore';
import { GroupEditDialog, type GroupDraft } from '@/components/groups/GroupEditDialog';

export default function GroupsPage() {
  const router = useRouter();
  const groups = useGroupsStore((s) => s.groups);
  const addGroup = useGroupsStore((s) => s.add);
  const updateGroup = useGroupsStore((s) => s.update);
  const removeGroup = useGroupsStore((s) => s.remove);
  const addNotification = useNotificationsStore((s) => s.add);
  const setProfile = useProfileStore((s) => s.setProfile);
  const updateFormData = useCreateAssignmentStore((s) => s.updateFormData);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const handleNew = () => {
    setEditingGroup(null);
    setDialogOpen(true);
  };

  const handleEdit = (g: Group) => {
    setEditingGroup(g);
    setDialogOpen(true);
  };

  const handleSave = (draft: GroupDraft) => {
    if (editingGroup) {
      updateGroup(editingGroup.id, draft);
      addNotification({
        type: 'group_created',
        title: 'Group updated',
        description: draft.name,
        link: '/groups',
      });
    } else {
      const created = addGroup(draft);
      addNotification({
        type: 'group_created',
        title: 'Group created',
        description: created.name,
        link: '/groups',
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = (g: Group) => {
    if (confirm(`Delete group "${g.name}"? This cannot be undone.`)) {
      removeGroup(g.id);
    }
  };

  const handleCreateAssignmentForGroup = (g: Group) => {
    // Pre-fill the profile defaults and create-form with this group's class+subject,
    // then navigate to the create page.
    setProfile({ defaultClass: g.classLevel, defaultSubject: g.subject });
    updateFormData({
      title: `${g.subject} Assignment — ${g.classLevel}`,
    });
    router.push('/assignments/create');
  };

  return (
    <>
      <TopHeader title="My Groups" />
      <div className="px-4 lg:px-8 py-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-500 inline-block shrink-0" />
            <div>
              <h1 className="text-[22px] font-bold text-ink leading-tight">My Groups</h1>
              <p className="mt-0.5 text-[13.5px] text-ink-muted">
                Classes &amp; sections you teach — assign work to each in one click.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleNew}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-ink text-[13px] font-medium text-white hover:bg-black"
          >
            <Plus size={14} />
            New Group
          </button>
        </div>

        {groups.length === 0 ? (
          <EmptyState onCreate={handleNew} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <GroupCard
                key={g.id}
                group={g}
                onEdit={() => handleEdit(g)}
                onDelete={() => handleDelete(g)}
                onAssign={() => handleCreateAssignmentForGroup(g)}
              />
            ))}
          </div>
        )}

        {groups.length > 0 && (
          <p className="text-[12px] text-ink-muted text-center pt-2">
            {groups.length} {groups.length === 1 ? 'group' : 'groups'} ·{' '}
            {groups.reduce((sum, g) => sum + g.studentCount, 0)} students total
          </p>
        )}
      </div>

      <GroupEditDialog
        open={dialogOpen}
        group={editingGroup}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-white border border-line rounded-3xl p-12 flex flex-col items-center justify-center text-center">
      <div className="h-14 w-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
        <Users size={22} strokeWidth={1.6} />
      </div>
      <h2 className="text-[15.5px] font-bold text-ink">No groups yet</h2>
      <p className="mt-1.5 text-[13px] text-ink-muted max-w-sm">
        Create a group for each class or section you teach. Then assign work to a whole
        group in one click — class &amp; subject auto-fill from the group&apos;s settings.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 h-10 px-5 rounded-full bg-ink text-[13px] font-medium text-white hover:bg-black"
      >
        <Plus size={14} />
        Create Your First Group
      </button>
    </div>
  );
}

function GroupCard({
  group,
  onEdit,
  onDelete,
  onAssign,
}: {
  group: Group;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
}) {
  const cls = COLOR_CLASSES[group.color];

  return (
    <div className="bg-white border border-line rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className={`h-1.5 ${cls.strip}`} />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className={`h-9 w-9 rounded-lg ${cls.bg} ${cls.text} flex items-center justify-center shrink-0`}>
            <Users size={16} strokeWidth={1.8} />
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={onEdit}
              className="h-8 w-8 rounded-full hover:bg-surface-subtle text-ink-muted flex items-center justify-center"
              aria-label="Edit group"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600 text-ink-muted flex items-center justify-center"
              aria-label="Delete group"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <h3 className="mt-3 text-[15px] font-bold text-ink line-clamp-2">{group.name}</h3>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center gap-1 h-5 px-2 rounded-full text-[10.5px] font-medium ${cls.bg} ${cls.text}`}>
            <GraduationCap size={11} />
            {group.classLevel}
          </span>
          <span className={`inline-flex items-center gap-1 h-5 px-2 rounded-full text-[10.5px] font-medium ${cls.bg} ${cls.text}`}>
            <BookMarked size={11} />
            {group.subject}
          </span>
          <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full text-[10.5px] font-medium bg-surface-page text-ink-muted">
            <Users size={11} />
            {group.studentCount} students
          </span>
        </div>

        {group.description && (
          <p className="mt-2.5 text-[12.5px] text-ink-muted line-clamp-2">
            {group.description}
          </p>
        )}

        <button
          type="button"
          onClick={onAssign}
          className="mt-auto pt-4 inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-ink text-[12.5px] font-medium text-white hover:bg-black"
        >
          <Sparkles size={12} />
          Create Assignment
        </button>
      </div>
    </div>
  );
}

