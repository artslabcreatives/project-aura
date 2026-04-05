import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, RefreshCw, ExternalLink, FileText, Receipt, Users } from 'lucide-react';
import { api } from '../lib/api';
import { XeroStatus } from '../types/financial';
import { useToast } from '../hooks/use-toast';

export function XeroIntegration() {
	const [status, setStatus] = useState<XeroStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [syncing, setSyncing] = useState(false);
	const [syncingClients, setSyncingClients] = useState(false);
	const [syncingInvoices, setSyncingInvoices] = useState(false);
	const { toast } = useToast();

	const fetchStatus = async () => {
		try {
			setLoading(true);
			const response = await api.get<XeroStatus>('/xero/status');
			setStatus(response);
		} catch (error) {
			console.error('Failed to fetch Xero status:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleConnect = async () => {
		try {
			const response = await api.get<{ url: string }>('/xero/auth-url');
			window.location.href = response.url;
		} catch (error) {
			console.error('Failed to get Xero auth URL:', error);
			toast({
				title: 'Error',
				description: 'Failed to connect to Xero',
				variant: 'destructive',
			});
		}
	};

	const handleSync = async () => {
		try {
			setSyncing(true);
			const response = await api.post<{ created: number; updated: number }>('/xero/sync', {});
			await fetchStatus();
			toast({
				title: 'Success',
				description: `Synced ${response.created} new estimates and updated ${response.updated} existing ones`,
			});
		} catch (error: any) {
			console.error('Failed to sync with Xero:', error);
			toast({
				title: 'Error',
				description: error.response?.data?.message || 'Failed to sync estimates',
				variant: 'destructive',
			});
		} finally {
			setSyncing(false);
		}
	};

	const handleSyncClients = async () => {
		try {
			setSyncingClients(true);
			const response = await api.post<{ created: number; merged: number; already_linked: number }>('/xero/sync-clients', {});
			await fetchStatus();
			toast({
				title: 'Success',
				description: `Clients synced — ${response.created} created, ${response.merged} auto-merged`,
			});
		} catch (error: any) {
			console.error('Failed to sync clients from Xero:', error);
			toast({
				title: 'Error',
				description: error.response?.data?.message || 'Failed to sync clients',
				variant: 'destructive',
			});
		} finally {
			setSyncingClients(false);
		}
	};

	const handleSyncInvoices = async () => {
		try {
			setSyncingInvoices(true);
			const response = await api.post<{ synced: number }>('/xero/sync-invoices', {});
			await fetchStatus();
			toast({
				title: 'Success',
				description: `Synced ${response.synced} invoices from Xero`,
			});
		} catch (error: any) {
			console.error('Failed to sync invoices with Xero:', error);
			toast({
				title: 'Error',
				description: error.response?.data?.message || 'Failed to sync invoices',
				variant: 'destructive',
			});
		} finally {
			setSyncingInvoices(false);
		}
	};

	useEffect(() => {
		fetchStatus();
	}, []);

	if (loading) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Xero Integration</CardTitle>
					<CardDescription>Loading...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const isBusy = syncing || syncingClients || syncingInvoices;

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Xero Integration</CardTitle>
						<CardDescription>Sync invoices with Xero accounting system</CardDescription>
					</div>
					{status?.connected ? (
						<Badge variant="default" className="bg-green-500">
							<CheckCircle className="mr-1 h-3 w-3" />
							Connected
						</Badge>
					) : (
						<Badge variant="secondary">
							<XCircle className="mr-1 h-3 w-3" />
							Not Connected
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{status?.connected && (
					<div className="space-y-2 text-sm">
						{status.tenantId && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Tenant ID:</span>
								<span className="font-mono">{status.tenantId.substring(0, 12)}...</span>
							</div>
						)}
						{status.lastSyncedAt && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Last Synced:</span>
								<span>{new Date(status.lastSyncedAt).toLocaleString()}</span>
							</div>
						)}
						{status.tokenExpiresAt && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Token Expires:</span>
								<span>{new Date(status.tokenExpiresAt).toLocaleString()}</span>
							</div>
						)}
					</div>
				)}

				{!status?.connected && (
					<div className="text-sm text-muted-foreground">
						Connect your Xero account to automatically sync estimates and invoices.
					</div>
				)}
			</CardContent>
			<CardFooter className="flex gap-2 flex-wrap">
				{status?.connected ? (
					<>
						<Button onClick={handleSyncClients} disabled={isBusy} className="flex-1">
							<Users className={`mr-2 h-4 w-4 ${syncingClients ? 'animate-spin' : ''}`} />
							{syncingClients ? 'Syncing Clients...' : 'Sync Clients'}
						</Button>
						<Button onClick={handleSync} disabled={isBusy} className="flex-1">
							<FileText className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
							{syncing ? 'Syncing Estimates...' : 'Sync Estimates'}
						</Button>
						<Button onClick={handleSyncInvoices} disabled={isBusy} className="flex-1">
							<Receipt className={`mr-2 h-4 w-4 ${syncingInvoices ? 'animate-spin' : ''}`} />
							{syncingInvoices ? 'Syncing Invoices...' : 'Sync Invoices'}
						</Button>
						<Button onClick={handleConnect} variant="outline" className="w-full sm:w-auto">
							<ExternalLink className="mr-2 h-4 w-4" />
							Reconnect
						</Button>
					</>
				) : (
					<Button onClick={handleConnect} className="flex-1">
						<ExternalLink className="mr-2 h-4 w-4" />
						Connect to Xero
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}


export function XeroIntegration() {
	const [status, setStatus] = useState<XeroStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [syncing, setSyncing] = useState(false);
	const [syncingInvoices, setSyncingInvoices] = useState(false);
	const { toast } = useToast();

	const fetchStatus = async () => {
		try {
			setLoading(true);
			const response = await api.get<XeroStatus>('/xero/status');
			setStatus(response);
		} catch (error) {
			console.error('Failed to fetch Xero status:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleConnect = async () => {
		try {
			const response = await api.get<{ url: string }>('/xero/auth-url');
			window.location.href = response.url;
		} catch (error) {
			console.error('Failed to get Xero auth URL:', error);
			toast({
				title: 'Error',
				description: 'Failed to connect to Xero',
				variant: 'destructive',
			});
		}
	};

	const handleSync = async () => {
		try {
			setSyncing(true);
			const response = await api.post<{ created: number; updated: number }>('/xero/sync', {});
			await fetchStatus();
			toast({
				title: 'Success',
				description: `Synced ${response.created} new estimates and updated ${response.updated} existing ones`,
			});
		} catch (error: any) {
			console.error('Failed to sync with Xero:', error);
			toast({
				title: 'Error',
				description: error.response?.data?.message || 'Failed to sync estimates',
				variant: 'destructive',
			});
		} finally {
			setSyncing(false);
		}
	};

	const handleSyncInvoices = async () => {
		try {
			setSyncingInvoices(true);
			const response = await api.post<{ synced: number }>('/xero/sync-invoices', {});
			await fetchStatus();
			toast({
				title: 'Success',
				description: `Synced ${response.synced} invoices from Xero`,
			});
		} catch (error: any) {
			console.error('Failed to sync invoices with Xero:', error);
			toast({
				title: 'Error',
				description: error.response?.data?.message || 'Failed to sync invoices',
				variant: 'destructive',
			});
		} finally {
			setSyncingInvoices(false);
		}
	};

	useEffect(() => {
		fetchStatus();
	}, []);

	if (loading) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Xero Integration</CardTitle>
					<CardDescription>Loading...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Xero Integration</CardTitle>
						<CardDescription>Sync invoices with Xero accounting system</CardDescription>
					</div>
					{status?.connected ? (
						<Badge variant="default" className="bg-green-500">
							<CheckCircle className="mr-1 h-3 w-3" />
							Connected
						</Badge>
					) : (
						<Badge variant="secondary">
							<XCircle className="mr-1 h-3 w-3" />
							Not Connected
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{status?.connected && (
					<div className="space-y-2 text-sm">
						{status.tenantId && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Tenant ID:</span>
								<span className="font-mono">{status.tenantId.substring(0, 12)}...</span>
							</div>
						)}
						{status.lastSyncedAt && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Last Synced:</span>
								<span>{new Date(status.lastSyncedAt).toLocaleString()}</span>
							</div>
						)}
						{status.tokenExpiresAt && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Token Expires:</span>
								<span>{new Date(status.tokenExpiresAt).toLocaleString()}</span>
							</div>
						)}
					</div>
				)}

				{!status?.connected && (
					<div className="text-sm text-muted-foreground">
						Connect your Xero account to automatically sync estimates and invoices.
					</div>
				)}
			</CardContent>
			<CardFooter className="flex gap-2 flex-wrap">
				{status?.connected ? (
					<>
						<Button onClick={handleSync} disabled={syncing || syncingInvoices} className="flex-1">
							<FileText className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
							{syncing ? 'Syncing Estimates...' : 'Sync Estimates'}
						</Button>
						<Button onClick={handleSyncInvoices} disabled={syncing || syncingInvoices} className="flex-1">
							<Receipt className={`mr-2 h-4 w-4 ${syncingInvoices ? 'animate-spin' : ''}`} />
							{syncingInvoices ? 'Syncing Invoices...' : 'Sync Invoices'}
						</Button>
						<Button onClick={handleConnect} variant="outline" className="w-full sm:w-auto">
							<ExternalLink className="mr-2 h-4 w-4" />
							Reconnect
						</Button>
					</>
				) : (
					<Button onClick={handleConnect} className="flex-1">
						<ExternalLink className="mr-2 h-4 w-4" />
						Connect to Xero
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
