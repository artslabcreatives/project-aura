import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import api from '../lib/api';
import { XeroStatus } from '../types/financial';

export function XeroIntegration() {
	const [status, setStatus] = useState<XeroStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [syncing, setSyncing] = useState(false);

	const fetchStatus = async () => {
		try {
			setLoading(true);
			const response = await api.get('/api/xero/status');
			setStatus(response.data);
		} catch (error) {
			console.error('Failed to fetch Xero status:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleConnect = async () => {
		try {
			const response = await api.get('/api/xero/auth-url');
			window.location.href = response.data.authUrl;
		} catch (error) {
			console.error('Failed to get Xero auth URL:', error);
		}
	};

	const handleSync = async () => {
		try {
			setSyncing(true);
			await api.post('/api/xero/sync');
			await fetchStatus();
			alert('Xero sync completed successfully!');
		} catch (error) {
			console.error('Failed to sync with Xero:', error);
			alert('Failed to sync with Xero. Please try again.');
		} finally {
			setSyncing(false);
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
			<CardFooter className="flex gap-2">
				{status?.connected ? (
					<>
						<Button onClick={handleSync} disabled={syncing} className="flex-1">
							<RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
							{syncing ? 'Syncing...' : 'Manual Sync'}
						</Button>
						<Button onClick={handleConnect} variant="outline">
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
