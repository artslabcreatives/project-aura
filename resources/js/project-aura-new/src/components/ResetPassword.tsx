import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, KeyRound, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";

interface ResetPasswordProps {
    onBack: () => void;
}



export function ResetPassword({ onBack }: ResetPasswordProps) {
    const { toast } = useToast();
    const [step, setStep] = useState<"email" | "otp" | "password">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Call backend to generate and send OTP
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to send verification code");
            }

            toast({
                title: "Code sent",
                description: "Please check your email for the verification code.",
            });

            setStep("otp");
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to send verification code. Please try again.",
                variant: "destructive",
            });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setIsLoading(true);
        try {
            if (otp.length !== 6) {
                throw new Error("Please enter a valid 6-digit code");
            }

            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Invalid verification code");
            }

            toast({
                title: "Verified",
                description: "Code verified successfully.",
            });

            setStep("password");
        } catch (error) {
            toast({
                title: "Verification Failed",
                description: error instanceof Error ? error.message : "Invalid code",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (newPassword !== confirmPassword) {
                throw new Error("Passwords do not match");
            }

            if (newPassword.length < 8) {
                throw new Error("Password must be at least 8 characters");
            }

            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, otp, password: newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to reset password");
            }

            toast({
                title: "Password Reset Successful",
                description: "You can now login with your new password.",
            });

            onBack();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to reset password",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-[400px] space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
                    {step === "email" && <><KeyRound className="h-8 w-8" /> Reset Password</>}
                    {step === "otp" && <><Mail className="h-8 w-8" /> Verify Email</>}
                    {step === "password" && <><Lock className="h-8 w-8" /> New Password</>}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    {step === "email" && "Enter your email address and we'll send you a code to reset your password."}
                    {step === "otp" && `Enter the 6-digit code sent to ${email}`}
                    {step === "password" && "Create a new strong password for your account."}
                </p>
            </div>

            <div className="mt-4">
                {step === "email" && (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="reset-email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="reset-email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-10 h-11 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 dark:bg-slate-900"
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-lg"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending Code...
                                </>
                            ) : (
                                "Send Verification Code"
                            )}
                        </Button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={onBack}
                                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-1 mx-auto"
                            >
                                <ArrowLeft className="h-4 w-4" /> Back to Login
                            </button>
                        </div>
                    </form>
                )}

                {step === "otp" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={(value) => setOtp(value)}
                                disabled={isLoading}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} className="h-12 w-12" />
                                    <InputOTPSlot index={1} className="h-12 w-12" />
                                    <InputOTPSlot index={2} className="h-12 w-12" />
                                </InputOTPGroup>
                                <div className="mx-2 text-muted-foreground">-</div>
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} className="h-12 w-12" />
                                    <InputOTPSlot index={4} className="h-12 w-12" />
                                    <InputOTPSlot index={5} className="h-12 w-12" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-11"
                                onClick={() => setStep("email")}
                                disabled={isLoading}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button
                                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handleVerifyOtp}
                                disabled={isLoading || otp.length !== 6}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify Code"
                                )}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            <button
                                type="button"
                                className="underline hover:text-blue-600"
                                onClick={handleSendOtp}
                                disabled={isLoading}
                            >
                                Resend Code
                            </button>
                        </div>
                    </div>
                )}

                {step === "password" && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="pl-10 pr-10 h-11 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 dark:bg-slate-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer z-10"
                                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="pl-10 pr-10 h-11 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 dark:bg-slate-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer z-10"
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? (
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
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
