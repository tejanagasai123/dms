import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Document } from '../models/document.model';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private apiUrl = `${environment.apiBaseUrl}/documents`;

    constructor(private http: HttpClient) { }

    getDocuments(params?: any): Observable<Document[]> {
        return this.http.get<{ success: boolean, data: Document[] }>(this.apiUrl, { params })
            .pipe(
                map(response => {
                    console.log('getDocuments response:', response);
                    return response.data;
                })
            );
    }

    getDocument(id: string): Observable<Document> {
        return this.http.get<{ success: boolean, data: Document }>(`${this.apiUrl}/${id}`)
            .pipe(
                map(response => response.data)
            );
    }

    uploadDocument(formData: FormData): Observable<Document> {
        return this.http.post<{ success: boolean, data: Document }>(this.apiUrl, formData)
            .pipe(
                map(response => response.data)
            );
    }

    updateDocument(id: string, data: any): Observable<Document> {
        return this.http.put<{ success: boolean, data: Document }>(`${this.apiUrl}/${id}`, data)
            .pipe(
                map(response => response.data)
            );
    }

    uploadVersion(id: string, formData: FormData): Observable<Document> {
        return this.http.post<{ success: boolean, data: Document }>(`${this.apiUrl}/${id}/versions`, formData)
            .pipe(
                map(response => response.data)
            );
    }

    getVersions(id: string): Observable<any[]> {
        return this.http.get<{ success: boolean, data: any[] }>(`${this.apiUrl}/${id}/versions`)
            .pipe(
                map(response => response.data)
            );
    }

    // Permissions
    getPermissions(id: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${id}/permissions`);
    }

    addPermission(id: string, email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/permissions`, { email });
    }

    removePermission(id: string, userId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}/permissions/${userId}`);
    }

    deleteDocument(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    downloadDocument(url: string): Observable<Blob> {
        return this.http.get(url, { responseType: 'blob' });
    }
}
