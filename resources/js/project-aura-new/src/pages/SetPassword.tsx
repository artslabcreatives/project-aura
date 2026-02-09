import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { setToken } from '@/lib/api';
import { Loader2, Eye, EyeOff, KeyRound, Check } from 'lucide-react';

export function SetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
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

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
                <Card className="w-full max-w-md shadow-xl">
                    <CardContent className="pt-10 pb-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                            Password Set Successfully!
                        </h2>
                        <p className="text-muted-foreground">
                            Redirecting you to the dashboard...
                        </p>
                        <Loader2 className="h-5 w-5 animate-spin mt-4 text-primary" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome to Aura!</CardTitle>
                    <CardDescription>
                        You've been invited to join Aura. Please set your password to get started.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email || ''}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your new password"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Password must be at least 8 characters long
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading || !token || !email}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Set Password & Continue
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
