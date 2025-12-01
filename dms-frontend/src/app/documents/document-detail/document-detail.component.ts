import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';
import { LayoutService } from '../../core/services/layout.service';
import { Document, PopulatedDocument } from '../../core/models/document.model';
import { Observable, switchMap, map, tap, BehaviorSubject, combineLatest } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-document-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './document-detail.component.html',
    styleUrls: ['./document-detail.component.css']
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
    document$: Observable<PopulatedDocument> | undefined;
    private refresh$ = new BehaviorSubject<void>(undefined);

    uploadVersionForm: FormGroup;
    editForm: FormGroup;
    isEditing = false;
    selectedFile: File | null = null;
    loading = false;
    success = false;
    error = '';

    constructor(
        private route: ActivatedRoute,
        private documentService: DocumentService,
        private layoutService: LayoutService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.uploadVersionForm = this.fb.group({
            changeLog: ['']
        });
        this.editForm = this.fb.group({
            title: [''],
            description: [''],
            tags: ['']
        });
    }

    ngOnInit() {
        this.document$ = combineLatest([
            this.route.paramMap,
            this.refresh$
        ]).pipe(
            switchMap(([params]) => {
                const id = params.get('id');
                if (!id || id === 'undefined') {
                    return new Observable<PopulatedDocument>();
                }
                this.layoutService.setActiveDocument(id);
                return this.documentService.getDocument(id).pipe(
                    map(doc => doc as unknown as PopulatedDocument),
                    tap(doc => {
                        // Only update form if NOT editing to avoid overwriting user input
                        if (!this.isEditing) {
                            this.editForm.patchValue({
                                title: doc.title,
                                description: doc.description,
                                tags: doc.tags.join(', ')
                            });
                        }
                    })
                );
            })
        );
    }

    ngOnDestroy() {
        this.layoutService.setActiveDocument(null);
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0] ?? null;
    }

    onUploadVersion(docId: string) {
        if (!this.selectedFile) return;

        this.loading = true;
        this.error = '';
        this.success = false;

        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('changeLog', this.uploadVersionForm.get('changeLog')?.value);

        this.documentService.uploadVersion(docId, formData).subscribe({
            next: () => {
                this.success = true;
                this.loading = false;
                this.selectedFile = null;
                this.uploadVersionForm.reset();
                this.refresh$.next(); // Reload document
            },
            error: (err) => {
                this.error = 'Version upload failed.';
                this.loading = false;
            }
        });
    }

    getFileUrl(filePath: string | undefined): string {
        if (!filePath) return '';
        const normalizedPath = filePath.replace(/\\/g, '/');
        const baseUrl = environment.apiBaseUrl.replace('/api', '');
        return `${baseUrl}/${normalizedPath}`;
    }

    downloadFile(doc: PopulatedDocument) {
        if (!doc.currentVersion?.filePath) return;

        const fileUrl = this.getFileUrl(doc.currentVersion.filePath);
        const fileName = doc.currentVersion.fileOriginalName || 'document';

        this.documentService.downloadDocument(fileUrl).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            },
            error: (err) => {
                console.error('Download failed:', err);
                this.error = 'Failed to download document.';
            }
        });
    }

    toggleEdit() {
        this.isEditing = !this.isEditing;
        if (!this.isEditing) {
            this.refresh$.next(); // Reset form data from server
        }
    }

    saveChanges(docId: string) {
        console.log('saveChanges called with ID:', docId);
        if (this.editForm.invalid) {
            console.warn('Form is invalid');
            return;
        }

        this.loading = true;
        this.documentService.updateDocument(docId, this.editForm.value).subscribe({
            next: (updatedDoc) => {
                console.log('Update successful:', updatedDoc);
                this.loading = false;
                this.isEditing = false;
                this.refresh$.next(); // Reload document
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Update failed:', err);
                this.loading = false;
                this.error = 'Failed to update document.';
                this.cdr.detectChanges();
            }
        });
    }
}
