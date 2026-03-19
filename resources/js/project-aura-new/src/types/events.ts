import { Task } from "./task";

export interface TaskUpdated {
    task: Task;
    action: 'create' | 'update' | 'delete';
}
