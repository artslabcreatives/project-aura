import { useState, useEffect } from "react";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Folder, CheckSquare, Layers, Users } from "lucide-react";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";

export const GlobalSearch = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 300);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
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

    useEffect(() => {
        const search = async () => {
            if (!debouncedQuery) {
                setResults(null);
                return;
            }
            setLoading(true);
            try {
                const { data } = await api.get(`/search/all?q=${debouncedQuery}`);
                setResults(data);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };
        search();
    }, [debouncedQuery]);

    const handleSelect = (category: string, item: any) => {
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
                // Assuming filter handled on list/tasks page or similar
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
                className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 text-muted-foreground bg-muted/50 hover:bg-muted/80 border-muted-foreground/20 shadow-none"
                onClick={() => setOpen(true)}
            >
                <Search className="h-4 w-4 xl:mr-2" />
                <span className="hidden xl:inline-flex opacity-50">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-[600px] border-0">
                    <Command
                        shouldFilter={false}
                        className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
                    >
                        <CommandInput placeholder="Type to search..." value={query} onValueChange={setQuery} />
                        <CommandList>
                            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                                {loading ? "Searching..." : "No results found."}
                            </CommandEmpty>
                            {loading && (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            )}

                            {!loading && results && (
                                <>
                                    {results.projects?.length > 0 && (
                                        <CommandGroup heading="Projects">
                                            {results.projects.map((project: any) => (
                                                <CommandItem key={project.id} onSelect={() => handleSelect('projects', project)} className="gap-2 cursor-pointer">
                                                    <Folder className="h-4 w-4 text-primary/70" />
                                                    <span>{project.name}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )}
                                    {results.tasks?.length > 0 && (
                                        <CommandGroup heading="Tasks">
                                            {results.tasks.map((task: any) => (
                                                <CommandItem key={task.id} onSelect={() => handleSelect('tasks', task)} className="gap-2 cursor-pointer">
                                                    <CheckSquare className="h-4 w-4 text-emerald-500/70" />
                                                    <span className="truncate flex-1">{task.title}</span>
                                                    {task.code && <span className="text-xs text-muted-foreground">#{task.code}</span>}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )}
                                    {results.project_groups?.length > 0 && (
                                        <CommandGroup heading="Project Groups">
                                            {results.project_groups.map((group: any) => (
                                                <CommandItem key={group.id} onSelect={() => handleSelect('groups', group)} className="gap-2 cursor-pointer">
                                                    <Layers className="h-4 w-4 text-blue-500/70" />
                                                    <span>{group.name}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )}
                                    {results.departments?.length > 0 && (
                                        <CommandGroup heading="Departments">
                                            {results.departments.map((dept: any) => (
                                                <CommandItem key={dept.id} onSelect={() => handleSelect('departments', dept)} className="gap-2 cursor-pointer">
                                                    <Users className="h-4 w-4 text-purple-500/70" />
                                                    <span>{dept.name}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
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
