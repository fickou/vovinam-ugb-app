/**
 * @file src/components/members/MemberTableDesktop.tsx
 * Affichage des membres sous forme de table (Desktop).
 */
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { MemberStatusBadge } from './MemberStatusBadge';
import type { Member } from '@/types';

interface Props {
  members: Member[];
  isAdmin: boolean;
  onEdit: (m: Member) => void;
  onDelete: (m: Member) => void;
}

export function MemberTableDesktop({ members, isAdmin, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto w-full">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="whitespace-nowrap font-bold">N° Adhérent</TableHead>
            <TableHead className="whitespace-nowrap font-bold">Nom</TableHead>
            <TableHead className="whitespace-nowrap font-bold">Téléphone</TableHead>
            <TableHead className="whitespace-nowrap font-bold">Email</TableHead>
            <TableHead className="whitespace-nowrap font-bold">Statut</TableHead>
            {isAdmin && <TableHead className="text-right no-print font-bold">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id} className={`${member.status !== 'active' ? 'no-print' : ''} hover:bg-muted/30 transition-colors`}>
              <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{member.member_number}</TableCell>
              <TableCell className="font-semibold text-slate-800 whitespace-nowrap">{member.first_name} {member.last_name}</TableCell>
              <TableCell className="whitespace-nowrap">{member.phone || '-'}</TableCell>
              <TableCell className="whitespace-nowrap max-w-[200px] truncate">{member.email || '-'}</TableCell>
              <TableCell className="whitespace-nowrap"><MemberStatusBadge status={member.status} /></TableCell>
              {isAdmin && (
                <TableCell className="text-right no-print">
                  <div className="flex justify-end gap-1 md:gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(member)} className="h-8 w-8 hover:bg-navy/10 hover:text-navy transition-colors">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(member)} className="text-destructive h-8 w-8 hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
