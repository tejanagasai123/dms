import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';
import { Document, PopulatedDocument } from '../../core/models/document.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, switchMap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-document-versions',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './document-versions.component.html',
  styleUrls: ['./document-versions.component.css']
})
export class DocumentVersionsComponent implements OnInit {
  document$: Observable<PopulatedDocument> | undefined;
  versions: any[] = []; // In real app, fetch versions separately if not in doc
  uploadVersionForm: FormGroup;
  selectedFile: File | null = null;
  loading = false;
  success = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private fb: FormBuilder
  ) {
    this.uploadVersionForm = this.fb.group({
      changeLog: ['']
    });
  }

  ngOnInit() {
    this.document$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) return new Observable<PopulatedDocument>();
        return this.documentService.getDocument(id).pipe(
          map(doc => {
            // Mocking versions list from doc details if available, 
            // or we might need a separate endpoint for full history if not populated
            // For now assuming we can get basic info or need to fetch it.
            // Since getDocumentById in backend populates currentVersion but not ALL versions list,
            // we might need to add an endpoint to get all versions or just show current.
            // Wait, the admin controller gets all versions. The user controller might not.
            // Let's check user controller.
            return doc as unknown as PopulatedDocument;
          })
        );
      })
    );

    // We need to fetch versions. Let's assume we need to add a method to service.
    // Or we can just show current version and upload new one for now, 
    // but the requirement is "Version control... track changes".
    // I will add getVersions to service.
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.documentService.getVersions(id).subscribe(versions => {
          this.versions = versions;
        });
      }
    });
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
        // Reload versions
        this.documentService.getVersions(docId).subscribe(v => this.versions = v);
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
}
