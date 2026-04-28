/**
 * @file src/components/members/MemberCardsMobile.tsx
 * Affichage des membres sous forme de cards (Mobile).
 */
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { MemberStatusBadge } from './MemberStatusBadge';
import { formatDate } from '@/lib/utils';
import type { Member } from '@/types';

interface Props {
  members: Member[];
  isAdmin: boolean;
  onEdit: (m: Member) => void;
  onDelete: (m: Member) => void;
}

export function MemberCardsMobile({ members, isAdmin, onEdit, onDelete }: Props) {
  return (
    <div className="space-y-3 px-3 py-4">
      {members.map((member) => (
        <Card key={member.id} className="p-4 border border-gray-200">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm truncate">
                {member.first_name} {member.last_name}
              </h3>
              {member.member_number && (
                <p className="text-xs font-mono text-muted-foreground mt-1">#{member.member_number}</p>
              )}
            </div>
            {isAdmin && (
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => onEdit(member)} className="h-8 w-8 hover:bg-navy/10 hover:text-navy">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(member)} className="text-destructive h-8 w-8 hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-slate-600">
            {member.phone && <p className="truncate">{member.phone}</p>}
            {member.email && <p className="truncate">{member.email}</p>}
          </div>

          <div className="flex gap-2 items-center pt-2 border-t border-slate-100">
            <MemberStatusBadge status={member.status} />
            <span className="text-[10px] text-muted-foreground ml-auto">
              Inscrit le {formatDate(member.created_at)}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
