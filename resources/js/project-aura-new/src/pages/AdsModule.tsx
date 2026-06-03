import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Megaphone, Plus, Briefcase, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AdProfile {
	id: number;
	client_name: string;
	created_at: string;
	connections: any[];
}

export default function AdsModule() {
	const [profiles, setProfiles] = useState<AdProfile[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [newClientName, setNewClientName] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const { toast } = useToast();
	const navigate = useNavigate();

	useEffect(() => {
		fetchProfiles();
	}, []);

	const fetchProfiles = async () => {
		try {
			setIsLoading(true);
			const data = await api.get('/ad-profiles');
			setProfiles(Array.isArray(data) ? data : (data as any).data || []);
		} catch (error) {
			console.error("Failed to fetch ad profiles", error);
			toast({
				title: "Error",
				description: "Could not load Client Profiles.",
				variant: "destructive"
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newClientName.trim()) return;

		try {
			setIsCreating(true);
			const newProfile = await api.post('/ad-profiles', { client_name: newClientName.trim() });
			setProfiles(prev => [...prev, newProfile as unknown as AdProfile]);
			setNewClientName("");
			setIsCreateOpen(false);
			toast({
				title: "Success",
				description: "Client Profile created.",
			});
		} catch (error: any) {
			const msg = error?.response?.data?.message || "Failed to create profile.";
			toast({
				title: "Error",
				description: msg,
				variant: "destructive"
			});
		} finally {
			setIsCreating(false);
		}
	};

	const handleDeleteProfile = async (e: React.MouseEvent, id: number) => {
		e.preventDefault();
		e.stopPropagation();
		if (!confirm("Are you sure you want to delete this profile? All connected analytics data will be lost.")) return;

		try {
			await api.delete(`/ad-profiles/${id}`);
			setProfiles(prev => prev.filter(p => p.id !== id));
			toast({
				title: "Deleted",
				description: "Client Profile has been deleted.",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete profile.",
				variant: "destructive"
			});
		}
	};

	return (
		<div className="space-y-6 fade-in h-full flex flex-col pb-12">
			<div className="flex items-center justify-between gap-4 mb-2 flex-none">
				<div className="flex items-center gap-3">
					<div className="p-3 rounded-xl bg-primary/10 text-primary">
						<Megaphone className="h-8 w-8" />
					</div>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Ads & Analytics</h1>
						<p className="text-muted-foreground">Manage Client Profiles and connect analytics sources.</p>
					</div>
				</div>

				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button size="lg" className="shadow-lg">
							<Plus className="mr-2 h-5 w-5" />
							New Client Profile
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Client Profile</DialogTitle>
							<DialogDescription>
								A Client Profile acts as a workspace where you can connect Google Ads, TikTok, LinkedIn, and SEMrush.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleCreateProfile}>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="client_name">Client Name</Label>
									<Input
										id="client_name"
										placeholder="e.g. Acme Corp"
										value={newClientName}
										onChange={(e) => setNewClientName(e.target.value)}
										autoFocus
										required
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
								<Button type="submit" disabled={!newClientName.trim() || isCreating}>
									{isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
									Create Profile
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="flex-1 mt-6">
				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3].map(i => (
							<Skeleton key={i} className="h-48 w-full rounded-xl" />
						))}
					</div>
				) : profiles.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-xl bg-muted/30">
						<Briefcase className="h-16 w-16 text-muted-foreground/30 mb-4" />
						<h3 className="text-xl font-semibold mb-2">No Profiles Found</h3>
						<p className="text-muted-foreground max-w-md mb-6">
							Get started by creating a Client Profile. You can then connect their specific ad accounts.
						</p>
						<Button onClick={() => setIsCreateOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Create First Profile
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{profiles.map(profile => (
							<Card 
								key={profile.id} 
								className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all overflow-hidden flex flex-col"
								onClick={() => navigate(`/ads/profiles/${profile.id}`)}
							>
								<CardHeader className="pb-3">
									<div className="flex justify-between items-start">
										<div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit">
											<Briefcase className="h-6 w-6" />
										</div>
										<Button 
											variant="ghost" 
											size="icon" 
											className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity"
											onClick={(e) => handleDeleteProfile(e, profile.id)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
									<CardTitle className="text-xl mt-4 line-clamp-1" title={profile.client_name}>
										{profile.client_name}
									</CardTitle>
									<CardDescription>
										Created on {new Date(profile.created_at).toLocaleDateString()}
									</CardDescription>
								</CardHeader>
								<CardContent className="flex-1 pb-4">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Connected Accounts:</span>
										<span className="font-semibold bg-accent px-2 py-0.5 rounded-full">
											{profile.connections?.length || 0}
										</span>
									</div>
								</CardContent>
								<div className="bg-muted/50 p-3 px-6 flex items-center justify-between border-t text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
									Manage Integrations
									<ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
								</div>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
