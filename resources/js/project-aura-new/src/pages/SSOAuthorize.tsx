import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { setToken, getToken } from '@/lib/api';
import { validateAuthorize, approveAuthorize, SSOClientInfo } from '@/services/ssoService';
import Logo from '@/assets/Logo.png';
import { Eye, EyeOff, ShieldCheck, Globe, Mail, User, AlertCircle, Loader2 } from 'lucide-react';

const SCOPE_LABELS: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
    openid:  { label: 'Identity',     description: 'Know who you are',                  icon: <ShieldCheck className="h-4 w-4" /> },
    profile: { label: 'Profile',      description: 'Access your name and profile picture', icon: <User className="h-4 w-4" /> },
    email:   { label: 'Email address', description: 'Access your email address',          icon: <Mail className="h-4 w-4" /> },
};

export default function SSOAuthorize() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);

    // OAuth state
    const [clientInfo, setClientInfo] = useState<SSOClientInfo | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [authorizing, setAuthorizing] = useState(false);
    const [validating, setValidating] = useState(false);

    const oauthParams = {
        client_id:             searchParams.get('client_id') ?? '',
        redirect_uri:          searchParams.get('redirect_uri') ?? '',
        response_type:         searchParams.get('response_type') ?? 'code',
        scope:                 searchParams.get('scope') ?? 'openid',
        state:                 searchParams.get('state') ?? '',
        code_challenge:        searchParams.get('code_challenge') ?? '',
        code_challenge_method: searchParams.get('code_challenge_method') ?? '',
    };

    // Check auth on mount
    useEffect(() => {
        const token = getToken();
        setIsAuthenticated(!!token);
    }, []);

    // Validate OAuth request once authenticated
    useEffect(() => {
        if (isAuthenticated !== true) return;
        if (!oauthParams.client_id || !oauthParams.redirect_uri) {
            setLoadError('Missing required OAuth parameters (client_id, redirect_uri).');
            return;
        }

        setValidating(true);
        const params: Record<string, string> = {};
        Object.entries(oauthParams).forEach(([k, v]) => { if (v) params[k] = v; });

        validateAuthorize(params)
            .then(setClientInfo)
            .catch((err) => {
                const msg = err.response?.data?.error ?? 'Invalid authorization request.';
                setLoadError(msg);
            })
            .finally(() => setValidating(false));
    }, [isAuthenticated]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');
            if (data.two_factor) {
                toast({ title: 'Two-factor required', description: 'Please log in via the main app first, then return here.', variant: 'destructive' });
                return;
            }
            setToken(data.token);
            setIsAuthenticated(true);
        } catch (err: any) {
            toast({ title: 'Login failed', description: err.message, variant: 'destructive' });
        } finally {
            setLoginLoading(false);
        }
    };

    const handleDecision = async (approved: boolean) => {
        setAuthorizing(true);
        try {
            const payload: any = {
                client_id:    oauthParams.client_id,
                redirect_uri: oauthParams.redirect_uri,
                scope:        oauthParams.scope,
                approved,
            };
            if (oauthParams.state)                 payload.state = oauthParams.state;
            if (oauthParams.code_challenge)        payload.code_challenge = oauthParams.code_challenge;
            if (oauthParams.code_challenge_method) payload.code_challenge_method = oauthParams.code_challenge_method;

            const { redirect_to } = await approveAuthorize(payload);
            window.location.href = redirect_to;
        } catch (err: any) {
            toast({ title: 'Authorization failed', description: err.response?.data?.error ?? err.message, variant: 'destructive' });
            setAuthorizing(false);
        }
    };

    // ── Loading / error states ──────────────────────────────────────────────

    if (!oauthParams.client_id) {
        return <ErrorScreen message="Missing client_id parameter." />;
    }

    // Not yet determined
    if (isAuthenticated === null) {
        return <LoadingScreen />;
    }

    // ── Login screen ────────────────────────────────────────────────────────

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
                    <div className="flex justify-center mb-6">
                        <img src={Logo} alt="Aurai" className="h-10" />
                    </div>
                    <h1 className="text-xl font-semibold text-center text-slate-900 dark:text-white mb-1">Sign in to continue</h1>
                    <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
                        An application is requesting access to your Aurai account.
                    </p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loginLoading}>
                            {loginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Sign in
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    // ── Validating / loading client info ────────────────────────────────────

    if (validating) return <LoadingScreen />;

    if (loadError) return <ErrorScreen message={loadError} />;

    if (!clientInfo) return <LoadingScreen />;

    // ── Consent screen ──────────────────────────────────────────────────────

    const scopes = clientInfo.scopes.filter((s) => s !== 'openid');

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        {clientInfo.client.logo_url ? (
                            <img src={clientInfo.client.logo_url} alt={clientInfo.client.name} className="h-12 w-12 rounded-xl object-contain border border-slate-200 dark:border-slate-700 p-1" />
                        ) : (
                            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Globe className="h-6 w-6 text-slate-400" />
                            </div>
                        )}
                        <div className="text-slate-400 dark:text-slate-500 text-2xl font-light">↔</div>
                        <img src={Logo} alt="Aurai" className="h-10" />
                    </div>

                    <h1 className="text-lg font-semibold text-center text-slate-900 dark:text-white">
                        <span className="text-primary">{clientInfo.client.name}</span> is requesting access
                    </h1>
                    {clientInfo.client.description && (
                        <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-1">{clientInfo.client.description}</p>
                    )}
                    {clientInfo.client.homepage_url && (
                        <a
                            href={clientInfo.client.homepage_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-center text-primary hover:underline mt-1"
                        >
                            {clientInfo.client.homepage_url}
                        </a>
                    )}
                </div>

                {/* Scopes */}
                <div className="px-8 py-5">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        This application will be able to:
                    </p>
                    <ul className="space-y-2">
                        {/* openid is always implied */}
                        {Object.entries(SCOPE_LABELS)
                            .filter(([key]) => clientInfo.scopes.includes(key))
                            .map(([key, { label, description, icon }]) => (
                                <li key={key} className="flex items-start gap-3 text-sm">
                                    <span className="mt-0.5 text-primary">{icon}</span>
                                    <span>
                                        <strong className="text-slate-800 dark:text-slate-200">{label}</strong>
                                        <span className="text-slate-500 dark:text-slate-400"> — {description}</span>
                                    </span>
                                </li>
                            ))}
                    </ul>

                    <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                        Authorizing will redirect you to <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">{new URL(clientInfo.redirect_uri).hostname}</code>.
                    </p>
                </div>

                {/* Actions */}
                <div className="px-8 pb-8 flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDecision(false)}
                        disabled={authorizing}
                    >
                        Deny
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={() => handleDecision(true)}
                        disabled={authorizing}
                    >
                        {authorizing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Allow access
                    </Button>
                </div>
            </div>
        </div>
    );
}

function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}

function ErrorScreen({ message }: { message: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="max-w-sm w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-red-200 dark:border-red-900 p-8 text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                <h2 className="font-semibold text-slate-900 dark:text-white mb-1">Authorization Error</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
            </div>
        </div>
    );
}
