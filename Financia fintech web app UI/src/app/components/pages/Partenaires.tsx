import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Handshake, Building2, Shield, GraduationCap, Settings, ArrowRight, Star, Gift } from 'lucide-react';

type CategoryType = 'ALL' | 'BANKS' | 'INSURANCE' | 'EDUCATION' | 'SERVICES';

export function Partenaires() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('ALL');

  const categories: { value: CategoryType; label: string; icon: typeof Building2 }[] = [
    { value: 'ALL', label: 'Tous', icon: Handshake },
    { value: 'BANKS', label: 'Banques', icon: Building2 },
    { value: 'INSURANCE', label: 'Assurances', icon: Shield },
    { value: 'EDUCATION', label: 'Éducation', icon: GraduationCap },
    { value: 'SERVICES', label: 'Services', icon: Settings },
  ];

  const partners = [
    {
      name: 'BNP Paribas',
      category: 'BANKS' as CategoryType,
      description: 'Solutions bancaires et de crédit adaptées à vos besoins',
      rating: 4.7,
      offer: 'Taux préférentiel -0.5%',
      color: 'from-green-500 to-green-600',
      hasOffer: true
    },
    {
      name: 'Crédit Agricole',
      category: 'BANKS' as CategoryType,
      description: 'Expertise en financement immobilier et crédit professionnel',
      rating: 4.8,
      offer: 'Frais de dossier offerts',
      color: 'from-emerald-500 to-emerald-600',
      hasOffer: true
    },
    {
      name: 'AXA Assurances',
      category: 'INSURANCE' as CategoryType,
      description: 'Protection complète pour vos crédits et investissements',
      rating: 4.6,
      offer: '3 mois offerts',
      color: 'from-blue-500 to-blue-600',
      hasOffer: true
    },
    {
      name: 'Allianz',
      category: 'INSURANCE' as CategoryType,
      description: 'Assurance emprunteur et protection financière',
      rating: 4.5,
      offer: null,
      color: 'from-indigo-500 to-indigo-600',
      hasOffer: false
    },
    {
      name: 'Finance Academy',
      category: 'EDUCATION' as CategoryType,
      description: 'Formations certifiées en gestion financière',
      rating: 4.9,
      offer: '20% de réduction',
      color: 'from-purple-500 to-purple-600',
      hasOffer: true
    },
    {
      name: 'Expert Comptable Pro',
      category: 'SERVICES' as CategoryType,
      description: 'Conseil fiscal et optimisation patrimoniale',
      rating: 4.7,
      offer: 'Consultation gratuite',
      color: 'from-amber-500 to-amber-600',
      hasOffer: true
    },
    {
      name: 'Stripe',
      category: 'SERVICES' as CategoryType,
      description: 'Solutions de paiement en ligne sécurisées',
      rating: 4.8,
      offer: null,
      color: 'from-violet-500 to-violet-600',
      hasOffer: false
    },
    {
      name: 'Finance Conseil',
      category: 'SERVICES' as CategoryType,
      description: 'Accompagnement personnalisé en gestion de patrimoine',
      rating: 4.9,
      offer: 'Audit gratuit',
      color: 'from-cyan-500 to-cyan-600',
      hasOffer: true
    },
  ];

  const filteredPartners = activeCategory === 'ALL'
    ? partners
    : partners.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#0F2747] mb-2">Partenaires</h1>
        <p className="text-[#64748B]">Découvrez nos partenaires de confiance</p>
      </div>

      <Card className="bg-gradient-to-br from-[#0F2747] to-[#1a3a5f] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5B301] opacity-10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#F5B301] flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Offres exclusives</h2>
              <p className="text-white/70">Profitez d'avantages réservés aux membres Financia</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <p className="text-sm text-white/70 mb-1">Partenaires actifs</p>
              <p className="text-2xl font-semibold">{partners.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <p className="text-sm text-white/70 mb-1">Offres disponibles</p>
              <p className="text-2xl font-semibold">{partners.filter(p => p.hasOffer).length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <p className="text-sm text-white/70 mb-1">Catégories</p>
              <p className="text-2xl font-semibold">{categories.length - 1}</p>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setActiveCategory(category.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.value
                  ? 'bg-[#0F2747] text-white shadow-sm'
                  : 'bg-[#F6F8FC] text-[#64748B] hover:bg-[#E2E8F0]'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner, idx) => (
            <Card key={idx} hover className="cursor-pointer group relative overflow-hidden">
              {partner.hasOffer && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-[#F5B301] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                    <Gift className="w-3 h-3" />
                    Offre
                  </div>
                </div>
              )}
              <div className={`h-32 rounded-2xl bg-gradient-to-br ${partner.color} flex items-center justify-center mb-4`}>
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                  <Handshake className="w-8 h-8 text-[#0F2747]" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[#0F2747] mb-2 group-hover:text-[#F5B301] transition-colors">
                {partner.name}
              </h3>
              <p className="text-sm text-[#64748B] mb-4 line-clamp-2">{partner.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-[#F5B301]" />
                  <span className="text-sm font-medium text-[#0F2747]">{partner.rating}</span>
                </div>
                <span className="text-xs text-[#64748B]">•</span>
                <span className="text-xs px-2 py-1 rounded-full bg-[#F6F8FC] text-[#0F2747] font-medium">
                  {categories.find(c => c.value === partner.category)?.label}
                </span>
              </div>
              {partner.hasOffer && partner.offer && (
                <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[#FFFBF0] to-[#FFF7E0] border border-[#F5B301]/20">
                  <p className="text-sm font-medium text-[#0F2747] flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#F5B301]" />
                    {partner.offer}
                  </p>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full group-hover:border-[#F5B301] group-hover:bg-[#FFFBF0] group-hover:text-[#0F2747]">
                Découvrir <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {filteredPartners.length === 0 && (
        <Card className="text-center py-16">
          <p className="text-[#64748B]">Aucun partenaire trouvé pour cette catégorie</p>
        </Card>
      )}
    </div>
  );
}
