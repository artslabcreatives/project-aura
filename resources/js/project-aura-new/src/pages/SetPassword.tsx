import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api, setToken } from '@/lib/api';
import { Loader2, Eye, EyeOff, Lock, Check } from 'lucide-react';
import loginImage from '@/assets/login-ui.jpg';
import Logo from '@/assets/Logo.png';

export function SetPassword() {
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            toast({
                title: 'Invalid Link',
                description: 'The password reset link is invalid or incomplete.',
                variant: 'destructive',
            });
        }
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: 'Passwords do not match',
                description: 'Please make sure both passwords are the same.',
                variant: 'destructive',
            });
            return;
        }

        if (password.length < 8) {
            toast({
                title: 'Password too short',
                description: 'Password must be at least 8 characters long.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post<{ message: string; token: string }>('/set-password', {
                email,
                token,
                password,
                password_confirmation: confirmPassword,
            });

            // Save the auth token
            setToken(response.token);

            setIsSuccess(true);
            toast({
                title: 'Success!',
                description: 'Your password has been set. Redirecting to dashboard...',
            });

            // Redirect to home after a short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);

        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to set password. The link may be invalid or expired.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Success Screen
    if (isSuccess) {
        return (
            <div className="min-h-screen w-full lg:grid lg:grid-cols-2 overflow-hidden bg-background">
                {/* Left Side - Image and Branding */}
                <div className="hidden lg:relative lg:flex h-full w-full bg-zinc-900 items-center justify-center p-12">
                    <div className="absolute inset-0 z-0">
                        <img
                            src={loginImage}
                            alt="Project Aura Illustration"
                            className="h-full w-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                    </div>
                    <div className="relative z-10 mt-auto w-full max-w-lg mb-12">
                        <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Aura Task Management System</h2>
                        <p className="text-lg text-slate-200 leading-relaxed">
                            Manage your projects, track tasks, and collaborate
                            with your team efficiently in one unified workspace.
                        </p>
                    </div>
                </div>

                {/* Right Side - Success Message */}
                <div className="flex items-center justify-center p-8 lg:p-12 bg-white dark:bg-slate-950">
                    <div className="mx-auto w-full max-w-[400px] space-y-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">
                            Password Set Successfully!
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Redirecting you to the dashboard...
                        </p>
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                    </div>
                </div>
            </div>
        );
    }

    // Main Form
    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 overflow-hidden bg-background">
            {/* Left Side - Image and Branding */}
            <div className="hidden lg:relative lg:flex h-full w-full bg-zinc-900 items-center justify-center p-12">
                {/* Background Illustration */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={loginImage}
                        alt="Project Aura Illustration"
                        className="h-full w-full object-cover opacity-90"
                    />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                </div>

                {/* Branding Text */}
                <div className="relative z-10 mt-auto w-full max-w-lg mb-12">
                    <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Aura Task Management System</h2>
                    <p className="text-lg text-slate-200 leading-relaxed">
                        Manage your projects, track tasks, and collaborate
                        with your team efficiently in one unified workspace.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 lg:p-12 bg-white dark:bg-slate-950">
                <div className="mx-auto w-full max-w-[400px] space-y-8">
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-4">
                            <img src={Logo} alt="Aura Logo" className="h-20 w-auto object-contain" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Welcome to Aura!
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            You've been invited to join. Please set your password to get started.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email || ''}
                                disabled
                                className="h-11 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your new password"
                                    required
                                    minLength={8}
                                    className="pl-10 pr-10 h-11 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 dark:bg-slate-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer z-10"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Password must be at least 8 characters long
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your new password"
                                    required
                                    className="pl-10 h-11 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 dark:bg-slate-900"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-lg"
                            disabled={isLoading || !token || !email}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Setting Password...
                                </div>
                            ) : "Set Password & Continue"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
