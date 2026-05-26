import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { setToken } from "@/lib/api";
import loginImage from "@/assets/login-ui.jpg";
import Logo from "@/assets/Logo.png";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { ChangePassword } from "./ChangePassword";
import { TwoFactorChallenge } from "./TwoFactorChallenge";

interface LoginProps {
	onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
	const { toast } = useToast();
	const [showChangePassword, setShowChangePassword] = useState(false);
	const [showTwoFactor, setShowTwoFactor] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	useEffect(() => {
		const token = searchParams.get('token');
		const error = searchParams.get('error');

		if (token) {
			setToken(token);
			toast({
				title: "Login successful",
				description: "Welcome back to Aura!",
			});
			onLoginSuccess();
			navigate('/', { replace: true });
		}

		if (error) {
			let message = "Google authentication failed";
			if (error === 'unauthorized_email') {
				message = "This email is not authorized to access Aura. Please contact your administrator.";
			}
			toast({
				title: "Authentication failed",
				description: message,
				variant: "destructive",
			});
		}
	}, [searchParams]);

	const handleGoogleLogin = () => {
		window.location.href = '/api/auth/google';
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await fetch('/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Login failed');
			}

			const data = await response.json();

			// Check if 2FA is required
			if (data.two_factor) {
				setShowTwoFactor(true);
				return;
			}

			// Store the bearer token
			setToken(data.token);

			// Check if user needs to reset password
			if (data.force_password_reset) {
				toast({
					title: "Password Change Required",
					description: "Please set a new password before continuing.",
				});
				setShowChangePassword(true);
			} else {
				toast({
					title: "Login successful",
					description: "Welcome back to Aura!",
				});
				onLoginSuccess();
			}
		} catch (error) {
			toast({
				title: "Login failed",
				description: error instanceof Error ? error.message : "Invalid credentials",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handlePasswordChangeSuccess = () => {
		setShowChangePassword(false);
		toast({
			title: "Password updated",
			description: "Welcome to Aura!",
		});
		onLoginSuccess();
	};

	// Show change password screen if needed
	if (showChangePassword) {
		return <ChangePassword onSuccess={handlePasswordChangeSuccess} />;
	}

	// Show 2FA screen if needed
	if (showTwoFactor) {
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

				{/* Right Side - Verify 2FA */}
				<div className="flex items-center justify-center p-8 lg:p-12 bg-white dark:bg-slate-950">
					<TwoFactorChallenge
						email={email}
						passwordPlain={password}
						onSuccess={onLoginSuccess}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen w-full lg:grid lg:grid-cols-2 overflow-hidden bg-background">
			{/* Same left side for consistency, reused code would be better but keeping it simple for replace */}
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
					{/* Title Section */}
					<div className="text-center space-y-2">
						<div className="flex justify-center mb-4">
							<img src={Logo} alt="Aura Logo" className="h-20 w-auto object-contain" />
						</div>
						<h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
							Welcome back
						</h1>
						<p className="text-slate-500 dark:text-slate-400">
							Enter your email to sign in to your account
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Email Input */}
						<div className="space-y-2">
							<Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
								<Input
									id="email"
									type="email"
									placeholder="name@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={isLoading}
									className="pl-10 h-11 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 dark:bg-slate-900"
								/>
							</div>
						</div>
						{/* Password input */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
								<Link
									to="/reset-password"
									className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
								>
									Reset Password
								</Link>
							</div>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={isLoading}
									className="pl-10 pr-10 h-11 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 dark:bg-slate-900"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer z-10"
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>
						<Button
							type="submit"
							className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-lg"
							disabled={isLoading}
						>
							{isLoading ? (
								<div className="flex items-center gap-2">
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
									Signing in...
								</div>
							) : "Sign In"}
						</Button>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-white dark:bg-slate-950 px-2 text-slate-500">Or continue with</span>
							</div>
						</div>

						<Button
							type="button"
							variant="outline"
							className="w-full h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
							onClick={handleGoogleLogin}
							disabled={isLoading}
						>
							<svg className="h-5 w-5" viewBox="0 0 24 24">
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
								<path d="M1 1h22v22H1z" fill="none" />
							</svg>
							Sign in with Google
						</Button>
					</form>

					<div className="text-center">
						<p className="text-sm text-slate-500 dark:text-slate-400">
							Don't have an account?{" "}
							<a
								href="#"
								className="font-medium text-slate-900 dark:text-slate-100 underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
								onClick={(e) => e.preventDefault()}
							>
								Contact Admin
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
