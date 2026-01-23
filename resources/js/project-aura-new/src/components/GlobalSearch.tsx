import { useState, useEffect } from "react";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandItem,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Loader2, FileText, History } from "lucide-react";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";

export const GlobalSearch = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 300);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Load history on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem("aura_search_history_text");
            if (raw) {
                setRecentSearches(JSON.parse(raw));
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }, []);

    const addToHistory = (searchTerm: string) => {
        if (!searchTerm || !searchTerm.trim()) return;
        const term = searchTerm.trim();
        try {
            const raw = localStorage.getItem("aura_search_history_text");
            let history: string[] = raw ? JSON.parse(raw) : [];
            // Remove duplicates
            history = history.filter((h) => h !== term);
            // Add to top
            history.unshift(term);
            // Cap at 5
            if (history.length > 5) history = history.slice(0, 5);

            localStorage.setItem("aura_search_history_text", JSON.stringify(history));
            setRecentSearches(history);
        } catch (e) {
            console.error("Failed to save history", e);
        }
    };

    useEffect(() => {
        const search = async () => {
            if (!debouncedQuery) {
                setResults(null);
                return;
            }
            setLoading(true);
            try {
                const { data } = await api.get(`/search/all-with-relations?q=${debouncedQuery}`);
                setResults(data);
            } catch (error) {
                console.error("Search error:", error);
                setResults(null);
            } finally {
                setLoading(false);
            }
        };
        search();
    }, [debouncedQuery]);

    const handleSelect = (category: string, item: any) => {
        addToHistory(query);
        setOpen(false);
        switch (category) {
            case 'projects':
                navigate(`/project/${item.id}`);
                break;
            case 'tasks':
                if (item.project_id) {
                    navigate(`/project/${item.project_id}`);
                }
                break;
            case 'groups':
                break;
            case 'departments':
                navigate(`/team`);
                break;
        }
    };

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-9 p-0 xl:h-10 xl:w-[450px] xl:justify-start xl:px-3 xl:py-2 text-muted-foreground bg-muted/50 hover:bg-muted/80 border-muted-foreground/20 shadow-none transition-all duration-300 hover:border-primary/20"
                onClick={() => setOpen(true)}
            >
                <Search className="h-4 w-4 xl:mr-2" />
                <span className="hidden xl:inline-flex opacity-50">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-hidden p-0 shadow-2xl sm:max-w-5xl border-0 h-[80vh] bg-background/95 backdrop-blur-xl flex flex-col">
                    <Command
                        shouldFilter={false}
                        className="w-full h-full flex flex-col bg-transparent"
                    >
                        <CommandInput
                            placeholder="Search tasks, projects and stages..."
                            value={query}
                            onValueChange={setQuery}
                            className="border-0 focus:ring-0 text-lg h-14 bg-transparent"
                        />
                        <CommandList className="flex-1 overflow-y-auto p-6 space-y-8 scrollbg-transparent max-h-full">
                            <CommandEmpty className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p>Searching across workspace...</p>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 opacity-60">
                                        <Search className="h-10 w-10" />
                                        <p>{query ? `No results found for "${query}"` : "Type to search..."}</p>
                                    </div>
                                )}
                            </CommandEmpty>

                            {/* Recent Searches (Text History) */}
                            {!query && recentSearches.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                                        Recent Searches
                                    </h3>
                                    <div className="flex flex-wrap gap-2 px-1">
                                        {recentSearches.map((term, index) => (
                                            <CommandItem
                                                key={`history-${index}`}
                                                value={term}
                                                onSelect={() => setQuery(term)}
                                                className="flex-none inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-secondary-foreground hover:bg-secondary cursor-pointer transition-all aria-selected:bg-blue-600 aria-selected:text-white group"
                                            >
                                                <History className="h-3.5 w-3.5 opacity-70 group-aria-selected:text-white" />
                                                <span className="text-sm font-medium">{term}</span>
                                            </CommandItem>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actual Search Results */}
                            {!loading && results && debouncedQuery && (
                                <>
                                    {/* Tasks Group */}
                                    {results.tasks?.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 px-1">Tasks</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {results.tasks.map((task: any) => (
                                                    <CommandItem
                                                        key={`task-${task.id}`}
                                                        onSelect={() => handleSelect('tasks', task)}
                                                        className="block p-0 aria-selected:bg-transparent data-[selected=true]:bg-transparent group"
                                                    >
                                                        <div className="border border-blue-200 dark:border-blue-900 rounded-lg p-3 bg-blue-50/10 dark:bg-blue-950/10 cursor-pointer h-full flex flex-col gap-3 transition-colors group-data-[selected=true]:bg-blue-600 group-data-[selected=true]:border-blue-600 hover:bg-blue-600 hover:border-blue-600">
                                                            <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold pl-1 group-data-[selected=true]:text-white group-hover:text-white transition-colors">
                                                                {task.project?.name || "Unknown Project"}
                                                            </div>
                                                            <div className="border border-blue-200 dark:border-blue-800 rounded-md p-3 bg-background flex-1 flex flex-col gap-3 shadow-sm group-data-[selected=true]:border-transparent">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="text-xs text-muted-foreground font-medium">
                                                                        {task.project_stage?.title || task.stage?.title || "Unknown Stage"}
                                                                    </div>
                                                                    {task.project_stage?.color && (
                                                                        <div
                                                                            className="w-2 h-2 rounded-full"
                                                                            style={{ backgroundColor: task.project_stage.color }}
                                                                        />
                                                                    )}
                                                                </div>

                                                                <div className="bg-blue-600 text-white p-3 rounded-md text-sm font-medium shadow-sm leading-tight">
                                                                    {task.title}
                                                                </div>

                                                                <div className="bg-blue-600/10 text-blue-700 dark:text-blue-300 p-2 rounded-md text-xs font-medium text-center">
                                                                    Status: {task.priority || "Normal"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Attachments Group */}
                                    {results.task_attachments?.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 px-1">Files</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                {results.task_attachments.map((file: any) => (
                                                    <CommandItem
                                                        key={`file-${file.id}`}
                                                        onSelect={() => {
                                                            addToHistory(query);
                                                            window.open(file.url || file.path, '_blank');
                                                        }}
                                                        className="block p-0 aria-selected:bg-transparent data-[selected=true]:bg-transparent"
                                                    >
                                                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                                            <div className="w-full aspect-square bg-blue-600 text-white rounded-md flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
                                                                <FileText className="h-8 w-8" />
                                                            </div>
                                                            <div className="text-center w-full">
                                                                <div className="text-xs font-medium truncate w-full px-1 text-blue-700 dark:text-blue-300" title={file.file_name || file.name}>
                                                                    {file.file_name || file.name || "Unnamed File"}
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground truncate w-full px-1">
                                                                    Task #{file.task_id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Projects Group */}
                                    {results.projects?.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 px-1">Projects</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {results.projects.map((project: any) => (
                                                    <CommandItem
                                                        key={`proj-${project.id}`}
                                                        onSelect={() => handleSelect('projects', project)}
                                                        className="block p-0 aria-selected:bg-transparent data-[selected=true]:bg-transparent"
                                                    >
                                                        <div className="bg-blue-600 text-white p-4 rounded-md flex items-center justify-center text-center text-sm font-medium h-20 hover:bg-blue-700 cursor-pointer shadow-sm transition-all hover:scale-105">
                                                            {project.name}
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    );
};
