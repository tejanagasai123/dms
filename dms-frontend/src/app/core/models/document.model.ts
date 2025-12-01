import { User } from './user.model';
import { DocumentVersion } from './document-version.model';

export interface Document {
    _id: string;
    id?: string;
    title: string;
    description?: string;
    tags: string[];
    createdBy?: User | string;
    allowedUsers?: (User | string)[];
    currentVersion?: DocumentVersion | string;
    createdAt: string;
    updatedAt: string;
    isDeleted?: boolean;
}

export interface PopulatedDocument extends Omit<Document, 'createdBy' | 'currentVersion'> {
    createdBy: User;
    currentVersion?: DocumentVersion;
}
