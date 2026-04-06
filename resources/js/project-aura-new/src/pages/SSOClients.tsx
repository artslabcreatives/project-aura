import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, RefreshCw, Eye, EyeOff, Copy, Globe, Shield, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    OAuthClient,
    CreateClientPayload,
    listClients,
    createClient,
    updateClient,
    deleteClient,
    regenerateSecret,
} from '@/services/ssoService';

const ALL_SCOPES = ['openid', 'profile', 'email'] as const;

function SecretDisplay({ secret }: { secret: string }) {
    const [visible, setVisible] = useState(false);
    const { toast } = useToast();
    const copy = () => { navigator.clipboard.writeText(secret); toast({ title: 'Copied to clipboard' }); };
    return (
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3">
            <code className="flex-1 text-sm font-mono text-amber-800 dark:text-amber-300 break-all">
                {visible ? secret : '•'.repeat(Math.min(secret.length, 32))}
            </code>
            <button onClick={() => setVisible(!visible)} className="text-amber-600 hover:text-amber-800 shrink-0">
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button onClick={copy} className="text-amber-600 hover:text-amber-800 shrink-0">
                <Copy className="h-4 w-4" />
            </button>
        </div>
    );
}

interface ClientFormState {
    name: string;
    redirect_uris: string; // newline-separated
    allowed_scopes: string[];
    is_confidential: boolean;
    description: string;
    logo_url: string;
    homepage_url: string;
}

const defaultForm = (): ClientFormState => ({
    name: '',
    redirect_uris: '',
    allowed_scopes: ['openid', 'profile', 'email'],
    is_confidential: true,
    description: '',
    logo_url: '',
    homepage_url: '',
});

