import { User } from './task';
import { Project } from './project';

export type ReportStatus = 'draft' | 'submitted' | 'tl_approved' | 'approved' | 'rejected';

export interface ReportActivity {
    id: number;
    report_id: number;
    user_id: number;
    user: User;
    activity_type: 'comment' | 'status_change';
    from_status: ReportStatus | null;
    to_status: ReportStatus | null;
    comment: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProjectReport {
    id: number;
    project_id: number;
    project?: Project;
    user_id: number;
    user?: User;
    title: string;
    description: string | null;
    file_url: string | null;
    status: ReportStatus;
    tl_approved_at: string | null;
    hr_approved_at: string | null;
    rejected_at: string | null;
    tl_user_id: number | null;
    tl_user?: User;
    hr_user_id: number | null;
    hr_user?: User;
    activities?: ReportActivity[];
    created_at: string;
    updated_at: string;
}
