/**
 * @file src/components/members/MemberStatusBadge.tsx
 * Badge de statut membre.
 */
import { Badge } from '@/components/ui/badge';
import { MEMBER_STATUS_COLORS, MEMBER_STATUS_LABELS } from '@/lib/utils';
import type { MemberStatus } from '@/types';

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const colorClass = MEMBER_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  const label = MEMBER_STATUS_LABELS[status] || status;
  return <Badge className={`${colorClass} whitespace-nowrap`}>{label}</Badge>;
}
