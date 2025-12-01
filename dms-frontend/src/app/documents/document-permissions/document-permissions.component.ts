import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, switchMap, tap } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-document-permissions',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './document-permissions.component.html',
    styleUrls: ['./document-permissions.component.css']
})
export class DocumentPermissionsComponent implements OnInit {
    permissions$: Observable<any[]> | undefined;
    addPermissionForm: FormGroup;
    documentId: string = '';
    loading = false;
    error = '';

    constructor(
        private route: ActivatedRoute,
        private documentService: DocumentService,
        private fb: FormBuilder
    ) {
        this.addPermissionForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.documentId = params.get('id')!;
            this.reloadPermissions();
        });
    }

    addPermission() {
        if (this.addPermissionForm.invalid) return;

        this.loading = true;
        this.error = '';
        const email = this.addPermissionForm.get('email')?.value;

        this.documentService.addPermission(this.documentId, email)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: () => {
                    this.addPermissionForm.reset();
                    this.reloadPermissions();
                },
                error: (err) => {
                    console.error('Add permission error:', err);
                    this.error = err.error?.error || err.error?.message || err.message || 'Failed to add permission.';
                }
            });
    }

    removePermission(userId: string) {
        if (!confirm('Are you sure you want to remove access for this user?')) return;

        this.documentService.removePermission(this.documentId, userId).subscribe({
            next: () => this.reloadPermissions(),
            error: () => alert('Failed to remove permission.')
        });
    }

    reloadPermissions() {
        this.permissions$ = this.documentService.getPermissions(this.documentId);
    }
}
