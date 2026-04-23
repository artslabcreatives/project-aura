import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { User, Settings, LogOut, RefreshCw, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UserProfileMenu() {
    const { currentUser, logout, effectiveRole, switchRole, clearRoleSwitch } = useUser();
    const navigate = useNavigate();

    if (!currentUser) return null;

    const getInitials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) return "";
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const isAdminOrLead = currentUser.role === 'admin' || currentUser.role === 'team-lead';

    const roleOptions: { label: string; value: string }[] = [
        { label: 'User', value: 'user' },
        { label: 'Account Manager', value: 'account-manager' },
        ...(currentUser.role === 'admin' ? [{ label: 'Team Lead', value: 'team-lead' }] : []),
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-accent/50 focus-visible:ring-0 focus-visible:ring-offset-0">
                    <Avatar className="h-8 w-8 transition-transform hover:scale-105">
                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                        <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                    {effectiveRole && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                            {effectiveRole}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/configuration')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                {isAdminOrLead && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Switch View</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                {roleOptions.map(({ label, value }) => (
                                    <DropdownMenuItem
                                        key={value}
                                        onClick={() => switchRole(value)}
                                        className="cursor-pointer"
                                    >
                                        {effectiveRole === value && <span className="mr-1">✓</span>}
                                        {label}
                                    </DropdownMenuItem>
                                ))}
                                {effectiveRole && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={clearRoleSwitch} className="cursor-pointer text-muted-foreground">
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Reset to my role
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>LogOut</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
