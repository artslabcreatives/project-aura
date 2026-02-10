import React, { useState, useRef, useEffect } from "react";
import { Task, UserStatus } from "@/types/task";
import { useUser } from "@/hooks/use-user";
import { Stage } from "@/types/stage";
import { TaskCard } from "./TaskCard";
import { TaskDetailsDialog } from "./TaskDetailsDialog";
import { cn } from "@/lib/utils";
import { MoreVertical, Pencil, Trash2, Plus, Info, Copy, Check, Search, X, List } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { TaskCompletionDialog } from "./TaskCompletionDialog";
import {
  isToday,
  isThisWeek,
  isThisMonth,
  subMonths,
  isAfter,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
  format
} from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

interface KanbanBoardProps {
  tasks: Task[];
  stages: Stage[]; // Custom stages to display
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  useProjectStages?: boolean; // Whether to use projectStage field instead of userStatus
  onStageEdit?: (stage: Stage) => void; // Optional: for editing stages
  onStageDelete?: (stageId: string) => void; // Optional: for deleting stages
  canManageStages?: boolean; // Whether user can edit/delete stages
  canManageTasks?: boolean; // Whether user can edit/delete tasks
  canDragTasks?: boolean; // Whether user can drag tasks between stages
  disableColumnScroll?: boolean;
  onTaskReview?: (task: Task) => void; // Optional: for reviewing tasks
  onAddTaskToStage?: (stageId: string) => void;
  projectId?: string;
  onAddSubtask?: (task: Task) => void;
  onTaskComplete?: (taskId: string, stageId: string, data: { comment?: string; links: string[]; files: File[] }) => void;
  disableBacklogRenaming?: boolean;
  useSubtasksGrouping?: boolean;
  allTasks?: Task[];
}

