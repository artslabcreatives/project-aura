export interface ProjectGroup {
    id: string;
    name: string;
    departmentId: string;
    parentId?: string | null;
    children?: ProjectGroup[];
}
