import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DocumentListComponent } from './documents/document-list/document-list.component';
import { DocumentUploadComponent } from './documents/document-upload/document-upload.component';
import { DocumentDetailComponent } from './documents/document-detail/document-detail.component';
import { DocumentPermissionsComponent } from './documents/document-permissions/document-permissions.component';
import { DocumentVersionsComponent } from './documents/document-versions/document-versions.component';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'documents',
        canActivate: [authGuard],
        children: [
            { path: '', component: DocumentListComponent },
            { path: 'upload', component: DocumentUploadComponent },
            { path: ':id', component: DocumentDetailComponent },
            { path: ':id/permissions', component: DocumentPermissionsComponent },
            { path: ':id/versions', component: DocumentVersionsComponent }
        ]
    },

    { path: '', redirectTo: '/documents', pathMatch: 'full' },
    { path: '**', redirectTo: '/documents' }
];
