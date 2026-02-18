import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { api } from "@/lib/api";

export function MattermostChat() {
	const [autoLoginUrl, setAutoLoginUrl] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>("");
	const [iframeError, setIframeError] = useState(false);

	useEffect(() => {
		document.title = "Chat - Aura";

		// Fetch auto-login URL with JWT
		async function fetchAutoLoginUrl() {
			try {
				const response = await api.get<{ url: string; expires_at: string }>(
					"/mattermost/plugin/auto-login-url"
				);
				console.log("Auto-login URL received:", response.url);
				setAutoLoginUrl(response.url);
			} catch (err: any) {
				console.error("Failed to get Mattermost auto-login URL:", err);
				const errorMessage = err?.response?.data?.error || "Failed to load chat. Please try again.";
				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		}

		fetchAutoLoginUrl();
	}, []);

	const handleIframeError = () => {
		console.error("Iframe failed to load");
		setIframeError(true);
	};

	return (
		<div className="flex flex-col h-[calc(100vh-7rem)]">
			<div className="flex items-center gap-2 mb-4">
				<MessageSquare className="h-5 w-5" />
				<h1 className="text-2xl font-bold">Chat</h1>
			</div>

			<div className="flex-1 border rounded-lg overflow-hidden">
				{loading ? (
					<div className="flex items-center justify-center h-full">
						<p className="text-muted-foreground">Loading chat...</p>
					</div>
				) : error ? (
					<div className="flex items-center justify-center h-full">
						<p className="text-destructive">{error}</p>
					</div>
				) : iframeError ? (
					<div className="flex flex-col items-center justify-center h-full gap-4 p-8">
						<p className="text-destructive font-semibold">Failed to load Mattermost chat</p>
						<div className="text-sm text-muted-foreground text-center max-w-md">
							<p className="mb-2">The Mattermost plugin may not be configured correctly.</p>
							<p className="mb-2">Please ensure the plugin JWT secret is set to:</p>
							<code className="block bg-muted p-2 rounded text-xs break-all">
								laEVti3sFsCAVdMwQLfaTiEmGwWuqI3fKnexEMERPVE=
							</code>
							<p className="mt-4 text-xs">
								Configure this in: System Console → Plugins → Aura AI → Settings
							</p>
						</div>
					</div>
				) : (
					<iframe
						src={autoLoginUrl}
						className="w-full h-full"
						title="Chat"
						allow="microphone; camera"
						onError={handleIframeError}
					/>
				)}
			</div>
		</div>
	);
}
