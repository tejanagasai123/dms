import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    private activeDocumentIdSubject = new BehaviorSubject<string | null>(null);
    activeDocumentId$ = this.activeDocumentIdSubject.asObservable();

    setActiveDocument(id: string | null) {
        this.activeDocumentIdSubject.next(id);
    }
}
