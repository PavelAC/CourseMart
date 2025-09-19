
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UserComponent } from './pages/user/user.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AuthComponent } from './pages/auth/auth';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'user', component: UserComponent },
	{ path: 'contact', component: ContactComponent },
	{ path: 'auth', component: AuthComponent },
	{ path: 'login', redirectTo: 'auth', pathMatch: 'full' },
	{ path: 'signup', redirectTo: 'auth', pathMatch: 'full' },
];
