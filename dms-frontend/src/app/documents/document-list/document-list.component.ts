import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';
import { Document, PopulatedDocument } from '../../core/models/document.model';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, map, shareReplay } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-document-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './document-list.component.html',
    styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit {
    documents$: Observable<PopulatedDocument[]> | undefined;
    searchQuery = '';
    selectedTag: string | null = null;
    loading = false;
    hasEnoughDocs = false;

    private filters$ = new BehaviorSubject<{ q: string, tag: string | null, refresh: number }>({ q: '', tag: null, refresh: 0 });

    constructor(
        private documentService: DocumentService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Check if we have enough documents to show search bar
        this.documentService.getDocuments().subscribe(docs => {
            this.hasEnoughDocs = docs.length >= 2;
        });

        this.documents$ = this.filters$.pipe(
            debounceTime(300),
            distinctUntilChanged((prev, curr) => prev.q === curr.q && prev.tag === curr.tag && prev.refresh === curr.refresh),
            tap(() => this.loading = true),
            switchMap(filters => {
                const params: any = {};
                if (filters.q) params.q = filters.q;
                if (filters.tag) params.tags = filters.tag;

                return this.documentService.getDocuments(params).pipe(
                    tap(() => this.loading = false),
                    catchError(error => {
                        console.error(error);
                        this.loading = false;
                        return of([]);
                    })
                );
            }),
            map(docs => docs as unknown as PopulatedDocument[]),
            shareReplay(1)
        );
    }

    onSearch() {
        this.filters$.next({ ...this.filters$.value, q: this.searchQuery });
    }

    filterByTag(tag: string | null) {
        this.selectedTag = tag;
        this.filters$.next({ ...this.filters$.value, tag: tag });
    }

    deleteErrors: { [key: string]: string } = {};

    onDelete(doc: PopulatedDocument) {
        console.log('Attempting to delete document:', doc._id, doc.title);
        if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
            this.deleteErrors[doc._id] = ''; // Clear previous error

            this.documentService.deleteDocument(doc._id).subscribe({
                next: () => {
                    // Force a hard refresh as requested
                    window.location.reload();
                },
                error: (err: any) => {
                    console.error('Delete failed', err);
                    console.log('Full error object:', JSON.stringify(err, null, 2));
                    // Try all possible error fields
                    const errorMessage = err.error?.error || err.error?.message || err.message || 'Failed to delete document';
                    console.log('Extracted error message:', errorMessage);

                    // Set error message for specific document
                    this.deleteErrors[doc._id] = errorMessage;
                    this.cd.detectChanges(); // Force UI update

                    // Clear error after 5 seconds
                    setTimeout(() => {
                        delete this.deleteErrors[doc._id];
                        this.cd.detectChanges(); // Force UI update on clear
                    }, 5000);
                }
            });
        }
    }

    getFileUrl(filePath: string | undefined): string {
        if (!filePath) return '';
        const normalizedPath = filePath.replace(/\\/g, '/');
        const baseUrl = environment.apiBaseUrl.replace('/api', '');
        return `${baseUrl}/${normalizedPath}`;
    }
}
