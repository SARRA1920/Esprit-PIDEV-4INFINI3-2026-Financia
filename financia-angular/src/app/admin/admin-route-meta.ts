export type AdminCrumb = { label: string; link: string | null };

export type AdminRouteContext = {
  title: string;
  crumbs: AdminCrumb[];
};

/** Normalise l’URL (sans query) pour la correspondance des métadonnées. */
export function adminPathFromUrl(url: string): string {
  const path = url.split('?')[0].replace(/\/+$/, '');
  if (path === '' || path === '/admin') {
    return '/admin';
  }
  return path;
}

const HOME: AdminCrumb = { label: 'Admin', link: '/admin' };

const MAP: Record<string, AdminRouteContext> = {
  '/admin': {
    title: "Vue d'ensemble",
    crumbs: [HOME, { label: "Vue d'ensemble", link: null }],
  },
  '/admin/overview': {
    title: "Vue d'ensemble",
    crumbs: [HOME, { label: "Vue d'ensemble", link: null }],
  },
  '/admin/clients': {
    title: 'Utilisateurs',
    crumbs: [HOME, { label: 'Utilisateurs', link: null }],
  },
  '/admin/credits': {
    title: 'Crédits et dossiers',
    crumbs: [HOME, { label: 'Crédits et dossiers', link: null }],
  },
  '/admin/remboursements': {
    title: 'Remboursements',
    crumbs: [HOME, { label: 'Remboursements', link: null }],
  },
  '/admin/formation': {
    title: 'Formation (LMS)',
    crumbs: [HOME, { label: 'Formation (LMS)', link: null }],
  },
  '/admin/epargnes': {
    title: 'Épargnes et objectifs',
    crumbs: [HOME, { label: 'Épargnes et objectifs', link: null }],
  },
  '/admin/savings': {
    title: 'Outils épargne (technique)',
    crumbs: [HOME, { label: 'Épargne', link: '/admin/savings/stats' }, { label: 'Outils technique', link: null }],
  },
  '/admin/savings/stats': {
    title: 'Statistiques épargne',
    crumbs: [HOME, { label: 'Épargne', link: '/admin/savings/stats' }, { label: 'Statistiques', link: null }],
  },
  '/admin/savings/accounts': {
    title: 'Comptes épargne',
    crumbs: [HOME, { label: 'Épargne', link: '/admin/savings/stats' }, { label: 'Comptes', link: null }],
  },
  '/admin/savings/goals': {
    title: 'Objectifs épargne',
    crumbs: [HOME, { label: 'Épargne', link: '/admin/savings/stats' }, { label: 'Objectifs', link: null }],
  },
  '/admin/savings/transactions': {
    title: 'Transactions épargne',
    crumbs: [HOME, { label: 'Épargne', link: '/admin/savings/stats' }, { label: 'Transactions', link: null }],
  },
  '/admin/paiements': {
    title: 'Paiements / Stripe',
    crumbs: [HOME, { label: 'Paiements / Stripe', link: null }],
  },
  '/admin/settings': {
    title: 'Paramètres',
    crumbs: [HOME, { label: 'Paramètres', link: null }],
  },
  '/admin/audit': {
    title: 'Audit épargne',
    crumbs: [HOME, { label: 'Système', link: null }, { label: 'Audit épargne', link: null }],
  },
  '/admin/ui-kit': {
    title: 'UI Kit',
    crumbs: [HOME, { label: 'UI Kit', link: null }],
  },
};

export function getAdminRouteContext(url: string): AdminRouteContext {
  const path = adminPathFromUrl(url);
  const base = MAP[path];
  if (base) {
    return base;
  }
  return {
    title: 'Administration',
    crumbs: [HOME, { label: 'Page', link: null }],
  };
}
