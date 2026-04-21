import { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { FuturisticButton } from '../ui/FuturisticButton';
import { Handshake, Building2, Shield, GraduationCap, Settings, ArrowRight, Star, Gift, Zap } from 'lucide-react';

type CategoryType = 'ALL' | 'BANKS' | 'INSURANCE' | 'EDUCATION' | 'SERVICES';

export function FuturisticPartenaires() {
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
      color: 'from-green-400 to-emerald-500',
      hasOffer: true
    },
    {
      name: 'Crédit Agricole',
      category: 'BANKS' as CategoryType,
      description: 'Expertise en financement immobilier et crédit professionnel',
      rating: 4.8,
      offer: 'Frais de dossier offerts',
      color: 'from-emerald-400 to-green-500',
      hasOffer: true
    },
    {
      name: 'AXA Assurances',
      category: 'INSURANCE' as CategoryType,
      description: 'Protection complète pour vos crédits et investissements',
      rating: 4.6,
      offer: '3 mois offerts',
      color: 'from-blue-400 to-cyan-500',
      hasOffer: true
    },
    {
      name: 'Allianz',
      category: 'INSURANCE' as CategoryType,
      description: 'Assurance emprunteur et protection financière',
      rating: 4.5,
      offer: null,
      color: 'from-indigo-400 to-blue-500',
      hasOffer: false
    },
    {
      name: 'Finance Academy',
      category: 'EDUCATION' as CategoryType,
      description: 'Formations certifiées en gestion financière',
      rating: 4.9,
      offer: '20% de réduction',
      color: 'from-purple-400 to-violet-500',
      hasOffer: true
    },
    {
      name: 'Expert Comptable Pro',
      category: 'SERVICES' as CategoryType,
      description: 'Conseil fiscal et optimisation patrimoniale',
      rating: 4.7,
      offer: 'Consultation gratuite',
      color: 'from-amber-400 to-orange-500',
      hasOffer: true
    },
    {
      name: 'Stripe',
      category: 'SERVICES' as CategoryType,
      description: 'Solutions de paiement en ligne sécurisées',
      rating: 4.8,
      offer: null,
      color: 'from-violet-400 to-purple-500',
      hasOffer: false
    },
    {
      name: 'Finance Conseil',
      category: 'SERVICES' as CategoryType,
      description: 'Accompagnement personnalisé en gestion de patrimoine',
      rating: 4.9,
      offer: 'Audit gratuit',
      color: 'from-cyan-400 to-blue-500',
      hasOffer: true
    },
  ];

  const filteredPartners = activeCategory === 'ALL'
    ? partners
    : partners.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#0B1220] mb-2 tracking-tight">Partenaires</h1>
        <p className="text-[#56627A]">Découvrez nos partenaires de confiance</p>
      </div>

      <GlassCard glow className="relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(52, 215, 255, 0.6) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#34D7FF] to-[#7C5CFF] flex items-center justify-center"
              style={{ boxShadow: '0 0 20px rgba(52, 215, 255, 0.4)' }}
            >
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#0B1220] tracking-tight">Offres exclusives</h2>
              <p className="text-[#56627A]">Profitez d'avantages réservés aux membres Financia</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Partenaires actifs', value: partners.length },
              { label: 'Offres disponibles', value: partners.filter(p => p.hasOffer).length },
              { label: 'Catégories', value: categories.length - 1 },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-[16px] border border-[rgba(40,60,90,0.12)] backdrop-blur-sm"
                style={{ background: 'rgba(255, 255, 255, 0.5)' }}
              >
                <p className="text-sm text-[#56627A] mb-1">{stat.label}</p>
                <p className="text-2xl font-semibold text-[#0B1220] tabular-nums tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <div>
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setActiveCategory(category.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category.value
                  ? 'bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] text-white shadow-[0_0_16px_rgba(52,215,255,0.3)]'
                  : 'bg-[rgba(255,255,255,0.5)] text-[#56627A] hover:bg-[rgba(52,215,255,0.1)] hover:text-[#0B1220] border border-[rgba(40,60,90,0.1)]'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner, idx) => (
            <GlassCard key={idx} hover className="cursor-pointer group relative overflow-hidden">
              {partner.hasOffer && (
                <div className="absolute top-4 right-4 z-10">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                    style={{ boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)' }}
                  >
                    <Zap className="w-3 h-3" />
                    Offre
                  </div>
                </div>
              )}
              <div
                className={`h-32 rounded-[18px] bg-gradient-to-br ${partner.color} flex items-center justify-center mb-4 group-hover:scale-[1.02] transition-transform duration-300`}
                style={{ boxShadow: '0 4px 20px rgba(52, 215, 255, 0.15)' }}
              >
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                  <Handshake className="w-8 h-8 text-[#0B1220]" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[#0B1220] mb-2 group-hover:text-[#34D7FF] transition-colors">
                {partner.name}
              </h3>
              <p className="text-sm text-[#56627A] mb-4 line-clamp-2">{partner.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-amber-400" />
                  <span className="text-sm font-medium text-[#0B1220]">{partner.rating}</span>
                </div>
                <span className="text-xs text-[#56627A]">•</span>
                <span className="text-xs px-2 py-1 rounded-full bg-[rgba(52,215,255,0.1)] text-[#0B1220] font-medium">
                  {categories.find(c => c.value === partner.category)?.label}
                </span>
              </div>
              {partner.hasOffer && partner.offer && (
                <div
                  className="mb-4 p-3 rounded-[14px] border border-amber-400/20"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(251, 146, 60, 0.08) 100%)',
                  }}
                >
                  <p className="text-sm font-medium text-[#0B1220] flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-500" />
                    {partner.offer}
                  </p>
                </div>
              )}
              <FuturisticButton variant="outline-glow" size="sm" className="w-full">
                Découvrir <ArrowRight className="w-4 h-4" />
              </FuturisticButton>
            </GlassCard>
          ))}
        </div>
      </div>

      {filteredPartners.length === 0 && (
        <GlassCard className="text-center py-16">
          <p className="text-[#56627A]">Aucun partenaire trouvé pour cette catégorie</p>
        </GlassCard>
      )}
    </div>
  );
}
