import { GlassCard } from '../ui/GlassCard';
import { FuturisticButton } from '../ui/FuturisticButton';
import { FuturisticPill } from '../ui/FuturisticPill';
import { Palette, Type, Layout, Circle, Sparkles } from 'lucide-react';

export function FuturisticDesignSystem() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#0B1220] mb-2 tracking-tight">Design System</h1>
        <p className="text-[#56627A]">Financia - Futuristic Light Theme</p>
      </div>

      <GlassCard glow>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#34D7FF] to-[#7C5CFF] flex items-center justify-center"
            style={{ boxShadow: '0 0 16px rgba(52, 215, 255, 0.3)' }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[#0B1220] tracking-tight">Neo-Futuristic Aesthetic</h2>
            <p className="text-[#56627A]">Glassmorphism + Neon Accents + Clean Typography</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-[#34D7FF]" />
          <h2 className="text-2xl font-semibold text-[#0B1220] tracking-tight">Couleurs</h2>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#0B1220] mb-3">Palette principale</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Background', hex: '#F7FAFF', desc: 'Near-white base' },
                { name: 'Cyan Accent', hex: '#34D7FF', desc: 'Primary glow' },
                { name: 'Violet Accent', hex: '#7C5CFF', desc: 'Secondary glow' },
                { name: 'Text Primary', hex: '#0B1220', desc: 'Dark text' },
              ].map((color) => (
                <div key={color.name} className="space-y-2">
                  <div
                    className="h-24 rounded-[18px] shadow-sm border border-[rgba(40,60,90,0.12)]"
                    style={{
                      backgroundColor: color.hex,
                      boxShadow: color.name.includes('Accent') ? `0 0 20px ${color.hex}40` : undefined
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#0B1220]">{color.name}</p>
                    <p className="text-xs text-[#56627A]">{color.hex}</p>
                    <p className="text-xs text-[#56627A]">{color.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#0B1220] mb-3">Glass Surface</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-[18px] border border-[rgba(40,60,90,0.12)] backdrop-blur-[14px]" style={{ background: 'rgba(255, 255, 255, 0.65)' }}>
                <p className="text-sm font-medium text-[#0B1220] mb-1">Glass Surface</p>
                <p className="text-xs text-[#56627A]">rgba(255, 255, 255, 0.65)</p>
                <p className="text-xs text-[#56627A]">backdrop-blur: 14px</p>
              </div>
              <div className="p-6 rounded-[18px] border border-[rgba(52,215,255,0.3)]" style={{
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(14px)',
                boxShadow: '0 0 20px rgba(52, 215, 255, 0.15)'
              }}>
                <p className="text-sm font-medium text-[#0B1220] mb-1">Glass with Glow</p>
                <p className="text-xs text-[#56627A]">border: cyan with opacity</p>
                <p className="text-xs text-[#56627A]">shadow: cyan glow</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#0B1220] mb-3">Status Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Success', hex: '#22C55E' },
                { name: 'Warning', hex: '#F59E0B' },
                { name: 'Danger', hex: '#EF4444' },
                { name: 'Info', hex: '#34D7FF' },
              ].map((color) => (
                <div key={color.name} className="space-y-2">
                  <div
                    className="h-24 rounded-[18px] shadow-sm"
                    style={{
                      backgroundColor: color.hex,
                      boxShadow: `0 0 16px ${color.hex}30`
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#0B1220]">{color.name}</p>
                    <p className="text-xs text-[#56627A]">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#0B1220] mb-3">Gradients</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-[18px] bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF]" style={{ boxShadow: '0 0 24px rgba(52, 215, 255, 0.3)' }}>
                <p className="text-sm font-medium text-white mb-1">Primary Gradient</p>
                <p className="text-xs text-white/80">Cyan → Violet</p>
              </div>
              <div className="p-6 rounded-[18px]" style={{
                background: 'radial-gradient(circle at 30% 50%, rgba(52, 215, 255, 0.1) 0%, transparent 50%)',
                border: '1px solid rgba(40,60,90,0.12)'
              }}>
                <p className="text-sm font-medium text-[#0B1220] mb-1">Subtle Background</p>
                <p className="text-xs text-[#56627A]">Radial gradient, 8-10% opacity</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Type className="w-6 h-6 text-[#34D7FF]" />
          <h2 className="text-2xl font-semibold text-[#0B1220] tracking-tight">Typographie</h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-[16px] border border-[rgba(40,60,90,0.12)] backdrop-blur-sm" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
            <p className="text-xs text-[#56627A] mb-2">Font Family</p>
            <p className="text-2xl font-semibold text-[#0B1220] tracking-tight">Inter / SF Pro / Manrope</p>
            <p className="text-xs text-[#56627A] mt-1">Tight letter spacing for headings, tabular figures for numbers</p>
          </div>
          <div className="space-y-3">
            {[
              { tag: 'h1', text: 'Heading 1 - 3xl font-semibold tracking-tight' },
              { tag: 'h2', text: 'Heading 2 - 2xl font-semibold tracking-tight' },
              { tag: 'h3', text: 'Heading 3 - xl font-semibold' },
              { tag: 'p', text: 'Body text - base font-normal' },
              { tag: 'small', text: 'Small text - sm font-normal' },
            ].map((item) => (
              <div key={item.tag} className="p-4 rounded-[16px] border border-[rgba(40,60,90,0.12)]">
                {item.tag === 'h1' && <h1>{item.text}</h1>}
                {item.tag === 'h2' && <h2>{item.text}</h2>}
                {item.tag === 'h3' && <h3>{item.text}</h3>}
                {item.tag === 'p' && <p>{item.text}</p>}
                {item.tag === 'small' && <p className="text-sm">{item.text}</p>}
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Circle className="w-6 h-6 text-[#34D7FF]" />
          <h2 className="text-2xl font-semibold text-[#0B1220] tracking-tight">Spacing & Radius</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-[#0B1220] mb-3">Spacing System</h3>
            <p className="text-sm text-[#56627A] mb-4">Spacious layout with generous padding</p>
            <div className="space-y-3">
              {[
                { label: 'Small', px: '16px', class: 'p-4' },
                { label: 'Medium', px: '24px', class: 'p-6' },
                { label: 'Large', px: '32px', class: 'p-8' },
              ].map((spacing) => (
                <div key={spacing.label} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-[#56627A]">{spacing.label} ({spacing.px})</div>
                  <div className={`bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] rounded-[12px] ${spacing.class}`} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#0B1220] mb-3">Border Radius (18-22px)</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-[16px] border border-[rgba(40,60,90,0.12)] backdrop-blur-sm" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
                <p className="text-sm text-[#56627A] mb-2">Standard: 18px (rounded-[18px])</p>
                <div className="h-12 bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] rounded-[18px]" />
              </div>
              <div className="p-4 rounded-[16px] border border-[rgba(40,60,90,0.12)] backdrop-blur-sm" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
                <p className="text-sm text-[#56627A] mb-2">Large: 20px (rounded-[20px])</p>
                <div className="h-12 bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] rounded-[20px]" />
              </div>
              <div className="p-4 rounded-[16px] border border-[rgba(40,60,90,0.12)] backdrop-blur-sm" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
                <p className="text-sm text-[#56627A] mb-2">Pills: full (rounded-full)</p>
                <div className="h-12 bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Layout className="w-6 h-6 text-[#34D7FF]" />
          <h2 className="text-2xl font-semibold text-[#0B1220] tracking-tight">Composants</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-[#0B1220] mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              <FuturisticButton variant="gradient">Gradient Button</FuturisticButton>
              <FuturisticButton variant="outline-glow">Outline Glow</FuturisticButton>
              <FuturisticButton variant="ghost">Ghost Button</FuturisticButton>
            </div>
            <div className="flex flex-wrap gap-3">
              <FuturisticButton variant="gradient" size="sm">Small</FuturisticButton>
              <FuturisticButton variant="gradient" size="md">Medium</FuturisticButton>
              <FuturisticButton variant="gradient" size="lg">Large</FuturisticButton>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#0B1220] mb-4">Status Pills</h3>
            <div className="flex flex-wrap gap-3">
              <FuturisticPill status="PENDING" />
              <FuturisticPill status="PAID" />
              <FuturisticPill status="FAILED" />
              <FuturisticPill status="CANCELLED" />
              <FuturisticPill status="ACTIVE" />
              <FuturisticPill status="OVERDUE" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#0B1220] mb-4">Glass Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard padding="sm">
                <h4 className="font-semibold text-[#0B1220] mb-2">Small Padding</h4>
                <p className="text-sm text-[#56627A]">Glass card with p-4</p>
              </GlassCard>
              <GlassCard padding="md">
                <h4 className="font-semibold text-[#0B1220] mb-2">Medium Padding</h4>
                <p className="text-sm text-[#56627A]">Glass card with p-6 (default)</p>
              </GlassCard>
              <GlassCard padding="lg" glow>
                <h4 className="font-semibold text-[#0B1220] mb-2">Large + Glow</h4>
                <p className="text-sm text-[#56627A]">Glass card with p-8 and cyan glow</p>
              </GlassCard>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-2xl font-semibold text-[#0B1220] mb-4 tracking-tight">Principes de design</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-[16px] border-l-4 border-[#34D7FF]" style={{ background: 'rgba(52, 215, 255, 0.08)' }}>
            <h4 className="font-semibold text-[#0B1220] mb-1">Glassmorphism</h4>
            <p className="text-sm text-[#56627A]">Translucent surfaces with backdrop blur (14-18px) for depth</p>
          </div>
          <div className="p-4 rounded-[16px] border-l-4 border-[#7C5CFF]" style={{ background: 'rgba(124, 92, 255, 0.08)' }}>
            <h4 className="font-semibold text-[#0B1220] mb-1">Neon Accents</h4>
            <p className="text-sm text-[#56627A]">Cyan + violet glows used sparingly for CTAs and active states</p>
          </div>
          <div className="p-4 rounded-[16px] border-l-4 border-[#22C55E]" style={{ background: 'rgba(34, 197, 94, 0.08)' }}>
            <h4 className="font-semibold text-[#0B1220] mb-1">Smooth Transitions</h4>
            <p className="text-sm text-[#56627A]">300ms transitions, hover glows, and scale effects for interactivity</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
