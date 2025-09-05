
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UserComponent } from './pages/user/user.component';
import { ContactComponent } from './pages/contact/contact.component';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'user', component: UserComponent },
	{ path: 'contact', component: ContactComponent },
];
