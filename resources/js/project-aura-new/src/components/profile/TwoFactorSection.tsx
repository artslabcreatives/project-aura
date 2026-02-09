import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, ShieldAlert, Copy, RefreshCw, KeyRound, Smartphone } from "lucide-react";
import { twoFactorService, SetupTwoFactorResponse } from "@/services/twoFactorService";
import { useUser } from "@/hooks/use-user";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export function TwoFactorSection() {
    const { currentUser, refreshUser } = useUser();
    const { toast } = useToast();

    // States
    const [isLoading, setIsLoading] = useState(false);
    const [showEnableDialog, setShowEnableDialog] = useState(false);
    const [showRecoveryCodesDialog, setShowRecoveryCodesDialog] = useState(false);
    const [showConfirmPasswordDialog, setShowConfirmPasswordDialog] = useState(false);
    const [passwordAction, setPasswordAction] = useState<"disable" | "showCodes" | "regenerate">("disable");

    // Data
    const [setupData, setSetupData] = useState<SetupTwoFactorResponse | null>(null);
    const [confirmCode, setConfirmCode] = useState("");
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [passwordConfirm, setPasswordConfirm] = useState("");

    if (!currentUser) return null;

    const handleEnable2FA = async () => {
        setIsLoading(true);
        try {
            const data = await twoFactorService.enable();
            setSetupData(data);
            setShowEnableDialog(true);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to start 2FA setup.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm2FA = async () => {
        setIsLoading(true);
        try {
            const response = await twoFactorService.confirm(confirmCode);
            await refreshUser();
            setShowEnableDialog(false);
            setRecoveryCodes(response.recovery_codes);
            setShowRecoveryCodesDialog(true);
            setConfirmCode("");
            toast({
                title: "Success",
                description: "Two-factor authentication has been enabled.",
            });
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

    const handlePasswordSubmit = async () => {
        setIsLoading(true);
        try {
            if (passwordAction === "disable") {
                await twoFactorService.disable(passwordConfirm);
                await refreshUser();
                toast({ title: "Success", description: "Two-factor authentication disabled." });
            } else if (passwordAction === "showCodes") {
                const response = await twoFactorService.getRecoveryCodes(passwordConfirm);
                setRecoveryCodes(response.recovery_codes);
                setShowRecoveryCodesDialog(true);
            } else if (passwordAction === "regenerate") {
                const response = await twoFactorService.regenerateRecoveryCodes(passwordConfirm);
                setRecoveryCodes(response.recovery_codes);
                setShowRecoveryCodesDialog(true);
                toast({ title: "Success", description: "Recovery codes regenerated." });
            }
            setShowConfirmPasswordDialog(false);
            setPasswordConfirm("");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Incorrect password or action failed.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const openConfirmPassword = (action: "disable" | "showCodes" | "regenerate") => {
        setPasswordAction(action);
        setShowConfirmPasswordDialog(true);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ description: "Copied to clipboard" });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                    Add an extra layer of security to your account using TOTP apps (like Google Authenticator).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${currentUser.twoFactorEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            {currentUser.twoFactorEnabled ? (
                                <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
                            ) : (
                                <ShieldAlert className="h-6 w-6 text-slate-500" />
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold text-base">
                                {currentUser.twoFactorEnabled ? "2FA is enabled" : "2FA is not enabled"}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 text-pretty max-w-sm">
                                {currentUser.twoFactorEnabled
                                    ? "Your account is protected with two-factor authentication."
                                    : "Secure your account by requiring an authentication code when logging in."}
                            </p>
                        </div>
                    </div>
                    <div>
                        {currentUser.twoFactorEnabled ? (
                            <Button variant="destructive" onClick={() => openConfirmPassword("disable")} disabled={isLoading}>
                                Disable 2FA
                            </Button>
                        ) : (
                            <Button onClick={handleEnable2FA} disabled={isLoading}>
                                Enable 2FA
                            </Button>
                        )}
                    </div>
                </div>

                {currentUser.twoFactorEnabled && (
                    <div className="flex flex-wrap gap-4">
                        <Button variant="outline" onClick={() => openConfirmPassword("showCodes")} disabled={isLoading}>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Show Recovery Codes
                        </Button>
                        <Button variant="outline" onClick={() => openConfirmPassword("regenerate")} disabled={isLoading}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate Recovery Codes
                        </Button>
                    </div>
                )}

                {/* Enable 2FA Dialog */}
                <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                            <DialogDescription>
                                Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.).
                            </DialogDescription>
                        </DialogHeader>
                        {setupData && (
                            <div className="space-y-6 py-4">
                                <div className="flex justify-center p-4 bg-white rounded-lg border w-fit mx-auto">
                                    <div dangerouslySetInnerHTML={{ __html: setupData.qr_code_url }} />
                                    {/* Note: In real production, check if SVG works directly, or use an img tag if backend returns URL.
                                        pragmarx/google2fa usually returns SVG string for QR code if requested properly, 
                                        but currently we return URL. 
                                        Wait, backend returns `qr_code_url` which is likely `otpauth://...`? 
                                        No, `getQRCodeUrl` returns the otpauth string for creating QR code content, NOT the SVG.
                                        
                                        Wait, `getQRCodeUrl` returns the STRING content of the QR code (otpauth://...).
                                        I need to render this string into a QR code.
                                        
                                        Wait, I recall `pragmarx/google2fa` has `getQRCodeInline` if I wanted SVG.
                                        Or I use a frontend QR library.
                                        
                                        Let's check backend implementation:
                                        `$google2fa->getQRCodeUrl(...)` -> returns 'otpauth://totp/App:User?secret=...'
                                        
                                        So I need a frontend component to render QR code from this string.
                                        OR I change backend to return SVG using BaconQrCode Backend Renderer?
                                        
                                        If I installed `bacon/bacon-qr-code`, I can generate SVG in backend.
                                        
                                        Let's stick to frontend rendering or backend SVG generation.
                                        Since I can't install new frontend npm packages easily without user approval for npm install,
                                        I should modify backend to return SVG or Base64 Image.
                                     */}
                                </div>
                                <div className="space-y-2">
                                    <Label>Or enter this code manually:</Label>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-muted p-2 rounded text-sm font-mono flex-1 text-center">
                                            {setupData.secret}
                                        </code>
                                        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(setupData.secret)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Enter the 6-digit code from your app</Label>
                                    <div className="flex justify-center">
                                        <InputOTP
                                            maxLength={6}
                                            value={confirmCode}
                                            onChange={setConfirmCode}
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
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowEnableDialog(false)}>Cancel</Button>
                            <Button onClick={handleConfirm2FA} disabled={!confirmCode || confirmCode.length !== 6 || isLoading}>
                                {isLoading ? "Verifying..." : "Verify & Enable"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Recovery Codes Dialog */}
                <Dialog open={showRecoveryCodesDialog} onOpenChange={setShowRecoveryCodesDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Recovery Codes</DialogTitle>
                            <DialogDescription>
                                Save these codes in a secure place. You can use them to access your account if you lose your authentication device.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="bg-muted p-4 rounded-lg grid grid-cols-2 gap-2 text-center font-mono text-sm">
                            {recoveryCodes.map((code, i) => (
                                <div key={i} className="bg-background p-2 rounded border">{code}</div>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button onClick={() => {
                                const text = recoveryCodes.join("\n");
                                copyToClipboard(text);
                            }}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy All
                            </Button>
                            <Button onClick={() => setShowRecoveryCodesDialog(false)}>Done</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Confirm Password Dialog */}
                <Dialog open={showConfirmPasswordDialog} onOpenChange={setShowConfirmPasswordDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Confirm Password</DialogTitle>
                            <DialogDescription>
                                Please enter your password to confirm this action.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowConfirmPasswordDialog(false)}>Cancel</Button>
                            <Button onClick={handlePasswordSubmit} disabled={!passwordConfirm || isLoading}>
                                {isLoading ? "Confirming..." : "Confirm"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
