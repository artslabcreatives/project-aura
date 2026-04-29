export interface Document {
    id: string;
    name: string;
    file_path: string | null;
    url: string | null;
    department_id: number;
    uploaded_by: number;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
    department?: {
        id: number;
        name: string;
    };
    uploader?: {
        id: number;
        name: string;
    };
}

export type DocumentGrouped = Record<string, Document[]>;
