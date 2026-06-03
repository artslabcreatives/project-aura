import { useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdsOAuthCallback() {
	const { platform } = useParams<{ platform: string }>();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { toast } = useToast();

	useEffect(() => {
		const handleCallback = async () => {
			const code = searchParams.get('code');
			const state = searchParams.get('state');

			if (!code || !state || !platform) {
				toast({
					title: "OAuth Failed",
					description: "Missing required parameters from the OAuth provider.",
					variant: "destructive"
				});
				navigate('/ads');
				return;
			}

			try {
				let profileId;
				try {
					const decodedState = JSON.parse(atob(state));
					profileId = decodedState.profile_id;
				} catch (e) {
					console.error("Failed to parse state", e);
				}

				if (!profileId) throw new Error("Profile ID missing from state.");

				await api.post(`/ad-profiles/${profileId}/integrations/${platform}/callback`, { code, state });

				toast({
					title: "Connected!",
					description: `Successfully connected to ${platform}.`,
				});
				
				navigate(`/ads/profiles/${profileId}`);
			} catch (error: any) {
				console.error("OAuth callback error", error);
				const msg = error?.response?.data?.message || "Failed to complete the connection.";
				toast({
					title: "Connection Failed",
					description: msg,
					variant: "destructive"
				});
				navigate('/ads');
			}
		};

		handleCallback();
	}, []);

	return (
		<div className="flex flex-col items-center justify-center h-full min-h-[400px]">
			<Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
			<h2 className="text-xl font-semibold">Completing connection...</h2>
			<p className="text-muted-foreground">Please wait while we securely connect your account.</p>
		</div>
	);
}
