import { Task } from "./task";
import { Project } from "./project";

export interface TaskUpdated {
    task: Task;
    action: 'create' | 'update' | 'delete';
}

export interface ProjectUpdated {
    project: Project;
    action: 'update' | 'archive' | 'unarchive';
}
