import { Routes } from '@angular/router';
import { clientGuard } from './guards/client.guard';
import { adminGuard } from './guards/admin.guard';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { RegisterComponent } from './pages/register/register.component';
import { EspaceClientComponent } from './pages/espace-client/espace-client.component';
import { ServicesComponent } from './pages/services/services.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AboutComponent } from './pages/about/about.component';
import { FormationComponent } from './pages/formation/formation.component';
import { FormationCourseDetailComponent } from './pages/formation/formation-course-detail/formation-course-detail.component';
import { MesRemboursementsComponent } from './pages/mes-remboursements/mes-remboursements.component';
import { mesRemboursementsAccessGuard } from './guards/mes-remboursements-access.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  {
    path: 'mes-remboursements',
    component: MesRemboursementsComponent,
    canActivate: [mesRemboursementsAccessGuard],
    data: { title: 'Mes remboursements' },
  },
  { path: 'formation/course/:id', component: FormationCourseDetailComponent },
  { path: 'formation', component: FormationComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
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
        path: 'clients',
        loadComponent: () =>
          import('./admin/admin-users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'statistiques-clients',
        loadComponent: () =>
          import('./admin/admin-client-statistics.component').then((m) => m.AdminClientStatisticsComponent),
      },
      {
        path: 'remboursements',
        data: { title: 'Remboursements' },
        loadComponent: () =>
          import('./admin/admin-remboursements.component').then((m) => m.AdminRemboursementsComponent),
      },
      {
        path: 'contrats',
        data: { title: 'Contrats' },
        loadComponent: () =>
          import('./admin/admin-contrats.component').then((m) => m.AdminContratsComponent),
      },
      {
        path: 'contrats/:id',
        data: { title: 'Détails du Contrat' },
        loadComponent: () =>
          import('./admin/admin-contrat-detail.component').then((m) => m.AdminContratDetailComponent),
      },
      {
        path: 'echeanciers',
        data: { title: 'Échéanciers de Paiement' },
        loadComponent: () =>
          import('./admin/admin-echeanciers.component').then((m) => m.AdminEcheanciersComponent),
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
        data: { title: 'Audit' },
        loadComponent: () =>
          import('./admin/admin-placeholder.component').then((m) => m.AdminPlaceholderComponent),
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
