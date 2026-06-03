import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Megaphone } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface AdsAccess {
	id: number;
	email: string;
	addedBy?: {
		name: string;
		email: string;
	};
}

export function AdsModuleAccessConfig() {
	const [accesses, setAccesses] = useState<AdsAccess[]>([]);
	const [newEmail, setNewEmail] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		fetchAccesses();
	}, []);

	const fetchAccesses = async () => {
		try {
			setIsLoading(true);
			const data = await api.get('/ads-module-access');
			setAccesses(Array.isArray(data) ? data : (data as any).data || []);
		} catch (error) {
			console.error("Failed to fetch ads access list", error);
			toast({
				title: "Error",
				description: "Could not load the access list.",
				variant: "destructive"
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleAdd = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newEmail.trim()) return;

		try {
			setIsSubmitting(true);
			const newAccess = await api.post('/ads-module-access', { email: newEmail.trim() });
			setAccesses(prev => [...prev, newAccess as unknown as AdsAccess]);
			setNewEmail("");
			toast({
				title: "Success",
				description: "User added to Ads Module whitelist.",
			});
		} catch (error: any) {
			const msg = error?.response?.data?.message || "Failed to add user.";
			toast({
				title: "Error",
				description: msg,
				variant: "destructive"
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleRemove = async (id: number) => {
		try {
			await api.delete(`/ads-module-access/${id}`);
			setAccesses(prev => prev.filter(a => a.id !== id));
			toast({
				title: "Removed",
				description: "User access revoked.",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to remove user.",
				variant: "destructive"
			});
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Megaphone className="h-5 w-5 text-primary" />
					Ads Module Access
				</CardTitle>
				<CardDescription>
					Manage which users can access the Ads Module by whitelisting their email addresses.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<form onSubmit={handleAdd} className="flex items-end gap-2 max-w-md">
					<div className="space-y-2 flex-1">
						<Label htmlFor="email">Email Address</Label>
						<Input
							id="email"
							type="email"
							placeholder="user@example.com"
							value={newEmail}
							onChange={(e) => setNewEmail(e.target.value)}
							required
						/>
					</div>
					<Button type="submit" disabled={isSubmitting || !newEmail.trim()}>
						<Plus className="h-4 w-4 mr-2" />
						Add User
					</Button>
				</form>

				<div className="rounded-md border">
					{isLoading ? (
						<div className="p-4 space-y-3">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					) : accesses.length === 0 ? (
						<div className="p-8 text-center text-muted-foreground">
							No users have been whitelisted yet.
						</div>
					) : (
						<div className="divide-y">
							{accesses.map((access) => (
								<div key={access.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
									<div>
										<div className="font-medium">{access.email}</div>
										{access.addedBy && (
											<div className="text-xs text-muted-foreground mt-0.5">
												Added by {access.addedBy.name}
											</div>
										)}
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => handleRemove(access.id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
