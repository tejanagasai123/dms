import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';

@Component({
    selector: 'app-document-upload',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './document-upload.component.html',
    styleUrls: ['./document-upload.component.css']
})
export class DocumentUploadComponent {
    uploadForm: FormGroup;
    selectedFile: File | null = null;
    loading = false;
    success = false;
    error = '';

    constructor(
        private fb: FormBuilder,
        private documentService: DocumentService,
        private router: Router
    ) {
        this.uploadForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            tags: ['']
        });
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0] ?? null;
    }

    onSubmit() {
        if (this.uploadForm.invalid || !this.selectedFile) return;

        this.loading = true;
        this.error = '';
        this.success = false;

        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('title', this.uploadForm.get('title')?.value);
        formData.append('description', this.uploadForm.get('description')?.value);
        formData.append('tags', this.uploadForm.get('tags')?.value);

        this.documentService.uploadDocument(formData).subscribe({
            next: () => {
                this.success = true;
                this.loading = false;
                setTimeout(() => this.router.navigate(['/documents']), 1500);
            },
            error: (err) => {
                console.error('Upload error:', err);
                this.error = err.error?.message || err.message || 'Upload failed. Please try again.';
                this.loading = false;
            }
        });
    }
}
