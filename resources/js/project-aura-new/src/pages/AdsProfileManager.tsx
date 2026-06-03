import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Settings, TrendingUp, Users, MousePointerClick, Activity } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AdProfile {
	id: number;
	client_name: string;
	created_at: string;
	connections: any[];
}

export default function AdsProfileManager() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { toast } = useToast();
	const [profile, setProfile] = useState<AdProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const [semrushKey, setSemrushKey] = useState("");
	const [isConnecting, setIsConnecting] = useState<string | null>(null);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [analyticsData, setAnalyticsData] = useState<any>(null);

	useEffect(() => {
		if (id) {
			fetchProfile(id);
		}
	}, [id]);

	const fetchProfile = async (profileId: string) => {
		try {
			setIsLoading(true);
			const [profileData, analytics] = await Promise.all([
				api.get(`/ad-profiles/${profileId}`),
				api.get(`/ad-profiles/${profileId}/analytics`)
			]);
			setProfile(profileData as unknown as AdProfile);
			setAnalyticsData(analytics);
		} catch (error) {
			toast({
				title: "Error",
				description: "Could not load the client profile.",
				variant: "destructive"
			});
			navigate('/ads');
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6 p-4">
				<Skeleton className="h-12 w-64" />
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
				</div>
				<Skeleton className="h-96" />
			</div>
		);
	}

	const handleConnectOAuth = async (platform: string) => {
		try {
			setIsConnecting(platform);
			const data = await api.get(`/ad-profiles/${profile?.id}/integrations/${platform}/redirect`);
			if ((data as any).url) {
				window.location.href = (data as any).url;
			}
		} catch (error) {
			toast({
				title: "Error",
				description: `Could not connect to ${platform}.`,
				variant: "destructive"
			});
			setIsConnecting(null);
		}
	};

	const handleConnectSemrush = async () => {
		if (!semrushKey.trim()) return;
		try {
			setIsConnecting('semrush');
			await api.post(`/ad-profiles/${profile?.id}/integrations/semrush`, { api_key: semrushKey.trim() });
			toast({
				title: "Connected!",
				description: "Successfully connected to SEMrush.",
			});
			setSemrushKey("");
			fetchProfile(profile!.id.toString());
		} catch (error: any) {
			toast({
				title: "Connection Failed",
				description: error?.response?.data?.message || "Invalid SEMrush API key.",
				variant: "destructive"
			});
		} finally {
			setIsConnecting(null);
		}
	};

	const handleDisconnect = async (platform: string) => {
		if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return;
		try {
			await api.delete(`/ad-profiles/${profile?.id}/integrations/${platform}`);
			toast({
				title: "Disconnected",
				description: `Successfully disconnected from ${platform}.`,
			});
			fetchProfile(profile!.id.toString());
		} catch (error) {
			toast({
				title: "Error",
				description: `Failed to disconnect ${platform}.`,
				variant: "destructive"
			});
		}
	};

	if (!profile) return null;

	const isConnected = (platform: string) => profile.connections?.some(c => c.platform === platform);

	return (
		<div className="space-y-6 fade-in h-full flex flex-col pb-12">
			{/* Header Section */}
			<div className="flex items-center justify-between gap-4 mb-2 flex-none">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate('/ads')}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">{profile.client_name} Analytics</h1>
						<p className="text-muted-foreground">Comprehensive overview of ad performance and SEO metrics.</p>
					</div>
				</div>

				{/* Configuration Settings Dialog */}
				<Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
					<DialogTrigger asChild>
						<Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
							<Settings className="h-5 w-5 text-muted-foreground" />
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Integration Settings</DialogTitle>
							<DialogDescription>
								Connect external advertising and SEO platforms to import data into this Client Profile.
							</DialogDescription>
						</DialogHeader>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
							{/* Google Ads */}
							<Card className="flex flex-col">
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-base">
										<div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">G</div>
										Google Ads & Analytics
									</CardTitle>
								</CardHeader>
								<CardContent className="flex-1 flex flex-col justify-end">
									{isConnected('google') ? (
										<Button size="sm" variant="destructive" className="w-full" onClick={() => handleDisconnect('google')}>
											Disconnect Google
										</Button>
									) : (
										<Button size="sm" variant="outline" className="w-full" onClick={() => handleConnectOAuth('google')} disabled={isConnecting === 'google'}>
											{isConnecting === 'google' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
											Connect with Google
										</Button>
									)}
								</CardContent>
							</Card>

							{/* TikTok Ads */}
							<Card className="flex flex-col">
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-base">
										<div className="w-6 h-6 rounded bg-black text-white flex items-center justify-center font-bold text-xs">T</div>
										TikTok Ads
									</CardTitle>
								</CardHeader>
								<CardContent className="flex-1 flex flex-col justify-end">
									{isConnected('tiktok') ? (
										<Button size="sm" variant="destructive" className="w-full" onClick={() => handleDisconnect('tiktok')}>
											Disconnect TikTok
										</Button>
									) : (
										<Button size="sm" variant="outline" className="w-full" onClick={() => handleConnectOAuth('tiktok')} disabled={isConnecting === 'tiktok'}>
											{isConnecting === 'tiktok' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
											Connect with TikTok
										</Button>
									)}
								</CardContent>
							</Card>

							{/* LinkedIn Ads */}
							<Card className="flex flex-col">
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-base">
										<div className="w-6 h-6 rounded bg-blue-800 text-white flex items-center justify-center font-bold text-xs">in</div>
										LinkedIn Ads
									</CardTitle>
								</CardHeader>
								<CardContent className="flex-1 flex flex-col justify-end">
									{isConnected('linkedin') ? (
										<Button size="sm" variant="destructive" className="w-full" onClick={() => handleDisconnect('linkedin')}>
											Disconnect LinkedIn
										</Button>
									) : (
										<Button size="sm" variant="outline" className="w-full" onClick={() => handleConnectOAuth('linkedin')} disabled={isConnecting === 'linkedin'}>
											{isConnecting === 'linkedin' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
											Connect with LinkedIn
										</Button>
									)}
								</CardContent>
							</Card>

							{/* SEMrush */}
							<Card className="flex flex-col">
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-base">
										<div className="w-6 h-6 rounded bg-orange-500 text-white flex items-center justify-center font-bold text-xs">S</div>
										SEMrush
									</CardTitle>
								</CardHeader>
								<CardContent className="flex-1 flex flex-col justify-end space-y-2">
									{isConnected('semrush') ? (
										<Button size="sm" variant="destructive" className="w-full" onClick={() => handleDisconnect('semrush')}>
											Disconnect SEMrush
										</Button>
									) : (
										<>
											<input 
												type="password" 
												placeholder="SEMrush API Key" 
												className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												value={semrushKey}
												onChange={(e) => setSemrushKey(e.target.value)}
											/>
											<Button size="sm" variant="outline" className="w-full" onClick={handleConnectSemrush} disabled={isConnecting === 'semrush' || !semrushKey.trim()}>
												{isConnecting === 'semrush' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
												Connect API Key
											</Button>
										</>
									)}
								</CardContent>
							</Card>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* KPI Metric Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total Ad Spend</CardTitle>
						<TrendingUp className="h-4 w-4 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${analyticsData?.total_spend?.toLocaleString() || '0'}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Across connected ad accounts
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total Impressions</CardTitle>
						<Users className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{analyticsData?.total_impressions?.toLocaleString() || '0'}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">Organic Traffic</CardTitle>
						<MousePointerClick className="h-4 w-4 text-orange-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{analyticsData?.semrush?.organic_traffic?.toLocaleString() || '0'}</div>
						<p className="text-xs text-muted-foreground mt-1">
							<span className="text-muted-foreground">via SEMrush Analytics</span>
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">Domain Authority Rank</CardTitle>
						<Activity className="h-4 w-4 text-purple-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{analyticsData?.semrush?.domain_authority ? Math.round(analyticsData.semrush.domain_authority) : 'N/A'}</div>
						<p className="text-xs text-muted-foreground mt-1">
							<span className="text-muted-foreground">via SEMrush Analytics</span>
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Area */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
				{/* Charts Area */}
				<Card className="lg:col-span-2 flex flex-col h-[400px]">
					<CardHeader>
						<CardTitle>Performance Overview</CardTitle>
						<CardDescription>Clicks and Impressions over the last 30 days.</CardDescription>
					</CardHeader>
					<CardContent className="flex-1 flex items-center justify-center border-t border-dashed bg-muted/20 m-4 rounded-xl">
						<p className="text-muted-foreground text-sm flex items-center gap-2">
							<Activity className="h-4 w-4" /> 
							Analytics charts will populate here once scheduled syncs run for Ads APIs.
						</p>
					</CardContent>
				</Card>

				{/* SEO / Traffic Area */}
				<Card className="h-[400px] flex flex-col">
					<CardHeader>
						<CardTitle>SEO & Traffic</CardTitle>
						<CardDescription>Top keywords and organic traffic.</CardDescription>
					</CardHeader>
					<CardContent className="flex-1 overflow-y-auto pr-2 space-y-4">
						{!isConnected('semrush') ? (
							<div className="flex flex-col items-center justify-center h-full text-center space-y-3">
								<p className="text-muted-foreground text-sm">Connect SEMrush to view SEO data.</p>
								<Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>Open Settings</Button>
							</div>
						) : analyticsData?.semrush?.top_keywords?.length === 0 ? (
							<div className="flex items-center justify-center h-full">
								<p className="text-muted-foreground text-sm">No keyword data found.</p>
							</div>
						) : (
							analyticsData?.semrush?.top_keywords?.map((item: any, idx: number) => (
								<div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
									<div>
										<p className="font-medium text-sm capitalize">{item.kw}</p>
										<p className="text-xs text-muted-foreground">Vol: {item.vol}</p>
									</div>
									<div className="text-right">
										<p className="text-sm font-bold">Pos: {item.pos}</p>
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