export function KanbanBoard({
  tasks,
  stages,
  onTaskUpdate,
  onTaskEdit,
  onTaskDelete,
  useProjectStages = false,
  onStageEdit,
  onStageDelete,
  canManageStages = false,
  canManageTasks = true,
  canDragTasks = true,
  disableColumnScroll = false,
  onTaskReview,
  onAddTaskToStage,
  projectId,
  onAddSubtask,
  onTaskComplete,
  disableBacklogRenaming = false,
  useSubtasksGrouping = false,
  allTasks = [],
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(
    null
  );
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [pendingComplete, setPendingComplete] = useState<{ taskId: string; stageId: string } | null>(null);
  const [columnSearchQueries, setColumnSearchQueries] = useState<Record<string, string>>({});
  const [columnSearchOpen, setColumnSearchOpen] = useState<Record<string, boolean>>({});
  const [columnDateFilters, setColumnDateFilters] = useState<Record<string, string>>({});
  const [columnCustomDateRanges, setColumnCustomDateRanges] = useState<Record<string, DateRange | undefined>>({});
  const { currentUser } = useUser();
  const [stageToDelete, setStageToDelete] = useState<string | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);
  const mouseCoords = useRef<{ x: number, y: number } | null>(null);

  const confirmDeleteStage = () => {
    if (stageToDelete && onStageDelete) {
      onStageDelete(stageToDelete);
    }
    setStageToDelete(null);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("+94 78 538 4672");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDragStart = (task: Task) => {
    if (!canDragTasks) return; // Prevent drag if not allowed
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    if (!canDragTasks) return; // Prevent drop if not allowed
    e.preventDefault();
    setDraggedOverColumn(columnId);
  };

  // Track global mouse position for auto-scrolling
  useEffect(() => {
    if (!draggedTask) return;

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      mouseCoords.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('dragover', handleWindowDragOver);
    return () => window.removeEventListener('dragover', handleWindowDragOver);
  }, [draggedTask]);

  // Scroll loop
  useEffect(() => {
    if (!draggedTask) {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      return;
    }

    const scrollContainer = boardRef.current?.parentElement;
    if (!scrollContainer) return;

    const checkAndScroll = () => {
      if (!mouseCoords.current) return;

      const x = mouseCoords.current.x;
      const viewportWidth = window.innerWidth;

      // Settings
      const threshold = 180; // Detect within 180px of edge
      const baseSpeed = 8;
      const maxSpeed = 35;

      // Right Edge
      if (x > viewportWidth - threshold) {
        const intensity = Math.min(1, (x - (viewportWidth - threshold)) / threshold);
        const speed = baseSpeed + (intensity * (maxSpeed - baseSpeed));
        scrollContainer.scrollLeft += speed;
      }
      // Left Edge
      else if (x < threshold) {
        const intensity = Math.min(1, (threshold - x) / threshold);
        const speed = baseSpeed + (intensity * (maxSpeed - baseSpeed));
        scrollContainer.scrollLeft -= speed;
      }
    };

    scrollIntervalRef.current = window.setInterval(checkAndScroll, 16);
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [draggedTask]);


  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (columnId: string) => {
    if (!canDragTasks) return; // Prevent drop if not allowed
    if (!draggedTask) return;

    // Check if completing logic
    let isCompleting = false;
    if (useProjectStages) {
      const stage = stages.find(s => s.id === columnId);
      if (stage && (stage.title.toLowerCase() === 'completed' || stage.title.toLowerCase() === 'archive')) {
        isCompleting = true;
      }
    } else {
      if (columnId === 'complete') isCompleting = true;
    }

    if (isCompleting && onTaskComplete) {
      setPendingComplete({ taskId: draggedTask.id, stageId: columnId });
      setShowCompletionDialog(true);
      setDraggedTask(null);
      setDraggedOverColumn(null);
      return;
    }

    if (useProjectStages) {
      // Update projectStage field
      if (draggedTask.projectStage !== columnId) {
        onTaskUpdate(draggedTask.id, { projectStage: columnId });
      }
    } else {
      // Update userStatus field
      const newUserStatus = columnId as UserStatus;
      if (draggedTask.userStatus !== newUserStatus) {
        onTaskUpdate(draggedTask.id, { userStatus: newUserStatus });
      }
    }

    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const handleConfirmation = (data: { comment?: string; links: string[]; files: File[] }) => {
    if (pendingComplete && onTaskComplete) {
      onTaskComplete(pendingComplete.taskId, pendingComplete.stageId, data);
    }
    setShowCompletionDialog(false);
    setPendingComplete(null);
  };

  const getColumnTasks = (stageId: string) => {
    let filtered = tasks.filter((task) => {
      if (useProjectStages) {
        return task.projectStage === stageId;
      } else {
        return task.userStatus === stageId;
      }
    });

    const stage = stages.find(s => s.id === stageId);
    const isCompletedStage = stage && (stage.title.toLowerCase().includes('completed') || stage.title.toLowerCase().includes('complete') || stage.title.toLowerCase().includes('archive'));
    const dateFilter = columnDateFilters[stageId] || (isCompletedStage ? "week" : "all");

    if (dateFilter && dateFilter !== "all") {
      filtered = filtered.filter((task) => {
        const dateStr = task.completedAt || task.createdAt;
        if (!dateStr) return false;
        const date = parseISO(dateStr);

        if (dateFilter === "today") return isToday(date);
        if (dateFilter === "week") return isThisWeek(date, { weekStartsOn: 1 });
        if (dateFilter === "month") return isThisMonth(date);
        if (dateFilter === "2months") {
          const twoMonthsAgo = subMonths(new Date(), 2);
          return isAfter(date, twoMonthsAgo);
        }
        if (dateFilter === "custom") {
          const range = columnCustomDateRanges[stageId];
          if (!range?.from) return true;
          const start = startOfDay(range.from);
          const end = range.to ? endOfDay(range.to) : endOfDay(range.from);
          return isWithinInterval(date, { start, end });
        }
        return true;
      });
    }

    const searchQuery = columnSearchQueries[stageId];
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  };

  // Filter out Specific Stage if it has no tasks
  const visibleStages = stages.filter(stage => {
    // Hide Suggested Task stage if it has no tasks
    if (stage.title.toLowerCase().includes("suggested")) {
      const hasTasks = tasks.some(task => {
        if (useProjectStages) {
          return task.projectStage === stage.id;
        } else {
          return task.userStatus === stage.id;
        }
      });
      return hasTasks;
    }
    return true;
  });

  return (
    <div
      ref={boardRef}
      className={cn("grid gap-4", !disableColumnScroll && "h-full")}
      style={{
        gridTemplateColumns: `repeat(${visibleStages.length}, minmax(350px, 1fr))`,
      }}
    >
      {visibleStages.map((column) => {
        const columnTasks = getColumnTasks(column.id);
        const isDraggedOver = draggedOverColumn === column.id;

        return (
          <div
            key={column.id}
            className={cn(
              "flex flex-col flex-shrink-0 rounded-lg border bg-muted/50",
              !disableColumnScroll && "max-h-full",
              draggedOverColumn === column.id && "ring-2 ring-primary/20 bg-muted",
              column.isReviewStage && "border-indigo-200 bg-indigo-50/30 dark:border-indigo-800 dark:bg-indigo-950/10"
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(column.id);
            }}
          >
            <div className={cn(
              "p-3 font-medium text-sm flex items-center justify-between border-b bg-background/50 backdrop-blur-sm rounded-t-lg",
              column.isReviewStage && "bg-indigo-50/50 dark:bg-indigo-950/20",
              disableColumnScroll && "sticky top-0 z-10 bg-background/80 backdrop-blur-md shadow-sm"
            )}>
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", column.color)} />
                {!columnSearchOpen[column.id] && (
                  <span>
                    {(column.title === 'Pending' && !disableBacklogRenaming)
                      ? 'Backlog'
                      : column.title}
                  </span>
                )}
                {!columnSearchOpen[column.id] && (
                  <Badge variant="secondary" className="ml-2 text-xs font-normal">
                    {columnTasks.length}
                  </Badge>
                )}
                {column.isReviewStage && !columnSearchOpen[column.id] && (
                  <Badge variant="outline" className="ml-1 text-[10px] h-5 border-indigo-200 text-indigo-700 bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:bg-indigo-950/30">
                    Review
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                {(column.title === "Suggested Task" || column.title === "Suggested") && (
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[280px] p-4 z-[100]">
                        <div className="space-y-3">
                          <p className="text-sm font-medium">Client Requests</p>
                          <p className="text-xs text-muted-foreground">
                            This stage shows tasks suggested via WhatsApp and Email clients.
                          </p>
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md border text-xs">
                            <span className="font-mono flex-1">+94 78 538 4672</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-background"
                              onClick={handleCopy}
                            >
                              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Add this number to the WhatsApp group to receive suggestions.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {canManageTasks && (
                  <div className={cn("flex items-center transition-all duration-300 ease-in-out", columnSearchOpen[column.id] ? "w-[180px]" : "w-auto")}>
                    {columnSearchOpen[column.id] ? (
                      <div className="relative w-full flex items-center">
                        <Input
                          value={columnSearchQueries[column.id] || ""}
                          onChange={(e) => setColumnSearchQueries(prev => ({ ...prev, [column.id]: e.target.value }))}
                          placeholder="Search..."
                          className="h-7 text-xs pr-6"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 absolute right-1 hover:bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            setColumnSearchQueries(prev => ({ ...prev, [column.id]: "" }));
                            setColumnSearchOpen(prev => ({ ...prev, [column.id]: false }));
                          }}
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setColumnSearchOpen(prev => ({ ...prev, [column.id]: true }));
                        }}
                        title="Search tasks in this stage"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}

                {(column.title.toLowerCase().includes('completed') || column.title.toLowerCase().includes('complete') || column.title.toLowerCase().includes('archive')) && (
                  <div className="flex items-center">
                    <Select value={columnDateFilters[column.id] || "week"} onValueChange={(val) => setColumnDateFilters(prev => ({ ...prev, [column.id]: val }))}>
                      <SelectTrigger className="h-6 w-6 p-0 border-none bg-transparent hover:bg-accent focus:ring-0 [&>svg]:hidden flex items-center justify-center hover:[&_svg]:text-white">
                        <div className="flex items-center justify-center w-full h-full">
                          <Filter className="h-4 w-4 text-muted-foreground transition-colors" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="2months">This 2 Months</SelectItem>
                        <SelectItem value="custom">Custom Time Period</SelectItem>
                      </SelectContent>
                    </Select>

                    {columnDateFilters[column.id] === 'custom' && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={columnCustomDateRanges[column.id]?.from}
                            selected={columnCustomDateRanges[column.id]}
                            onSelect={(range) => setColumnCustomDateRanges(prev => ({ ...prev, [column.id]: range }))}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                )}

                {canManageTasks && onAddTaskToStage &&
                  column.title.toLowerCase() !== "archive" &&
                  column.title !== "Suggested Task" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onAddTaskToStage(column.id)}
                      title="Add task to this stage"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}

                {/* No edit/delete options for Specific Stage, pending, or complete stages */}
                {canManageStages &&
                  column.id !== "pending" &&
                  column.id !== "complete" &&
                  column.id !== "complete" &&
                  onStageEdit &&
                  onStageDelete && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onStageEdit(column)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Stage
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStageToDelete(column.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Stage
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
              </div>
            </div>

            <div className={cn("flex-1 p-4 space-y-3 min-h-[400px]", !disableColumnScroll && "overflow-y-auto")}>
              {columnTasks.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                  {columnSearchQueries[column.id] ? "No matching tasks" : "No tasks"}
                </div>
              ) : (
                useSubtasksGrouping ? (
                  Object.values(columnTasks.reduce((acc, task) => {
                    const parentId = task.parentId || task.id;
                    if (!acc[parentId]) acc[parentId] = [];
                    acc[parentId].push(task);
                    return acc;
                  }, {} as Record<string, Task[]>)).map((groupTasks) => {
                    // Check if this group represents a hierarchy (has subtasks)
                    // A group has a hierarchy if:
                    // 1. It has more than 1 item (Parent + Subtask(s))
                    // 2. OR It has 1 item which is a subtask (Parent not in this column)
                    const parentId = groupTasks[0].parentId || groupTasks[0].id;
                    const isSubtaskGroup = groupTasks.some(t => t.parentId === parentId);

                    if (isSubtaskGroup) {
                      // Try to find parent task details
                      const parentTask = allTasks.find(t => t.id === parentId) || tasks.find(t => t.id === parentId);
                      const parentInColumn = groupTasks.find(t => t.id === parentId);
                      const subtasks = groupTasks.filter(t => t.parentId === parentId);

                      return (
                        <div key={`group-${parentId}`} className="border rounded-md p-2 bg-card/40 dark:bg-card/20 space-y-2">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                            <div className="bg-primary/10 p-1 rounded">
                              <List className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground truncate" title={parentTask?.title}>
                              {parentTask?.title || "Parent Task"}
                            </span>
                          </div>

                          {/* If parent is in this column, render it first */}
                          {parentInColumn && (
                            <TaskCard
                              key={parentInColumn.id}
                              task={parentInColumn}
                              onDragStart={() => handleDragStart(parentInColumn)}
                              onEdit={() => onTaskEdit(parentInColumn)}
                              onDelete={() => onTaskDelete(parentInColumn.id)}
                              onView={() => {
                                setViewTask(parentInColumn);
                                setIsViewDialogOpen(true);
                              }}
                              onReviewTask={onTaskReview ? () => onTaskReview(parentInColumn) : undefined}
                              canManage={canManageTasks}
                              canDrag={canDragTasks}
                              currentStage={column}
                              projectId={projectId}
                              onAddSubtask={onAddSubtask ? () => onAddSubtask(parentInColumn) : undefined}
                              onViewSubtask={(subtask) => {
                                setViewTask(subtask);
                                setIsViewDialogOpen(true);
                              }}
                              onTaskUpdate={onTaskUpdate}
                            />
                          )}

                          {/* Render subtasks */}
                          <div className="space-y-2 pl-2 border-l-2 border-primary/20">
                            {subtasks.map(task => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                onDragStart={() => handleDragStart(task)}
                                onEdit={() => onTaskEdit(task)}
                                onDelete={() => onTaskDelete(task.id)}
                                onView={() => {
                                  setViewTask(task);
                                  setIsViewDialogOpen(true);
                                }}
                                onReviewTask={onTaskReview ? () => onTaskReview(task) : undefined}
                                canManage={canManageTasks}
                                canDrag={canDragTasks}
                                currentStage={column}
                                projectId={projectId}
                                onAddSubtask={onAddSubtask ? () => onAddSubtask(task) : undefined}
                                onViewSubtask={(subtask) => {
                                  setViewTask(subtask);
                                  setIsViewDialogOpen(true);
                                }}
                                onTaskUpdate={onTaskUpdate}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    } else {
                      // Normal standalone tasks (or parent without subtasks in this column)
                      return groupTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onDragStart={() => handleDragStart(task)}
                          onEdit={() => onTaskEdit(task)}
                          onDelete={() => onTaskDelete(task.id)}
                          onView={() => {
                            setViewTask(task);
                            setIsViewDialogOpen(true);
                          }}
                          onReviewTask={onTaskReview ? () => onTaskReview(task) : undefined}
                          canManage={canManageTasks}
                          canDrag={canDragTasks}
                          currentStage={column}
                          projectId={projectId}
                          onAddSubtask={onAddSubtask ? () => onAddSubtask(task) : undefined}
                          onViewSubtask={(subtask) => {
                            setViewTask(subtask);
                            setIsViewDialogOpen(true);
                          }}
                          onTaskUpdate={onTaskUpdate}
                        />
                      ));
                    }
                  })
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={() => handleDragStart(task)}
                      onEdit={() => onTaskEdit(task)}
                      onDelete={() => onTaskDelete(task.id)}
                      onView={() => {
                        setViewTask(task);
                        setIsViewDialogOpen(true);
                      }}
                      onReviewTask={onTaskReview ? () => onTaskReview(task) : undefined}

                      canManage={canManageTasks}
                      canDrag={canDragTasks}
                      currentStage={column}
                      projectId={projectId}
                      onAddSubtask={onAddSubtask ? () => onAddSubtask(task) : undefined}
                      onViewSubtask={(subtask) => {
                        setViewTask(subtask);
                        setIsViewDialogOpen(true);
                      }}
                      onTaskUpdate={onTaskUpdate}
                    />
                  ))
                )
              )}
            </div>
          </div>
        );
      })}

      <TaskDetailsDialog
        task={viewTask}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        onEdit={canManageTasks && viewTask ? () => {
          setIsViewDialogOpen(false);
          onTaskEdit(viewTask);
        } : undefined}
      />

      <TaskCompletionDialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        onConfirm={handleConfirmation}
        taskTitle={pendingComplete ? tasks.find(t => t.id === pendingComplete.taskId)?.title : undefined}
      />

      <AlertDialog open={!!stageToDelete} onOpenChange={(open) => !open && setStageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this stage? Tasks in this stage will need to be moved to another stage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}