import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Briefcase, Building2, Calendar, MapPin, Shield, Camera } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Department } from "@/types/department";
import { departmentService } from "@/services/departmentService";
import { userService } from "@/services/userService";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
    const { currentUser, refreshUser } = useUser();
    const { toast } = useToast();
    const [departmentName, setDepartmentName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchDepartment = async () => {
            if (currentUser?.department) {
                try {
                    const depts = await departmentService.getAll();
                    const dept = depts.find(d => d.id === currentUser.department);
                    if (dept) setDepartmentName(dept.name);
                } catch (error) {
                    console.error("Failed to fetch department", error);
                }
            }
            setLoading(false);
        };
        fetchDepartment();
    }, [currentUser]);

    if (!currentUser) return null;

    const getInitials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) return "";
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const handleAvatarClick = () => {
        if (!uploading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentUser) return;

        setUploading(true);
        try {
            await userService.uploadAvatar(currentUser.id, file);
            await refreshUser();
            toast({
                title: "Success",
                description: "Profile picture updated successfully.",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to update profile picture. Please try again.",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (loading) {
        return <div className="p-8 space-y-8"><Skeleton className="h-64 rounded-2xl" /><div className="grid gap-8 md:grid-cols-2"><Skeleton className="h-48" /><Skeleton className="h-48" /></div></div>;
    }

    return (
        <div className="space-y-8 fade-in">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-primary/90 via-primary to-primary/70 shadow-xl text-primary-foreground">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 pt-4">
                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <Avatar className={`h-32 w-32 border-4 border-white/20 shadow-2xl transition-all ${uploading ? 'opacity-50' : 'group-hover:opacity-90'}`}>
                            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                            <AvatarFallback className="text-4xl font-bold bg-white text-primary">
                                {getInitials(currentUser.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-8 w-8 text-white" />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </div>
                    <div className="space-y-2 text-center md:text-left pt-2">
                        <h1 className="text-3xl font-bold tracking-tight">{currentUser.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 text-primary-foreground/90">
                            <Badge variant="secondary" className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                                <Briefcase className="mr-2 h-3.5 w-3.5" />
                                <span className="capitalize">{currentUser.role.replace('-', ' ')}</span>
                            </Badge>
                            {departmentName && (
                                <Badge variant="secondary" className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                                    <Building2 className="mr-2 h-3.5 w-3.5" />
                                    <span>{departmentName} Department</span>
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>Your personal contact details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-2">
                            <Label className="text-muted-foreground">Email Address</Label>
                            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{currentUser.email}</span>
                            </div>
                        </div>
                        {/* Placeholder for phone if we had it */}
                        <div className="grid gap-2">
                            <Label className="text-muted-foreground">Role</Label>
                            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium capitalize">{currentUser.role.replace('-', ' ')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            Work Details
                        </CardTitle>
                        <CardDescription>Department and employment information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-2">
                            <Label className="text-muted-foreground">Department</Label>
                            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{departmentName || 'Unassigned'}</span>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-muted-foreground">Account Status</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="font-medium text-green-700 dark:text-green-400">Active</span>
                            </div>
                        </div>
                        {/* Placeholder for joined date */}
                        <div className="grid gap-2">
                            <Label className="text-muted-foreground">Member Since</Label>
                            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{format(new Date(), 'MMMM yyyy')}</span> {/* Placeholder date */}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
