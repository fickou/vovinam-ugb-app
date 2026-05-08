/**
 * @file src/pages/PassageGrade.tsx
 * Page "Passage de Grade" – permet à l'admin de composer la liste des candidats
 * et d'imprimer un tableau officiel avec cases à cocher (Admis / Ajourné / Absent).
 *
 * Données : lecture des pratiquants via useMembers() (Supabase).
 * Persistance : aucune — la liste est en état local, les résultats se cochent sur papier.
 */
import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Printer,
  Plus,
  Trash2,
  Search,
  Award,
  MapPin,
  Calendar,
  Clock,
  Users,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

import { useMembers } from '@/hooks/useMembers';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { SearchInput } from '@/components/shared/SearchInput';

import type { Member } from '@/types';
import vovinamLogo from '@/assets/logo.png';

// ─── Types locaux ─────────────────────────────────────────────────────────────

interface Candidate {
  memberId: string;
  firstName: string;
  lastName: string;
  memberNumber: string | null;
  gradeTarget: string; // grade visé (ex: "Ceinture Jaune", "1er Dang"…)
  order: number;       // numéro de passage dans la liste
}

interface EventConfig {
  title: string;
  date: string;
  location: string;
  time: string;
  organization: string;
  examiner: string;
}

const GRADE_OPTIONS = [
  'Ceinture Bleue',
  '1er Cap',
  '2e Cap',
  '3e Cap',
  'Ceinture Jaune',
  '1er Dang',
  '2e Dang',
  '3e Dang',
];

const DEFAULT_CONFIG: EventConfig = {
  title: 'PASSAGE DE GRADE',
  date: '',
  location: '',
  time: '09h00',
  organization: 'UNION SENEGALAISE DE VOVINAM VIET VO DAO (USV)',
  examiner: '',
};

// ─── Sous-composants ──────────────────────────────────────────────────────────

function GradeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-xs border border-border rounded-md px-2 bg-background focus:outline-none focus:ring-1 focus:ring-navy w-full"
    >
      <option value="">— Grade —</option>
      {GRADE_OPTIONS.map((g) => (
        <option key={g} value={g}>
          {g}
        </option>
      ))}
    </select>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function PassageGrade() {
  const { members, loading } = useMembers();

  // Configuration de l'événement
  const [config, setConfig] = useState<EventConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(true);

  // Recherche dans la liste des membres
  const [search, setSearch] = useState('');

  // Liste des candidats sélectionnés
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Grade par défaut appliqué lors de l'ajout
  const [defaultGrade, setDefaultGrade] = useState('');

  // ── Membres filtrés (non encore candidats)
  const availableMembers = useMemo(() => {
    const candidateIds = new Set(candidates.map((c) => c.memberId));
    return members.filter((m) => {
      if (candidateIds.has(m.id)) return false;
      const q = search.toLowerCase();
      return (
        m.first_name.toLowerCase().includes(q) ||
        m.last_name.toLowerCase().includes(q) ||
        (m.member_number ?? '').toLowerCase().includes(q)
      );
    });
  }, [members, candidates, search]);

  // ── Actions
  const addCandidate = (member: Member) => {
    setCandidates((prev) => [
      ...prev,
      {
        memberId: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        memberNumber: member.member_number,
        gradeTarget: defaultGrade,
        order: prev.length + 1,
      },
    ]);
  };

  const removeCandidate = (memberId: string) => {
    setCandidates((prev) => {
      const filtered = prev.filter((c) => c.memberId !== memberId);
      // Renuméroter
      return filtered.map((c, i) => ({ ...c, order: i + 1 }));
    });
  };

  const updateGrade = (memberId: string, grade: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.memberId === memberId ? { ...c, gradeTarget: grade } : c))
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setCandidates((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((c, i) => ({ ...c, order: i + 1 }));
    });
  };

  const moveDown = (index: number) => {
    setCandidates((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((c, i) => ({ ...c, order: i + 1 }));
    });
  };

  const clearAll = () => setCandidates([]);

  const updateConfig = (key: keyof EventConfig, value: string) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  // ── Impression
  const handlePrint = () => window.print();

  return (
    <DashboardLayout>
      {/* ══════════════════════════════════════════════
          EN-TÊTE D'IMPRESSION (caché à l'écran)
      ══════════════════════════════════════════════ */}
      <div className="hidden print:block print-passage-header">
        <div className="flex items-start justify-between mb-4">
          <img src={vovinamLogo} alt="Logo" className="h-20 w-20 object-contain" />
          <div className="flex-1 text-center px-4">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-600 mb-1">
              {config.organization}
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tight text-navy mb-2"
              style={{ fontFamily: "'Oswald', sans-serif" }}>
              {config.title}
            </h1>
            {config.date && (
              <p className="text-base font-bold text-gray-800 mt-1">{config.date}</p>
            )}
            <div className="flex items-center justify-center gap-6 mt-2 text-sm text-gray-700 font-semibold">
              {config.location && <span>📍 {config.location}</span>}
              {config.time && <span>⏰ {config.time}</span>}
            </div>
          </div>
          <img src={vovinamLogo} alt="Logo" className="h-20 w-20 object-contain opacity-0" />
        </div>
        <div className="border-t-4 border-navy mb-2" />
        <div className="flex justify-between text-xs text-gray-500 mb-6">
          <span>Total candidats : <strong>{candidates.length}</strong></span>
          <span>
            Document généré le {new Date().toLocaleDateString('fr-FR')} à{' '}
            {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TABLEAU D'IMPRESSION
      ══════════════════════════════════════════════ */}
      <div className="hidden print:block">
        {candidates.length > 0 ? (
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>N°</th>
                <th style={{ width: '30%' }}>Nom &amp; Prénom</th>
                <th style={{ width: '12%' }}>N° Membre</th>
                <th style={{ width: '18%' }}>Grade visé</th>
                <th style={{ width: '11%', textAlign: 'center' }}>Admis</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Ajourné</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Absent</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.memberId}>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{c.order}</td>
                  <td style={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    {c.lastName} {c.firstName}
                  </td>
                  <td style={{ textAlign: 'center', color: '#555' }}>
                    {c.memberNumber || '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.gradeTarget || '—'}</td>
                  {/* Cases à cocher papier */}
                  <td style={{ textAlign: 'center' }}>
                    <span className="print-checkbox" />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="print-checkbox" />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="print-checkbox" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '40px' }}>
            Aucun candidat dans la liste.
          </p>
        )}

        {/* Signatures */}
        <div className="print-signatures">
          <div className="print-sig-box">
            <p className="print-sig-label">Le Président du Club</p>
            <div className="print-sig-line" />
          </div>
          <div className="print-sig-box">
            <p className="print-sig-label">
              L'Examinateur{config.examiner ? ` — ${config.examiner}` : ''}
            </p>
            <div className="print-sig-line" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          INTERFACE ÉCRAN  (masquée à l'impression)
      ══════════════════════════════════════════════ */}
      <div className="space-y-6 no-print">
        <PageHeader
          title="Passage de Grade"
          subtitle={`${candidates.length} candidat${candidates.length > 1 ? 's' : ''} sélectionné${candidates.length > 1 ? 's' : ''}`}
          actions={
            <div className="flex gap-2 flex-wrap justify-end">
              {candidates.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAll}
                  className="border-destructive text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vider la liste
                </Button>
              )}
              <Button
                onClick={handlePrint}
                disabled={candidates.length === 0}
                className="bg-navy hover:bg-navy-light"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimer la liste
              </Button>
            </div>
          }
        />

        {/* ── Configuration de l'événement ── */}
        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
          <CardHeader
            className="bg-navy text-white pb-3 cursor-pointer select-none"
            onClick={() => setShowConfig((v) => !v)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Award className="h-5 w-5" />
                Configuration de l'événement
              </CardTitle>
              {showConfig ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
          {showConfig && (
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5 lg:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Titre de l'événement
                </Label>
                <Input
                  value={config.title}
                  onChange={(e) => updateConfig('title', e.target.value)}
                  placeholder="PASSAGE DE GRADE"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date
                </Label>
                <Input
                  value={config.date}
                  onChange={(e) => updateConfig('date', e.target.value)}
                  placeholder="Samedi 17 Janvier 2026"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Lieu
                </Label>
                <Input
                  value={config.location}
                  onChange={(e) => updateConfig('location', e.target.value)}
                  placeholder="Dojo de l'UGB, Saint-Louis"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Heure
                </Label>
                <Input
                  value={config.time}
                  onChange={(e) => updateConfig('time', e.target.value)}
                  placeholder="09h00"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Organisation
                </Label>
                <Input
                  value={config.organization}
                  onChange={(e) => updateConfig('organization', e.target.value)}
                  placeholder="UNION SENEGALAISE DE VOVINAM VIET VO DAO"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Nom de l'Examinateur
                </Label>
                <Input
                  value={config.examiner}
                  onChange={(e) => updateConfig('examiner', e.target.value)}
                  placeholder="Maître …"
                  className="rounded-lg"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* ── Deux panneaux : membres disponibles / candidats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Panneau gauche : liste des pratiquants ── */}
          <Card className="border-none shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-700 text-white pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pratiquants du club
                <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-0">
                  {availableMembers.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Grade par défaut à l'ajout */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border">
                <Label className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                  Grade par défaut :
                </Label>
                <GradeSelect value={defaultGrade} onChange={setDefaultGrade} />
              </div>

              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Rechercher un pratiquant…"
              />

              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {loading ? (
                  <LoadingSpinner message="Chargement…" />
                ) : availableMembers.length === 0 ? (
                  <EmptyState message={search ? 'Aucun résultat' : 'Tous les pratiquants sont déjà sélectionnés'} />
                ) : (
                  availableMembers.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl border hover:border-navy/30 hover:bg-navy/5 transition-all group"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground uppercase truncate">
                          {m.last_name} {m.first_name}
                        </p>
                        {m.member_number && (
                          <p className="text-xs text-muted-foreground">
                            N° {m.member_number}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addCandidate(m)}
                        className="ml-3 shrink-0 h-8 border-navy/30 text-navy hover:bg-navy hover:text-white transition-all"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Panneau droit : liste des candidats ── */}
          <Card className="border-none shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-navy text-white pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Award className="h-5 w-5" />
                Liste des candidats
                <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-0">
                  {candidates.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {candidates.length === 0 ? (
                <EmptyState message="Ajoutez des pratiquants depuis la liste de gauche" />
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {candidates.map((c, index) => (
                    <div
                      key={c.memberId}
                      className="flex items-center gap-2 p-3 rounded-xl border bg-white shadow-sm"
                    >
                      {/* Numéro */}
                      <span className="text-lg font-black text-navy w-7 shrink-0 text-center">
                        {c.order}
                      </span>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm uppercase truncate">
                          {c.lastName} {c.firstName}
                        </p>
                        {/* Sélecteur de grade */}
                        <div className="mt-1">
                          <GradeSelect
                            value={c.gradeTarget}
                            onChange={(g) => updateGrade(c.memberId, g)}
                          />
                        </div>
                      </div>

                      {/* Contrôles ordre */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Monter"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === candidates.length - 1}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Descendre"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Supprimer */}
                      <button
                        onClick={() => removeCandidate(c.memberId)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors shrink-0"
                        title="Retirer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Aperçu du tableau ── */}
        {candidates.length > 0 && (
          <Card className="border-none shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-100 pb-3">
              <CardTitle className="font-display text-base text-navy flex items-center gap-2">
                <Search className="h-5 w-5" />
                Aperçu du tableau imprimable
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-navy text-white">
                    <th className="px-4 py-3 text-left font-bold w-12">N°</th>
                    <th className="px-4 py-3 text-left font-bold">Nom &amp; Prénom</th>
                    <th className="px-4 py-3 text-left font-bold">N° Membre</th>
                    <th className="px-4 py-3 text-left font-bold">Grade visé</th>
                    <th className="px-4 py-3 text-center font-bold w-24">Admis</th>
                    <th className="px-4 py-3 text-center font-bold w-24">Ajourné</th>
                    <th className="px-4 py-3 text-center font-bold w-24">Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, i) => (
                    <tr
                      key={c.memberId}
                      className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                    >
                      <td className="px-4 py-3 font-bold text-center text-navy">
                        {c.order}
                      </td>
                      <td className="px-4 py-3 font-semibold uppercase">
                        {c.lastName} {c.firstName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.memberNumber || '—'}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {c.gradeTarget || <span className="text-muted-foreground italic">Non défini</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">☐</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">☐</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">☐</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ══ Styles d'impression injectés dans le DOM ══ */}
      <style>{`
        @media print {
          /* Masquer tout sauf les blocs d'impression */
          body > * { visibility: hidden; }
          .print-passage-header,
          .print-passage-header *,
          .print-table,
          .print-table *,
          .print-signatures,
          .print-signatures * { visibility: visible; }

          .print-passage-header { position: fixed; top: 0; left: 0; right: 0; padding: 24px 32px 0; }

          .print-table {
            position: absolute;
            top: 220px;
            left: 32px;
            right: 32px;
            width: calc(100% - 64px);
            border-collapse: collapse;
            font-size: 11pt;
          }
          .print-table th {
            background: #1e3a5f !important;
            color: white !important;
            padding: 8px 10px;
            text-align: left;
            font-weight: 700;
            border: 1px solid #1e3a5f;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-table td {
            padding: 7px 10px;
            border: 1px solid #cbd5e1;
            vertical-align: middle;
          }
          .print-table tr:nth-child(even) td { background: #f8fafc; }

          .print-checkbox {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #334155;
            border-radius: 3px;
          }

          .print-signatures {
            position: fixed;
            bottom: 40px;
            left: 32px;
            right: 32px;
            display: flex;
            justify-content: space-between;
            gap: 60px;
          }
          .print-sig-box { flex: 1; }
          .print-sig-label {
            font-size: 10pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 40px;
            color: #334155;
          }
          .print-sig-line {
            border-top: 1.5px solid #334155;
            margin-top: 8px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
