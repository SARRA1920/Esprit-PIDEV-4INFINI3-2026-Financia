import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PiggyBank, Target, TrendingUp, Plus, ArrowRight } from 'lucide-react';

export function Savings() {
  const savingsAccounts = [
    {
      nom: 'Épargne vacances',
      montant: '3 500 €',
      objectif: '5 000 €',
      progression: 70,
      derniereOperation: '10 Avril 2026',
      color: 'from-blue-500 to-blue-600'
    },
    {
      nom: 'Épargne urgence',
      montant: '8 000 €',
      objectif: '10 000 €',
      progression: 80,
      derniereOperation: '05 Avril 2026',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      nom: 'Projet immobilier',
      montant: '950 €',
      objectif: '20 000 €',
      progression: 4.75,
      derniereOperation: '01 Avril 2026',
      color: 'from-purple-500 to-purple-600'
    },
  ];

  const totalSavings = savingsAccounts.reduce((sum, acc) => {
    const montant = parseFloat(acc.montant.replace(/[^\d]/g, ''));
    return sum + montant;
  }, 0);

  const totalObjectifs = savingsAccounts.reduce((sum, acc) => {
    const objectif = parseFloat(acc.objectif.replace(/[^\d]/g, ''));
    return sum + objectif;
  }, 0);

  const globalProgression = Math.round((totalSavings / totalObjectifs) * 100);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0F2747] mb-2">Savings</h1>
          <p className="text-[#64748B]">Gérez vos économies et objectifs</p>
        </div>
        <Button>
          <Plus className="w-5 h-5" />
          Ajouter une épargne
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-[#0F2747] to-[#1a3a5f] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#F5B301] opacity-10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Solde total</p>
                <p className="text-3xl font-semibold">{totalSavings.toLocaleString()} €</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">+5.2%</span>
              <span className="text-white/70">ce mois</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5B301] to-[#e6a700] flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[#64748B] text-sm">Objectifs globaux</p>
              <p className="text-3xl font-semibold text-[#0F2747]">{globalProgression}%</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#64748B]">Progression</span>
              <span className="text-[#0F2747] font-medium">{totalSavings.toLocaleString()} € / {totalObjectifs.toLocaleString()} €</span>
            </div>
            <div className="w-full bg-[#E2E8F0] rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#F5B301] to-[#e6a700] h-3 rounded-full transition-all duration-500"
                style={{ width: `${globalProgression}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#0F2747]">Mes comptes d'épargne</h3>
        {savingsAccounts.map((account, idx) => (
          <Card key={idx} hover className="cursor-pointer">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${account.color} flex items-center justify-center flex-shrink-0`}>
                  <PiggyBank className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-[#0F2747] mb-1">{account.nom}</h4>
                  <p className="text-sm text-[#64748B]">Dernière opération: {account.derniereOperation}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#64748B] flex-shrink-0" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-[#64748B] mb-1">Montant actuel</p>
                <p className="text-2xl font-semibold text-[#0F2747]">{account.montant}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] mb-1">Objectif</p>
                <p className="text-2xl font-semibold text-[#0F2747]">{account.objectif}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#64748B]">Progression</span>
                <span className="text-[#0F2747] font-medium">{account.progression.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                <div
                  className={`bg-gradient-to-r ${account.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${account.progression}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-[#0F2747] mb-4">Historique récent</h3>
        <div className="space-y-3">
          {[
            { date: '10 Avril 2026', compte: 'Épargne vacances', montant: '+200 €', type: 'deposit' },
            { date: '05 Avril 2026', compte: 'Épargne urgence', montant: '+500 €', type: 'deposit' },
            { date: '01 Avril 2026', compte: 'Projet immobilier', montant: '+150 €', type: 'deposit' },
          ].map((transaction, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F6F8FC] transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${transaction.type === 'deposit' ? 'bg-emerald-100' : 'bg-red-100'} flex items-center justify-center`}>
                  <TrendingUp className={`w-5 h-5 ${transaction.type === 'deposit' ? 'text-emerald-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F2747]">{transaction.compte}</p>
                  <p className="text-xs text-[#64748B]">{transaction.date}</p>
                </div>
              </div>
              <p className={`text-sm font-semibold ${transaction.type === 'deposit' ? 'text-emerald-600' : 'text-red-600'}`}>
                {transaction.montant}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
