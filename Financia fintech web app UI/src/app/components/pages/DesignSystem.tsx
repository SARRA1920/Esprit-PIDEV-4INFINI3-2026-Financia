import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';
import { Palette, Type, Layout, Circle } from 'lucide-react';

export function DesignSystem() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#0F2747] mb-2">Design System</h1>
        <p className="text-[#64748B]">Financia - Composants et styles</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-[#0F2747]" />
          <h2 className="text-2xl font-semibold text-[#0F2747]">Couleurs</h2>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#0F2747] mb-3">Couleurs principales</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Navy', hex: '#0F2747', desc: 'Primary' },
                { name: 'Gold', hex: '#F5B301', desc: 'Accent' },
                { name: 'Background', hex: '#F6F8FC', desc: 'Bg Light' },
                { name: 'Text', hex: '#0F172A', desc: 'Text Dark' },
              ].map((color) => (
                <div key={color.name} className="space-y-2">
                  <div
                    className="h-24 rounded-2xl shadow-sm border border-[#E2E8F0]"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#0F2747]">{color.name}</p>
                    <p className="text-xs text-[#64748B]">{color.hex}</p>
                    <p className="text-xs text-[#64748B]">{color.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#0F2747] mb-3">Couleurs de statut</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Pending', hex: '#F59E0B', desc: 'Amber' },
                { name: 'Paid', hex: '#10B981', desc: 'Emerald' },
                { name: 'Failed', hex: '#EF4444', desc: 'Red' },
                { name: 'Cancelled', hex: '#6B7280', desc: 'Gray' },
              ].map((color) => (
                <div key={color.name} className="space-y-2">
                  <div
                    className="h-24 rounded-2xl shadow-sm border border-[#E2E8F0]"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#0F2747]">{color.name}</p>
                    <p className="text-xs text-[#64748B]">{color.hex}</p>
                    <p className="text-xs text-[#64748B]">{color.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Type className="w-6 h-6 text-[#0F2747]" />
          <h2 className="text-2xl font-semibold text-[#0F2747]">Typographie</h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#F6F8FC]">
            <p className="text-xs text-[#64748B] mb-2">Font Family</p>
            <p className="text-2xl font-semibold text-[#0F2747]">Inter</p>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-[#E2E8F0]">
              <h1>Heading 1 - 3xl font-semibold</h1>
            </div>
            <div className="p-4 rounded-xl border border-[#E2E8F0]">
              <h2>Heading 2 - 2xl font-semibold</h2>
            </div>
            <div className="p-4 rounded-xl border border-[#E2E8F0]">
              <h3>Heading 3 - xl font-semibold</h3>
            </div>
            <div className="p-4 rounded-xl border border-[#E2E8F0]">
              <h4>Heading 4 - lg font-semibold</h4>
            </div>
            <div className="p-4 rounded-xl border border-[#E2E8F0]">
              <p>Body text - base font-normal</p>
            </div>
            <div className="p-4 rounded-xl border border-[#E2E8F0]">
              <p className="text-sm">Small text - sm font-normal</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Circle className="w-6 h-6 text-[#0F2747]" />
          <h2 className="text-2xl font-semibold text-[#0F2747]">Spacing & Radius</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-[#0F2747] mb-3">Système d'espacement (8px)</h3>
            <div className="space-y-3">
              {[
                { label: '1 unit', px: '8px', class: 'p-2' },
                { label: '2 units', px: '16px', class: 'p-4' },
                { label: '3 units', px: '24px', class: 'p-6' },
                { label: '4 units', px: '32px', class: 'p-8' },
              ].map((spacing) => (
                <div key={spacing.label} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-[#64748B]">{spacing.label} ({spacing.px})</div>
                  <div className={`bg-[#0F2747] ${spacing.class}`} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#0F2747] mb-3">Border Radius</h3>
            <div className="space-y-3">
              <div className="p-4 bg-[#F6F8FC] rounded-xl border border-[#E2E8F0]">
                <p className="text-sm text-[#64748B] mb-2">Standard: 16px (rounded-2xl)</p>
                <div className="h-12 bg-[#0F2747] rounded-2xl" />
              </div>
              <div className="p-4 bg-[#F6F8FC] rounded-xl border border-[#E2E8F0]">
                <p className="text-sm text-[#64748B] mb-2">Small: 12px (rounded-xl)</p>
                <div className="h-12 bg-[#0F2747] rounded-xl" />
              </div>
              <div className="p-4 bg-[#F6F8FC] rounded-xl border border-[#E2E8F0]">
                <p className="text-sm text-[#64748B] mb-2">Pills: full (rounded-full)</p>
                <div className="h-12 bg-[#0F2747] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Layout className="w-6 h-6 text-[#0F2747]" />
          <h2 className="text-2xl font-semibold text-[#0F2747]">Composants</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-[#0F2747] mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#0F2747] mb-4">Status Pills</h3>
            <div className="flex flex-wrap gap-3">
              <StatusPill status="PENDING" />
              <StatusPill status="PAID" />
              <StatusPill status="FAILED" />
              <StatusPill status="CANCELLED" />
              <StatusPill status="ACTIVE" />
              <StatusPill status="OVERDUE" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#0F2747] mb-4">Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card padding="sm">
                <h4 className="font-semibold text-[#0F2747] mb-2">Small Padding</h4>
                <p className="text-sm text-[#64748B]">Card with p-4 padding</p>
              </Card>
              <Card padding="md">
                <h4 className="font-semibold text-[#0F2747] mb-2">Medium Padding</h4>
                <p className="text-sm text-[#64748B]">Card with p-6 padding (default)</p>
              </Card>
              <Card padding="lg">
                <h4 className="font-semibold text-[#0F2747] mb-2">Large Padding</h4>
                <p className="text-sm text-[#64748B]">Card with p-8 padding</p>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#0F2747] mb-4">Shadows</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-white shadow-sm border border-[#E2E8F0]">
                <p className="text-sm font-medium text-[#0F2747]">Shadow SM</p>
                <p className="text-xs text-[#64748B]">Subtle shadow</p>
              </div>
              <div className="p-6 rounded-2xl bg-white shadow-md">
                <p className="text-sm font-medium text-[#0F2747]">Shadow MD</p>
                <p className="text-xs text-[#64748B]">Medium shadow</p>
              </div>
              <div className="p-6 rounded-2xl bg-white shadow-lg">
                <p className="text-sm font-medium text-[#0F2747]">Shadow LG</p>
                <p className="text-xs text-[#64748B]">Large shadow</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-semibold text-[#0F2747] mb-4">Principes de design</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl border-l-4 border-[#0F2747] bg-[#F6F8FC]">
            <h4 className="font-semibold text-[#0F2747] mb-1">Confiance & Clarté</h4>
            <p className="text-sm text-[#64748B]">Design épuré avec contraste élevé pour une lecture optimale</p>
          </div>
          <div className="p-4 rounded-xl border-l-4 border-[#F5B301] bg-[#FFFBF0]">
            <h4 className="font-semibold text-[#0F2747] mb-1">Cohérence</h4>
            <p className="text-sm text-[#64748B]">Système de 8px pour tous les espacements, radius de 16px standard</p>
          </div>
          <div className="p-4 rounded-xl border-l-4 border-[#10B981] bg-[#F0FDF4]">
            <h4 className="font-semibold text-[#0F2747] mb-1">Accessibilité</h4>
            <p className="text-sm text-[#64748B]">Contraste élevé, états de focus visibles, hiérarchie typographique claire</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
