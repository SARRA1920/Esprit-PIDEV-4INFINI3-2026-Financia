import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { GraduationCap, Clock, BarChart3, Star, Play, ChevronRight } from 'lucide-react';

type CategoryType = 'ALL' | 'BUDGET' | 'CREDIT' | 'SAVINGS' | 'INVESTMENT' | 'SECURITY';

export function Formation() {
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
      color: 'from-blue-500 to-blue-600',
      lessons: 8
    },
    {
      title: 'Comprendre le crédit immobilier',
      category: 'CREDIT' as CategoryType,
      duration: '3h 15min',
      level: 'Intermédiaire',
      rating: 4.9,
      enrolled: 856,
      color: 'from-purple-500 to-purple-600',
      lessons: 12
    },
    {
      title: 'Optimiser son épargne',
      category: 'SAVINGS' as CategoryType,
      duration: '1h 45min',
      level: 'Débutant',
      rating: 4.7,
      enrolled: 2104,
      color: 'from-emerald-500 to-emerald-600',
      lessons: 6
    },
    {
      title: 'Introduction à l\'investissement',
      category: 'INVESTMENT' as CategoryType,
      duration: '4h 00min',
      level: 'Avancé',
      rating: 4.9,
      enrolled: 673,
      color: 'from-amber-500 to-amber-600',
      lessons: 15
    },
    {
      title: 'Sécurité financière en ligne',
      category: 'SECURITY' as CategoryType,
      duration: '1h 30min',
      level: 'Débutant',
      rating: 4.6,
      enrolled: 1532,
      color: 'from-red-500 to-red-600',
      lessons: 5
    },
    {
      title: 'Stratégies de remboursement de crédit',
      category: 'CREDIT' as CategoryType,
      duration: '2h 00min',
      level: 'Intermédiaire',
      rating: 4.8,
      enrolled: 945,
      color: 'from-indigo-500 to-indigo-600',
      lessons: 7
    },
  ];

  const filteredCourses = activeCategory === 'ALL'
    ? courses
    : courses.filter(c => c.category === activeCategory);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#0F2747] mb-2">Formation</h1>
        <p className="text-[#64748B]">Développez vos compétences financières</p>
      </div>

      <Card className="bg-gradient-to-br from-[#0F2747] to-[#1a3a5f] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5B301] opacity-10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-3">Masterclass: Investir intelligemment</h2>
            <p className="text-white/80 mb-4">
              Rejoignez notre formation exclusive avec des experts financiers certifiés.
              Apprenez les stratégies d'investissement utilisées par les professionnels.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/70 mb-6">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                6h 30min
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                Avancé
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-[#F5B301]" />
                4.9
              </span>
            </div>
            <Button variant="secondary">
              <Play className="w-5 h-5" />
              Commencer maintenant
            </Button>
          </div>
          <div className="w-full md:w-64 h-48 rounded-2xl bg-white/10 flex items-center justify-center">
            <GraduationCap className="w-24 h-24 text-white/30" />
          </div>
        </div>
      </Card>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-[#64748B]" />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setActiveCategory(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.value
                    ? 'bg-[#0F2747] text-white shadow-sm'
                    : 'bg-[#F6F8FC] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => (
            <Card key={idx} hover className="cursor-pointer group">
              <div className={`h-40 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center mb-4`}>
                <GraduationCap className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F2747] mb-2 group-hover:text-[#F5B301] transition-colors">
                {course.title}
              </h3>
              <div className="flex items-center gap-3 text-sm text-[#64748B] mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
                <span>•</span>
                <span>{course.level}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-[#F5B301]" />
                  <span className="text-sm font-medium text-[#0F2747]">{course.rating}</span>
                  <span className="text-xs text-[#64748B]">({course.enrolled})</span>
                </div>
                <span className="text-xs text-[#64748B]">{course.lessons} leçons</span>
              </div>
              <Button variant="outline" size="sm" className="w-full group-hover:border-[#F5B301] group-hover:bg-[#FFFBF0] group-hover:text-[#0F2747]">
                Voir le cours <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
