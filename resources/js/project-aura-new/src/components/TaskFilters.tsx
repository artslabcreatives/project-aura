import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Stage } from "@/types/stage";
import { User, Task } from "@/types/task";
import { Project } from "@/types/project";
import { Department } from "@/types/department";
import { SearchableSelect, SearchableOption } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedProject: string;
  onProjectChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedAssignee?: string;
  onAssigneeChange?: (value: string) => void;
  selectedTag?: string;
  onTagChange?: (value: string) => void;
  availableProjects: Project[];
  availableStatuses: Stage[];
  teamMembers?: User[];
  departments?: Department[];
  allTasks?: Task[];
}

export function TaskFilters({
  searchQuery,
  onSearchChange,
  selectedProject,
  onProjectChange,
  selectedStatus,
  onStatusChange,
  selectedAssignee = "all",
  onAssigneeChange,
  selectedTag = "all",
  onTagChange,
  availableProjects,
  availableStatuses,
  teamMembers = [],
  departments = [],
  allTasks = [],
}: TaskFiltersProps) {
  // Calculate task count for each assignee
  const getTaskCountForAssignee = (assigneeName: string) => {
    return allTasks.filter(task => task.assignee === assigneeName).length;
  };

  // Get department name helper
  const getDepartmentName = (departmentId?: string | number) => {
    if (!departmentId) return "Uncategorized";
    // Handle both string and number IDs as they might vary in types
    const id = departmentId.toString();
    const dept = departments.find(d => d.id.toString() === id);
    return dept ? dept.name : "Uncategorized";
  };

  // Prepare project options with grouping
  const projectOptions: SearchableOption[] = [
    { value: "all", label: "All Projects" },
    ...availableProjects.map(project => ({
      value: project.name, // Using name as value to match existing logic
      label: project.name,
      group: project.department ? project.department.name : "Uncategorized"
    }))
  ];

  // Prepare assignee options with grouping
  const assigneeOptions: SearchableOption[] = [
    { value: "all", label: "All Assignees" },
    ...teamMembers.map(member => {
      const taskCount = getTaskCountForAssignee(member.name);
      return {
        value: member.name,
        label: `${member.name} (${taskCount})`,
        group: getDepartmentName(member.department)
      };
    })
  ];

  // Get all unique tags from tasks
  const availableTags = Array.from(
    new Set(
      allTasks.flatMap(task => task.tags || [])
    )
  ).sort();

  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="w-full sm:w-[200px]">
        <SearchableSelect
          value={selectedProject}
          onValueChange={onProjectChange}
          options={projectOptions}
          placeholder="Select Project"
        />
      </div>

      <div className="w-full sm:w-[180px]">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {availableStatuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {onAssigneeChange && (
        <div className="w-full sm:w-[200px]">
          <SearchableSelect
            value={selectedAssignee}
            onValueChange={onAssigneeChange}
            options={assigneeOptions}
            placeholder="Select Assignee"
          />
        </div>
      )}

      {onTagChange && availableTags.length > 0 && (
        <div className="w-full sm:w-[180px]">
          <Select value={selectedTag} onValueChange={onTagChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
