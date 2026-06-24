/**
 * @file src/components/members/MemberFormDialog.tsx
 * Dialog de création / modification d'un membre, avec section Tuteur optionnelle.
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Shield } from 'lucide-react';
import { MEMBER_STATUS_LABELS } from '@/lib/utils';
import type { MemberFormData, MemberStatus, Member } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: MemberFormData;
  onFormChange: (data: MemberFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedMember: Member | null;
  isMutating: boolean;
}

export function MemberFormDialog({
  open, onOpenChange, formData, onFormChange, onSubmit, selectedMember, isMutating,
}: Props) {
  const set = (field: keyof MemberFormData, value: string) =>
    onFormChange({ ...formData, [field]: value });

  const hasGuardian = !!(formData.guardian_name || formData.guardian_phone);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] rounded-xl overflow-hidden p-0">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle>{selectedMember ? 'Modifier le pratiquant' : 'Ajouter un pratiquant'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* ── Identité ── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom *</Label>
                <Input id="first_name" required value={formData.first_name} onChange={(e) => set('first_name', e.target.value)} className="rounded-lg h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom *</Label>
                <Input id="last_name" required value={formData.last_name} onChange={(e) => set('last_name', e.target.value)} className="rounded-lg h-11" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={(e) => set('phone', e.target.value)} className="rounded-lg h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => set('email', e.target.value)} className="rounded-lg h-11" />
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(v) => set('status', v as MemberStatus)}>
                <SelectTrigger className="rounded-lg h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(MEMBER_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ── Tuteur / Responsable légal ── */}
            <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-700">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-semibold">Tuteur / Responsable légal</span>
                <span className="text-xs text-amber-600 ml-auto">(optionnel)</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian_name" className="text-sm">Nom du tuteur</Label>
                <Input
                  id="guardian_name"
                  value={formData.guardian_name}
                  onChange={(e) => set('guardian_name', e.target.value)}
                  placeholder="ex: Ibrahima DIALLO"
                  className="rounded-lg h-10 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian_phone" className="text-sm">Téléphone du tuteur</Label>
                <Input
                  id="guardian_phone"
                  type="tel"
                  value={formData.guardian_phone}
                  onChange={(e) => set('guardian_phone', e.target.value)}
                  placeholder="ex: 77 123 45 67"
                  className="rounded-lg h-10 bg-white"
                />
              </div>
            </div>

            <Button type="submit" disabled={isMutating} className="w-full bg-navy hover:bg-navy-light text-white py-6 text-lg rounded-xl mt-2">
              {selectedMember ? 'Modifier' : 'Ajouter'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
