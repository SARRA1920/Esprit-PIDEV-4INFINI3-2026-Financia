import { useState } from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { Search, Plus, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';

const courses = [
  {
    id: 'FORM-018',
    title: 'Gestion de budget personnel',
    lessons: 8,
    enrolled: 124,
    visibility: 'ACTIVE',
    created: '2024-01-15',
    lastUpdated: '2024-01-18',
  },
  {
    id: 'FORM-017',
    title: 'Comprendre le crédit immobilier',
    lessons: 12,
    enrolled: 89,
    visibility: 'ACTIVE',
    created: '2024-01-10',
    lastUpdated: '2024-01-16',
  },
  {
    id: 'FORM-016',
    title: 'Optimiser son épargne',
    lessons: 6,
    enrolled: 156,
    visibility: 'ACTIVE',
    created: '2024-01-05',
    lastUpdated: '2024-01-12',
  },
  {
    id: 'FORM-015',
    title: 'Introduction aux investissements',
    lessons: 15,
    enrolled: 67,
    visibility: 'PENDING',
    created: '2024-01-20',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'FORM-014',
    title: 'Sécurité financière en ligne',
    lessons: 5,
    enrolled: 98,
    visibility: 'ACTIVE',
    created: '2023-12-28',
    lastUpdated: '2024-01-08',
  },
];

const tabs = ['Courses', 'Lessons', 'Enrollments'];

export function AdminFormation() {
  const [activeTab, setActiveTab] = useState('Courses');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#F8FAFC] tracking-tight mb-1">Formation (LMS)</h1>
          <p className="text-sm text-[#94A3B8]">Gestion des cours et contenus pédagogiques</p>
        </div>
        <button className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors flex items-center gap-2 text-sm font-medium">
          <Plus className="w-4 h-4" />
          Créer un cours
        </button>
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-[#334155]">
        <div className="border-b border-[#334155]">
          <div className="flex items-center gap-4 px-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-[#10B981] text-[#10B981]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              className="w-full max-w-md bg-[#111827] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#111827] sticky top-0">
              <tr>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">ID</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Titre</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Leçons</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Inscrits</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Visibilité</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Créé le</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Mis à jour</th>
                <th className="text-right text-xs font-medium text-[#94A3B8] px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-[#273549] transition-colors">
                  <td className="px-6 py-4 text-sm text-[#F8FAFC] font-mono">{course.id}</td>
                  <td className="px-6 py-4 text-sm text-[#F8FAFC] font-medium">{course.title}</td>
                  <td className="px-6 py-4 text-sm text-[#94A3B8] tabular-nums">{course.lessons}</td>
                  <td className="px-6 py-4 text-sm text-[#94A3B8] tabular-nums">{course.enrolled}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={course.visibility as any} />
                  </td>
                  <td className="px-6 py-4 text-sm text-[#94A3B8] font-mono tabular-nums">{course.created}</td>
                  <td className="px-6 py-4 text-sm text-[#94A3B8] font-mono tabular-nums">{course.lastUpdated}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors" title="Voir">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors" title="Éditer">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#EF4444] transition-colors" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
