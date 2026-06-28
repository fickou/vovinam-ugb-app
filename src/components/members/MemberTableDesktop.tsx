/**
 * @file src/components/members/MemberTableDesktop.tsx
 * Affichage des membres sous forme de table (Desktop) — avec colonne Tuteur.
 */
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Shield } from 'lucide-react';
import { MemberStatusBadge } from './MemberStatusBadge';
import type { Member } from '@/types';

interface Props {
  members: Member[];
  isAdmin: boolean;
  onEdit: (m: Member) => void;
  onDelete: (m: Member) => void;
  onWelcome: (m: Member) => void;
}

export function MemberTableDesktop({ members, isAdmin, onEdit, onDelete, onWelcome }: Props) {
  return (
    <div className="overflow-x-auto w-full">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="whitespace-nowrap font-bold">N° Adhérent</TableHead>
            <TableHead className="whitespace-nowrap font-bold">Nom</TableHead>
            <TableHead className="whitespace-nowrap font-bold">Téléphone</TableHead>
            <TableHead className="whitespace-nowrap font-bold">Email</TableHead>
            <TableHead className="whitespace-nowrap font-bold">Tuteur</TableHead>
            <TableHead className="whitespace-nowrap font-bold">Statut</TableHead>
            {isAdmin && <TableHead className="text-right no-print font-bold">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id} className={`${member.status !== 'active' ? 'no-print' : ''} hover:bg-muted/30 transition-colors`}>
              <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{member.member_number}</TableCell>
              <TableCell className="font-semibold text-slate-800 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {member.status === 'new' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] px-2 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 no-print"
                      onClick={() => onWelcome(member)}
                    >
                      Bienvenu
                    </Button>
                  )}
                  <span>{member.first_name} {member.last_name}</span>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">{member.phone || '-'}</TableCell>
              <TableCell className="whitespace-nowrap max-w-[200px] truncate">{member.email || '-'}</TableCell>
              <TableCell className="whitespace-nowrap">
                {member.guardian_name ? (
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-amber-800 leading-none">{member.guardian_name}</p>
                      {member.guardian_phone && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{member.guardian_phone}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
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
