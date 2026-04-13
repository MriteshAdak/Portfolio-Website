import { Routes } from '@angular/router';
import { adminAuthGuard, adminGuestGuard } from './guards/admin-auth.guard';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { AdminLoginComponent } from './pages/admin-login/admin-login';
import { LandingPageComponent } from './pages/landing-page/landing-page';

export const routes: Routes = [
	{
		path: '',
		component: LandingPageComponent,
	},
	{
		path: 'admin/login',
		component: AdminLoginComponent,
		canActivate: [adminGuestGuard],
	},
	{
		path: 'admin',
		component: AdminDashboardComponent,
		canActivate: [adminAuthGuard],
	},
	{
		path: '**',
		redirectTo: '',
	},
];
