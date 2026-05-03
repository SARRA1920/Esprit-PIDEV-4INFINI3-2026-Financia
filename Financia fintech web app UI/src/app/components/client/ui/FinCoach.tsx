import { useState } from 'react';
import { Sparkles, MessageCircle, TrendingUp, Target, Lightbulb } from 'lucide-react';

interface FinCoachProps {
  greeting?: string;
  messages?: Array<{
    type: 'greeting' | 'insight' | 'recommendation' | 'celebration';
    text: string;
  }>;
  onAskAdvice?: () => void;
}

export function FinCoach({
  greeting = "Bonjour ! Je suis votre coach épargne IA.",
  messages = [],
  onAskAdvice
}: FinCoachProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMessage, setActiveMessage] = useState(0);

  const defaultMessages = messages.length > 0 ? messages : [
    { type: 'greeting' as const, text: greeting },
    { type: 'insight' as const, text: "Vous êtes sur la bonne voie ! Votre régularité d'épargne s'améliore." },
    { type: 'recommendation' as const, text: "Astuce : un virement automatique le 5 du mois optimiserait vos intérêts." },
  ];

  const messageIcons = {
    greeting: MessageCircle,
    insight: TrendingUp,
    recommendation: Lightbulb,
    celebration: Sparkles,
  };

  const currentMessage = defaultMessages[activeMessage];
  const Icon = messageIcons[currentMessage.type];

  return (
    <div className="relative">
      {/* Coach Avatar */}
      <div className="flex items-start gap-4">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#34D7FF] via-[#7C5CFF] to-[#EAB308] p-1 shadow-lg"
            style={{
              boxShadow: '0 0 30px rgba(52, 215, 255, 0.4)',
            }}
          >
            <div className="w-full h-full rounded-full bg-[#0B1220] flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-[#34D7FF]" />
            </div>
          </div>
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#34D7FF] to-[#7C5CFF] opacity-40 animate-ping" />
          {/* Status indicator */}
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#F7FAFF]" />
        </div>

        {/* Speech Bubble */}
        <div className="flex-1">
          <div className="relative bg-white rounded-[20px] border border-[rgba(40,60,90,0.12)] p-5 shadow-md">
            {/* Bubble tail */}
            <div className="absolute left-0 top-6 -translate-x-2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-white" />
            <div className="absolute left-0 top-6 -translate-x-3 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-r-[14px] border-r-[rgba(40,60,90,0.12)]" />

            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#34D7FF]/20 to-[#7C5CFF]/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-[#34D7FF]" />
              </div>
              <div className="flex-1">
                <p className="text-[#0B1220] font-medium leading-relaxed">
                  {currentMessage.text}
                </p>
              </div>
            </div>

            {/* Message navigation */}
            {defaultMessages.length > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-[rgba(40,60,90,0.08)]">
                <div className="flex gap-1">
                  {defaultMessages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMessage(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === activeMessage
                          ? 'bg-[#34D7FF] w-6'
                          : 'bg-[#E2E8F0] hover:bg-[#CBD5E1]'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setActiveMessage((prev) => (prev + 1) % defaultMessages.length)}
                  className="text-xs text-[#34D7FF] hover:text-[#7C5CFF] font-medium"
                >
                  Message suivant →
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[rgba(40,60,90,0.08)]">
              <button
                onClick={onAskAdvice}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] text-white hover:shadow-[0_0_16px_rgba(52,215,255,0.4)] transition-all"
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                Demander un conseil
              </button>
              <button className="px-3 py-1.5 rounded-full text-xs font-medium border border-[#E2E8F0] text-[#0B1220] hover:border-[#34D7FF] hover:bg-[rgba(52,215,255,0.05)] transition-all">
                <Target className="w-3 h-3 inline mr-1" />
                Voir mes objectifs
              </button>
            </div>
          </div>

          {/* Coach name */}
          <div className="mt-2 ml-3">
            <p className="text-xs font-medium text-[#0B1220]">FinCoach IA</p>
            <p className="text-xs text-[#56627A]">Assistant épargne personnalisé</p>
          </div>
        </div>
      </div>
    </div>
  );
}
