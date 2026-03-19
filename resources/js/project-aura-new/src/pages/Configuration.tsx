import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Settings, Bell, Lock, Palette, MessageSquare, Mail, Smartphone, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

import { userService } from "@/services/userService";
import { TwoFactorSection } from "@/components/profile/TwoFactorSection";

export default function Configuration() {
    const { currentUser, refreshUser } = useUser();
    const { toast } = useToast();

    // Refs for scrolling
    const appearanceRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const securityRef = useRef<HTMLDivElement>(null);

    // State for notifications
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        whatsapp: false,
        mattermost: false
    });

    const [reducedMotion, setReducedMotion] = useState(false);

    // State for password change
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Load settings from localStorage on mount
    // Load settings from currentUser preferences
    useEffect(() => {
        if (currentUser?.preferences) {
            if (currentUser.preferences.notifications) {
                setNotifications(currentUser.preferences.notifications);
            }
            if (currentUser.preferences.reducedMotion !== undefined) {
                setReducedMotion(currentUser.preferences.reducedMotion);
            }
        }
    }, [currentUser]);

    const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleNotificationChange = async (key: keyof typeof notifications) => {
        let newSettings = { ...notifications, [key]: !notifications[key] };

        // If enabling push notifications, request permission
        if (key === 'push' && newSettings.push) {
            if (!("Notification" in window)) {
                toast({
                    title: "Not Supported",
                    description: "This browser does not support desktop notifications.",
                    variant: "destructive"
                });
                return;
            }

            if (Notification.permission !== "granted") {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    // User denied, revert toggle
                    newSettings = { ...notifications, push: false };
                    toast({
                        title: "Permission Denied",
                        description: "Please enable notifications in your browser settings.",
                        variant: "destructive"
                    });
                }
            }
        }

        setNotifications(newSettings);
        // Save to DB
        if (currentUser) {
            try {
                await userService.update(currentUser.id, {
                    preferences: {
                        notifications: newSettings,
                        reducedMotion: reducedMotion
                    }
                });
                await refreshUser();

                toast({
                    title: "Settings Updated",
                    description: `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${newSettings[key] ? 'enabled' : 'disabled'}.`,
                });
            } catch (error) {
                console.error("Failed to save settings", error);
                setNotifications(notifications); // Revert on error
                toast({
                    title: "Error",
                    description: "Failed to save settings to database.",
                    variant: "destructive"
                });
            }
        }
    };

    const handleMotionChange = async (checked: boolean) => {
        setReducedMotion(checked);

        if (currentUser) {
            try {
                await userService.update(currentUser.id, {
                    preferences: {
                        notifications: notifications,
                        reducedMotion: checked
                    }
                });
                await refreshUser();

                toast({
                    title: "Settings Updated",
                    description: `Reduced motion ${checked ? 'enabled' : 'disabled'}.`,
                });
            } catch (error) {
                console.error("Failed to save settings", error);
                setReducedMotion(!checked); // Revert
                toast({
                    title: "Error",
                    description: "Failed to save settings to database.",
                    variant: "destructive"
                });
            }
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.new !== passwords.confirm) {
            toast({
                title: "Passwords don't match",
                description: "New password and confirmation must match.",
                variant: "destructive",
            });
            return;
        }

        if (passwords.new.length < 8) {
            toast({
                title: "Password too short",
                description: "Password must be at least 8 characters long.",
                variant: "destructive",
            });
            return;
        }

        setPasswordLoading(true);
        try {
            await api.post('/change-password', {
                current_password: passwords.current,
                new_password: passwords.new,
                new_password_confirmation: passwords.confirm,
            });

            toast({
                title: "Success",
                description: "Password updated successfully.",
            });
            setPasswords({ current: "", new: "", confirm: "" });
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || "Failed to change password";
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    const togglePasswordVisibility = (key: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-4 fade-in h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex items-center gap-3 mb-2 flex-none">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Settings className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences.</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[250px_1fr] flex-1 overflow-hidden">
                <nav className="hidden md:flex flex-col gap-2 h-full overflow-y-auto pr-2">
                    <Button
                        variant="ghost"
                        className="justify-start hover:bg-accent/50"
                        onClick={() => scrollToSection(appearanceRef)}
                    >
                        <Palette className="mr-2 h-4 w-4" /> Appearance
                    </Button>
                    <Button
                        variant="ghost"
                        className="justify-start hover:bg-accent/50"
                        onClick={() => scrollToSection(notificationsRef)}
                    >
                        <Bell className="mr-2 h-4 w-4" /> Notifications
                    </Button>
                    <Button
                        variant="ghost"
                        className="justify-start hover:bg-accent/50"
                        onClick={() => scrollToSection(securityRef)}
                    >
                        <Lock className="mr-2 h-4 w-4" /> Security
                    </Button>
                </nav>

                <div className="space-y-6 h-full overflow-y-auto pr-6 pb-20">
                    {/* Appearance Section */}
                    <div ref={appearanceRef}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-primary" />
                                    Appearance
                                </CardTitle>
                                <CardDescription>Customize how the application looks for you.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Theme</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Select your preferred color theme.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ThemeToggle />
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Reduced Motion</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Minimize animations in the UI.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={reducedMotion}
                                        onCheckedChange={handleMotionChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notifications Section */}
                    <div ref={notificationsRef}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-primary" />
                                    Notifications
                                </CardTitle>
                                <CardDescription>Configure how you receive alerts.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <Label className="text-base">Email Notifications</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Receive summary emails about your tasks.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.email}
                                        onCheckedChange={() => handleNotificationChange('email')}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Bell className="h-4 w-4 text-muted-foreground" />
                                            <Label className="text-base">Desktop Push Notifications</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Get real-time browser alerts.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.push}
                                        onCheckedChange={() => handleNotificationChange('push')}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                                            <Label className="text-base">WhatsApp Notifications</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Receive urgent updates via WhatsApp.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.whatsapp}
                                        onCheckedChange={() => handleNotificationChange('whatsapp')}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                            <Label className="text-base">Mattermost Notifications</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Get updates in your team's Mattermost channel.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.mattermost}
                                        onCheckedChange={() => handleNotificationChange('mattermost')}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Security Section */}
                    <div ref={securityRef} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-primary" />
                                    Security
                                </CardTitle>
                                <CardDescription>Manage your password and account security.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="current-password"
                                                type={showPasswords.current ? "text" : "password"}
                                                value={passwords.current}
                                                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => togglePasswordVisibility('current')}
                                            >
                                                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                <span className="sr-only">Toggle password visibility</span>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="new-password"
                                                type={showPasswords.new ? "text" : "password"}
                                                value={passwords.new}
                                                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                                                required
                                                minLength={8}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => togglePasswordVisibility('new')}
                                            >
                                                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                <span className="sr-only">Toggle password visibility</span>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirm-password"
                                                type={showPasswords.confirm ? "text" : "password"}
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                                required
                                                minLength={8}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                            >
                                                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                <span className="sr-only">Toggle password visibility</span>
                                            </Button>
                                        </div>
                                        {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
                                            <p className="text-sm text-red-500">Passwords do not match</p>
                                        )}
                                    </div>
                                    <Button type="submit" disabled={passwordLoading}>
                                        {passwordLoading ? "Updating..." : "Update Password"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                        <TwoFactorSection />
                    </div>
                </div>
            </div>
        </div>
    );
}
