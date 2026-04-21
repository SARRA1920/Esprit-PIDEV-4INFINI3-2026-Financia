import { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { FuturisticButton } from '../ui/FuturisticButton';
import { GraduationCap, Clock, BarChart3, Star, Play, ChevronRight } from 'lucide-react';

type CategoryType = 'ALL' | 'BUDGET' | 'CREDIT' | 'SAVINGS' | 'INVESTMENT' | 'SECURITY';

export function FuturisticFormation() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('ALL');

  const categories: { value: CategoryType; label: string }[] = [
    { value: 'ALL', label: 'Tous' },
    { value: 'BUDGET', label: 'Budget' },
    { value: 'CREDIT', label: 'Crédit' },
    { value: 'SAVINGS', label: 'Épargne' },
    { value: 'INVESTMENT', label: 'Investissement' },
    { value: 'SECURITY', label: 'Sécurité' },
  ];

  const courses = [
    {
      title: 'Gérer son budget personnel',
      category: 'BUDGET' as CategoryType,
      duration: '2h 30min',
      level: 'Débutant',
      rating: 4.8,
      enrolled: 1243,
      color: 'from-blue-400 to-cyan-500',
      lessons: 8
    },
    {
      title: 'Comprendre le crédit immobilier',
      category: 'CREDIT' as CategoryType,
      duration: '3h 15min',
      level: 'Intermédiaire',
      rating: 4.9,
      enrolled: 856,
      color: 'from-purple-400 to-violet-500',
      lessons: 12
    },
    {
      title: 'Optimiser son épargne',
      category: 'SAVINGS' as CategoryType,
      duration: '1h 45min',
      level: 'Débutant',
      rating: 4.7,
      enrolled: 2104,
      color: 'from-emerald-400 to-green-500',
      lessons: 6
    },
    {
      title: 'Introduction à l\'investissement',
      category: 'INVESTMENT' as CategoryType,
      duration: '4h 00min',
      level: 'Avancé',
      rating: 4.9,
      enrolled: 673,
      color: 'from-amber-400 to-orange-500',
      lessons: 15
    },
    {
      title: 'Sécurité financière en ligne',
      category: 'SECURITY' as CategoryType,
      duration: '1h 30min',
      level: 'Débutant',
      rating: 4.6,
      enrolled: 1532,
      color: 'from-red-400 to-pink-500',
      lessons: 5
    },
    {
      title: 'Stratégies de remboursement',
      category: 'CREDIT' as CategoryType,
      duration: '2h 00min',
      level: 'Intermédiaire',
      rating: 4.8,
      enrolled: 945,
      color: 'from-indigo-400 to-purple-500',
      lessons: 7
    },
  ];

  const filteredCourses = activeCategory === 'ALL'
    ? courses
    : courses.filter(c => c.category === activeCategory);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#0B1220] mb-2 tracking-tight">Formation</h1>
        <p className="text-[#56627A]">Développez vos compétences financières</p>
      </div>

      <GlassCard glow className="relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(124, 92, 255, 0.6) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-[#0B1220] mb-3 tracking-tight">Masterclass: Investir intelligemment</h2>
            <p className="text-[#56627A] mb-4">
              Rejoignez notre formation exclusive avec des experts financiers certifiés.
              Apprenez les stratégies d'investissement utilisées par les professionnels.
            </p>
            <div className="flex items-center gap-4 text-sm text-[#56627A] mb-6">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                6h 30min
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                Avancé
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-amber-400" />
                4.9
              </span>
            </div>
            <FuturisticButton variant="gradient">
              <Play className="w-5 h-5" />
              Commencer maintenant
            </FuturisticButton>
          </div>
          <div className="w-full md:w-64 h-48 rounded-[20px] bg-gradient-to-br from-[#34D7FF]/20 to-[#7C5CFF]/20 flex items-center justify-center border border-[rgba(40,60,90,0.12)]">
            <GraduationCap className="w-24 h-24 text-[#34D7FF]/40" />
          </div>
        </div>
      </GlassCard>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-[#56627A]" />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setActiveCategory(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.value
                    ? 'bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] text-white shadow-[0_0_16px_rgba(52,215,255,0.3)]'
                    : 'bg-[rgba(255,255,255,0.5)] text-[#56627A] hover:bg-[rgba(52,215,255,0.1)] hover:text-[#0B1220] border border-[rgba(40,60,90,0.1)]'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => (
            <GlassCard key={idx} hover className="cursor-pointer group">
              <div
                className={`h-40 rounded-[18px] bg-gradient-to-br ${course.color} flex items-center justify-center mb-4 group-hover:scale-[1.02] transition-transform duration-300`}
                style={{ boxShadow: '0 4px 20px rgba(52, 215, 255, 0.15)' }}
              >
                <GraduationCap className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#0B1220] mb-2 group-hover:text-[#34D7FF] transition-colors">
                {course.title}
              </h3>
              <div className="flex items-center gap-3 text-sm text-[#56627A] mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
                <span>•</span>
                <span>{course.level}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-amber-400" />
                  <span className="text-sm font-medium text-[#0B1220]">{course.rating}</span>
                  <span className="text-xs text-[#56627A]">({course.enrolled})</span>
                </div>
                <span className="text-xs text-[#56627A]">{course.lessons} leçons</span>
              </div>
              <FuturisticButton variant="outline-glow" size="sm" className="w-full">
                Voir le cours <ChevronRight className="w-4 h-4" />
              </FuturisticButton>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
