import { Routes } from '@angular/router';
import { clientGuard } from './guards/client.guard';
import { adminGuard } from './guards/admin.guard';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { EspaceClientComponent } from './pages/espace-client/espace-client.component';
import { ServicesComponent } from './pages/services/services.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AboutComponent } from './pages/about/about.component';
import { FormationComponent } from './pages/formation/formation.component';
import { FormationCourseDetailComponent } from './pages/formation/formation-course-detail/formation-course-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  {
    path: 'services/epargneobjectif',
    loadComponent: () =>
      import('./pages/redirect-epargne-front.component').then((m) => m.RedirectEpargneFrontComponent),
  },
  { path: 'formation/course/:id', component: FormationCourseDetailComponent },
  { path: 'formation', component: FormationComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'espace-client',
    component: EspaceClientComponent,
    canActivate: [clientGuard],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin/admin-overview.component').then((m) => m.AdminOverviewComponent),
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./admin/admin-overview.component').then((m) => m.AdminOverviewComponent),
      },
      {
        path: 'credits',
        loadComponent: () =>
          import('./admin/admin-credits.component').then((m) => m.AdminCreditsComponent),
      },
      {
        path: 'formation',
        loadComponent: () =>
          import('./admin/admin-formation.component').then((m) => m.AdminFormationComponent),
      },
      {
        path: 'epargnes',
        loadComponent: () =>
          import('./admin/pages/admin-savings/admin-savings.component').then((m) => m.AdminSavingsComponent),
      },
      {
        path: 'savings',
        loadComponent: () =>
          import('./admin/savings-crud.component').then((m) => m.SavingsCrudComponent),
      },
      {
        path: 'savings/stats',
        loadComponent: () =>
          import('./admin/admin-dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'savings/accounts',
        loadComponent: () =>
          import('./admin/savings-account-list/savings-account-list.component').then(
            (m) => m.SavingsAccountListComponent
          ),
      },
      {
        path: 'savings/goals',
        loadComponent: () =>
          import('./admin/savings-goal-list/savings-goal-list.component').then((m) => m.SavingsGoalListComponent),
      },
      {
        path: 'savings/transactions',
        loadComponent: () =>
          import('./admin/savings-transaction-list/savings-transaction-list.component').then(
            (m) => m.SavingsTransactionListComponent
          ),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./admin/admin-users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'remboursements',
        data: { title: 'Remboursements' },
        loadComponent: () =>
          import('./admin/admin-placeholder.component').then((m) => m.AdminPlaceholderComponent),
      },
      {
        path: 'paiements',
        data: { title: 'Paiements / Stripe' },
        loadComponent: () =>
          import('./admin/admin-placeholder.component').then((m) => m.AdminPlaceholderComponent),
      },
      {
        path: 'settings',
        data: { title: 'Paramètres' },
        loadComponent: () =>
          import('./admin/admin-placeholder.component').then((m) => m.AdminPlaceholderComponent),
      },
      {
        path: 'audit',
        data: { title: 'Audit épargne' },
        loadComponent: () =>
          import('./admin/pages/admin-savings-audit/admin-savings-audit.component').then(
            (m) => m.AdminSavingsAuditComponent
          ),
      },
      {
        path: 'ui-kit',
        data: { title: 'UI Kit' },
        loadComponent: () =>
          import('./admin/admin-placeholder.component').then((m) => m.AdminPlaceholderComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
