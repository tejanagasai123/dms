import { User } from './user.model';

export interface DocumentVersion {
    _id: string;
    versionNumber: number;
    filePath: string;
    fileOriginalName: string;
    mimeType: string;
    fileSize: number;
    updatedBy: User | string;
    changeLog?: string;
    updatedAt: string;
}