export default function SSOClients() {
    const { toast } = useToast();
    const [clients, setClients] = useState<OAuthClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState<OAuthClient | null>(null);
    const [form, setForm] = useState<ClientFormState>(defaultForm());
    const [saving, setSaving] = useState(false);
    const [newSecret, setNewSecret] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<OAuthClient | null>(null);
    const [revokeTarget, setRevokeTarget] = useState<OAuthClient | null>(null);
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => { load(); }, []);

    async function load() {
        try {
            setClients(await listClients());
        } catch {
            toast({ title: 'Failed to load SSO clients', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }

    function openCreate() {
        setEditingClient(null);
        setForm(defaultForm());
        setNewSecret(null);
        setShowForm(true);
    }

    function openEdit(client: OAuthClient) {
        setEditingClient(client);
        setForm({
            name: client.name,
            redirect_uris: (client.redirect_uris ?? []).join('\n'),
            allowed_scopes: client.allowed_scopes ?? [...ALL_SCOPES],
            is_confidential: client.is_confidential,
            description: client.description ?? '',
            logo_url: client.logo_url ?? '',
            homepage_url: client.homepage_url ?? '',
        });
        setNewSecret(null);
        setShowForm(true);
    }

    async function handleSave() {
        const uris = form.redirect_uris.split('\n').map((u) => u.trim()).filter(Boolean);
        if (!form.name.trim()) return toast({ title: 'Name is required', variant: 'destructive' });
        if (uris.length === 0) return toast({ title: 'At least one redirect URI is required', variant: 'destructive' });

        const payload: CreateClientPayload = {
            name: form.name.trim(),
            redirect_uris: uris,
            allowed_scopes: form.allowed_scopes,
            is_confidential: form.is_confidential,
            description: form.description.trim() || undefined,
            logo_url: form.logo_url.trim() || undefined,
            homepage_url: form.homepage_url.trim() || undefined,
        };

        setSaving(true);
        try {
            if (editingClient) {
                const updated = await updateClient(editingClient.id, payload);
                setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                toast({ title: 'Client updated' });
                setShowForm(false);
            } else {
                const created = await createClient(payload);
                setClients((prev) => [created, ...prev]);
                if (created.client_secret) {
                    setNewSecret(created.client_secret);
                } else {
                    setShowForm(false);
                }
                toast({ title: 'Client created' });
            }
        } catch (err: any) {
            toast({ title: 'Save failed', description: err.response?.data?.message ?? err.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        try {
            await deleteClient(deleteTarget.id);
            setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
            toast({ title: 'Client deleted' });
        } catch {
            toast({ title: 'Delete failed', variant: 'destructive' });
        } finally {
            setDeleteTarget(null);
        }
    }

    async function handleRegenerateSecret(client: OAuthClient) {
        setRevokeTarget(client);
    }

    async function confirmRegenerate() {
        if (!revokeTarget) return;
        setRegenerating(true);
        try {
            const { client_secret } = await regenerateSecret(revokeTarget.id);
            setNewSecret(client_secret);
            setEditingClient(revokeTarget);
            setShowForm(true);
            toast({ title: 'Secret regenerated. All existing tokens revoked.' });
        } catch {
            toast({ title: 'Failed to regenerate secret', variant: 'destructive' });
        } finally {
            setRegenerating(false);
            setRevokeTarget(null);
        }
    }

    async function toggleActive(client: OAuthClient) {
        try {
            const updated = await updateClient(client.id, { is_active: !client.is_active });
            setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        } catch {
            toast({ title: 'Update failed', variant: 'destructive' });
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SSO Applications</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage applications that can use Aurai as their identity provider.
                    </p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" /> New Application
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : clients.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Shield className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-1">No SSO applications</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Register an application to allow users to sign in with Aurai.
                        </p>
                        <Button onClick={openCreate} variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" /> Register Application
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {clients.map((client) => (
                        <Card key={client.id} className={!client.is_active ? 'opacity-60' : ''}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 min-w-0">
                                        {client.logo_url ? (
                                            <img src={client.logo_url} alt={client.name} className="h-10 w-10 rounded-lg object-contain border border-slate-200 dark:border-slate-700 shrink-0 p-1" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <Globe className="h-5 w-5 text-slate-400" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-slate-900 dark:text-white">{client.name}</span>
                                                <Badge variant={client.is_active ? 'default' : 'secondary'} className="text-xs">
                                                    {client.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {client.is_confidential ? 'Confidential' : 'Public'}
                                                </Badge>
                                            </div>
                                            {client.description && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{client.description}</p>
                                            )}
                                            <div className="mt-2 space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-slate-400">Client ID:</span>
                                                    <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{client.client_id}</code>
                                                    <button onClick={() => { navigator.clipboard.writeText(client.client_id); toast({ title: 'Copied' }); }} className="text-slate-400 hover:text-slate-600">
                                                        <Copy className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(client.allowed_scopes ?? ALL_SCOPES).map((s) => (
                                                        <Badge key={s} variant="outline" className="text-xs py-0">{s}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Switch
                                            checked={client.is_active}
                                            onCheckedChange={() => toggleActive(client)}
                                            title={client.is_active ? 'Disable' : 'Enable'}
                                        />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(client)}>Edit</DropdownMenuItem>
                                                {client.is_confidential && (
                                                    <DropdownMenuItem onClick={() => handleRegenerateSecret(client)}>
                                                        Regenerate secret
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setDeleteTarget(client)}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={showForm} onOpenChange={(open) => { if (!open && !saving) { setShowForm(false); setNewSecret(null); } }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingClient ? 'Edit Application' : 'Register Application'}</DialogTitle>
                        <DialogDescription>
                            {editingClient ? 'Update the application settings.' : 'Register a new application to use Aurai SSO.'}
                        </DialogDescription>
                    </DialogHeader>

                    {newSecret ? (
                        <div className="py-2">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Client secret — copy it now, it won't be shown again.
                            </p>
                            <SecretDisplay secret={newSecret} />
                            <p className="text-xs text-slate-500 mt-2">
                                Client ID: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{editingClient?.client_id ?? clients[0]?.client_id}</code>
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label>Application name *</Label>
                                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My App" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Redirect URIs * <span className="text-slate-400 font-normal">(one per line)</span></Label>
                                <textarea
                                    value={form.redirect_uris}
                                    onChange={(e) => setForm({ ...form, redirect_uris: e.target.value })}
                                    placeholder="https://myapp.com/auth/callback"
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Allowed scopes</Label>
                                <div className="flex gap-4">
                                    {ALL_SCOPES.map((scope) => (
                                        <label key={scope} className="flex items-center gap-1.5 cursor-pointer text-sm">
                                            <input
                                                type="checkbox"
                                                checked={form.allowed_scopes.includes(scope)}
                                                onChange={(e) => {
                                                    setForm((f) => ({
                                                        ...f,
                                                        allowed_scopes: e.target.checked
                                                            ? [...f.allowed_scopes, scope]
                                                            : f.allowed_scopes.filter((s) => s !== scope),
                                                    }));
                                                }}
                                                className="rounded"
                                            />
                                            {scope}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Description</Label>
                                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description shown on consent screen" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Logo URL</Label>
                                    <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Homepage URL</Label>
                                    <Input value={form.homepage_url} onChange={(e) => setForm({ ...form, homepage_url: e.target.value })} placeholder="https://..." />
                                </div>
                            </div>
                            {!editingClient && (
                                <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Confidential client</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Requires a client secret (server-side apps). Uncheck for SPAs / mobile apps using PKCE only.</p>
                                    </div>
                                    <Switch
                                        checked={form.is_confidential}
                                        onCheckedChange={(v) => setForm({ ...form, is_confidential: v })}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        {newSecret ? (
                            <Button onClick={() => { setShowForm(false); setNewSecret(null); }}>Done</Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {editingClient ? 'Save changes' : 'Create application'}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the application and revoke all issued tokens. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Regenerate secret confirmation */}
            <AlertDialog open={!!revokeTarget} onOpenChange={(open) => { if (!open) setRevokeTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Regenerate client secret?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will invalidate the current secret and revoke all active tokens for <strong>{revokeTarget?.name}</strong>. Users will need to re-authenticate.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRegenerate} disabled={regenerating}>
                            {regenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2 inline" /> : null}
                            Regenerate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
