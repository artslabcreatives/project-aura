import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api, setToken } from "@/lib/api";
import { useUser } from "@/hooks/use-user";
import { REGEXP_ONLY_DIGITS } from "input-otp";

interface TwoFactorChallengeProps {
    email: string;
    // Password is required because we need to send it again (stateless API)
    // If Login component sends plain password, we should receive plain password here. 
    // Or we pass the callback to Login component to handle the final login call.
    passwordPlain: string;
    onSuccess: () => void;
}

export function TwoFactorChallenge({ email, passwordPlain, onSuccess }: TwoFactorChallengeProps) {
    const { toast } = useToast();
    const { refreshUser } = useUser();
    const [code, setCode] = useState("");
    const [recoveryCode, setRecoveryCode] = useState("");
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                email,
                password: passwordPlain,
                two_factor_code: !useRecoveryCode ? code : undefined,
                two_factor_recovery_code: useRecoveryCode ? recoveryCode : undefined,
            };

            const response = await api.post<{ token: string; user: any; force_password_reset: boolean; }>('/login', payload);

            setToken(response.token);
            await refreshUser();

            toast({
                title: "Login successful",
                description: "Two-factor authentication verified.",
            });

            onSuccess();
        } catch (error: any) {
            toast({
                title: "Verification failed",
                description: error.message || "Invalid code. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-[400px] space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Two-Factor Authentication</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {useRecoveryCode
                        ? "Please enter one of your emergency recovery codes."
                        : "Please enter the authentication code from your authenticator app."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!useRecoveryCode ? (
                    <div className="flex justify-center py-4">
                        <InputOTP
                            maxLength={6}
                            value={code}
                            onChange={(value) => setCode(value)}
                            pattern={REGEXP_ONLY_DIGITS}
                            render={({ slots }) => (
                                <InputOTPGroup>
                                    {slots.map((slot, index) => (
                                        <InputOTPSlot key={index} index={index} {...slot} />
                                    ))}
                                </InputOTPGroup>
                            )}
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="recovery_code">Recovery Code</Label>
                        <Input
                            id="recovery_code"
                            type="text"
                            placeholder="Recover Code"
                            value={recoveryCode}
                            onChange={(e) => setRecoveryCode(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading || (!useRecoveryCode && code.length !== 6) || (useRecoveryCode && !recoveryCode)}>
                    {isLoading ? "Verifying..." : "Verify"}
                </Button>
            </form>

            <div className="text-center">
                <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
                    onClick={() => {
                        setUseRecoveryCode(!useRecoveryCode);
                        setCode("");
                        setRecoveryCode("");
                    }}
                >
                    {useRecoveryCode
                        ? "Use authentication code instead"
                        : "Use recovery code instead"}
                </button>
            </div>
        </div>
    );
}
