/**
 * @file src/pages/Members.tsx
 * Orchestrateur de la page Pratiquants.
 */
import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Printer } from 'lucide-react';

import { useMembers } from '@/hooks/useMembers';
import { useAuth } from '@/hooks/useAuth';
import { useTableResponsive } from '@/hooks/useTableResponsive';

import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { DeleteDialog } from '@/components/shared/DeleteDialog';
import { PrintHeader } from '@/components/shared/PrintHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';

import { MemberFormDialog } from '@/components/members/MemberFormDialog';
import { MemberTableDesktop } from '@/components/members/MemberTableDesktop';
import { MemberCardsMobile } from '@/components/members/MemberCardsMobile';

import { MEMBER_STATUS_LABELS } from '@/lib/utils';
import type { Member, MemberFormData, MemberStatus } from '@/types';

function buildDefaultForm(): MemberFormData {
  return {
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    status: 'active',
  };
}

export default function Members() {
  const { members, loading, isMutating, create, update, remove } = useMembers();
  const { isAdmin } = useAuth();
  const isMobileView = useTableResponsive();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<MemberFormData>(buildDefaultForm());

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.member_number || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [members, searchTerm, statusFilter]);

  const openCreate = () => {
    setFormData(buildDefaultForm());
    setSelectedMember(null);
    setIsFormOpen(true);
  };

  const openEdit = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      phone: member.phone || '',
      email: member.email || '',
      status: member.status,
    });
    setIsFormOpen(true);
  };

  const openDelete = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember) {
      update(selectedMember.id, formData);
    } else {
      create(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (selectedMember) remove(selectedMember.id);
    setIsDeleteOpen(false);
    setSelectedMember(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PrintHeader title="Vovinam UGB  Club" subtitle="Liste des Pratiquants" />

        <PageHeader
          title="Pratiquants"
          subtitle="Gérez les membres du club"
          actions={
            <div className="flex gap-2 w-full sm:w-auto no-print">
              <Button onClick={() => window.print()} variant="outline" className="flex-1 sm:flex-none border-navy text-navy hover:bg-navy/5">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              {isAdmin && (
                <Button onClick={openCreate} className="flex-1 sm:flex-none bg-navy hover:bg-navy-light">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau
                </Button>
              )}
            </div>
          }
        />

        <Card className="print:shadow-none print:border-none overflow-hidden">
          <CardHeader className="no-print pb-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="flex-1">
                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher un pratiquant..." />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] h-11">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {Object.entries(MEMBER_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0 sm:p-6">
            {loading ? (
              <LoadingSpinner message="Chargement des pratiquants..." />
            ) : filteredMembers.length === 0 ? (
              <EmptyState message="Aucun pratiquant trouvé" />
            ) : isMobileView ? (
              <MemberCardsMobile members={filteredMembers} isAdmin={isAdmin} onEdit={openEdit} onDelete={openDelete} />
            ) : (
              <MemberTableDesktop members={filteredMembers} isAdmin={isAdmin} onEdit={openEdit} onDelete={openDelete} />
            )}
          </CardContent>
        </Card>

        <MemberFormDialog
          open={isFormOpen}
          onOpenChange={(o) => { setIsFormOpen(o); if (!o) setSelectedMember(null); }}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          selectedMember={selectedMember}
          isMutating={isMutating}
        />

        <DeleteDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDelete}
          description={`Êtes-vous sûr de vouloir supprimer ${selectedMember?.first_name} ${selectedMember?.last_name} ? Cette action est irréversible.`}
        />
      </div>
    </DashboardLayout>
  );
}
