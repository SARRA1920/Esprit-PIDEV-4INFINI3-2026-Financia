import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';
import { CreditCard, Calendar, PiggyBank, FileText, Plus, ArrowRight, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const kpis = [
    { label: 'Crédit actif', value: '45 000 €', sublabel: 'Restant à payer', icon: CreditCard, color: 'from-blue-500 to-blue-600' },
    { label: 'Prochaine échéance', value: '850 €', sublabel: '15 Mai 2026', icon: Calendar, color: 'from-amber-500 to-amber-600' },
    { label: 'Total épargne', value: '12 450 €', sublabel: '+5.2% ce mois', icon: PiggyBank, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Contrats actifs', value: '3', sublabel: '1 en cours de signature', icon: FileText, color: 'from-purple-500 to-purple-600' },
  ];

  const quickActions = [
    { label: 'Demander un crédit', icon: CreditCard },
    { label: 'Payer une échéance', icon: Calendar },
    { label: 'Ajouter une épargne', icon: Plus },
    { label: 'Créer un contrat', icon: FileText },
  ];

  const upcomingPayments = [
    { date: '15 Mai 2026', amount: '850 €', status: 'PENDING' as const, label: 'Échéance Crédit Auto' },
    { date: '22 Mai 2026', amount: '1 200 €', status: 'PENDING' as const, label: 'Échéance Crédit Immobilier' },
    { date: '28 Mai 2026', amount: '450 €', status: 'PENDING' as const, label: 'Échéance Crédit Personnel' },
  ];

  const newsItems = [
    { title: 'Nouveau taux préférentiel', subtitle: 'Crédit immobilier à partir de 2.5%', category: 'Actualité' },
    { title: 'Formation: Gestion de budget', subtitle: 'Masterclass avec experts financiers', category: 'Formation' },
    { title: 'Programme de fidélité', subtitle: 'Cumulez des points sur vos remboursements', category: 'Avantage' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#0F2747] mb-2">Dashboard</h1>
        <p className="text-[#64748B]">Bienvenue sur votre espace Financia</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-[#64748B] mb-1">{kpi.label}</p>
                <p className="text-2xl font-semibold text-[#0F2747]">{kpi.value}</p>
                <p className="text-xs text-[#64748B] mt-1">{kpi.sublabel}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-20" style={{ backgroundImage: `linear-gradient(to right, ${kpi.color})` }} />
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-[#0F2747] mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-3 p-4 rounded-2xl border-2 border-[#E2E8F0] hover:border-[#F5B301] hover:bg-[#FFFBF0] transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F6F8FC] group-hover:bg-[#F5B301] flex items-center justify-center transition-colors">
                <action.icon className="w-5 h-5 text-[#0F2747] group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-[#0F2747]">{action.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#0F2747]">Échéances à venir</h3>
            <Button variant="ghost" size="sm">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingPayments.map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F6F8FC] transition-all">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0F2747] mb-1">{payment.label}</p>
                  <p className="text-xs text-[#64748B]">{payment.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-[#0F2747]">{payment.amount}</p>
                  <StatusPill status={payment.status} label="À payer" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#0F2747]">Actualités & Formations</h3>
          </div>
          <div className="space-y-3">
            {newsItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F6F8FC] transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5B301] to-[#e6a700] flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#F5B301] bg-opacity-20 text-[#0F2747] font-medium">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#0F2747] mb-0.5 group-hover:text-[#F5B301] transition-colors">{item.title}</p>
                  <p className="text-xs text-[#64748B]">{item.subtitle}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#F5B301] transition-colors flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
