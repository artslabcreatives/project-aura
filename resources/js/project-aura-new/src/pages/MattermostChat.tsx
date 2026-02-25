import { useEffect, useState } from "react";
import { MessageSquare, Maximize2, X } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";

export function MattermostChat() {
	const { currentUser } = useUser();
	const [autoLoginUrl, setAutoLoginUrl] = useState<string>("");
	const [iframeError, setIframeError] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);

	useEffect(() => {
		document.title = "Chat - Aura";

		// Build the email_login URL directly - NO API CALLS, NO BEARER TOKENS
		if (currentUser?.email) {
			const email = encodeURIComponent(currentUser.email);
			const redirectTo = encodeURIComponent('/artslab-creatives/channels/town-square');
			const url = `https://collab.artslabcreatives.com/email_login?email=${email}&redirect_to=${redirectTo}`;
			console.log('MattermostChat: Building URL for', email);
			console.log('MattermostChat: URL =', url);
			setAutoLoginUrl(url);
		} else {
			console.log('MattermostChat: No currentUser or email', currentUser);
		}
	}, [currentUser]);

	const handleIframeError = () => {
		console.error("Iframe failed to load");
		setIframeError(true);
	};

	return (
		<div className={isFullscreen ? "fixed inset-0 z-50 bg-background flex flex-col" : "flex flex-col h-[calc(100vh-7rem)]"}>
			{isFullscreen ? (
				<div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="flex items-center gap-2">
						<MessageSquare className="h-4 w-4" />
						<span className="text-sm font-medium">Chat</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => setIsFullscreen(false)}
					>
						<X className="h-4 w-4" />
						<span className="sr-only">Exit fullscreen</span>
					</Button>
				</div>
			) : (
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						<h1 className="text-2xl font-bold">Chat</h1>
					</div>
					<Button
						variant="outline"
						size="icon"
						onClick={() => setIsFullscreen(true)}
					>
						<Maximize2 className="h-4 w-4" />
						<span className="sr-only">Open fullscreen</span>
					</Button>
				</div>
			)}

			<div className={isFullscreen ? "flex-1 overflow-hidden" : "flex-1 border rounded-lg overflow-hidden"}>
				{!autoLoginUrl ? (
					<div className="flex items-center justify-center h-full">
						<p className="text-muted-foreground">Loading chat...</p>
					</div>
				) : iframeError ? (
					<div className="flex items-center justify-center h-full">
						<p className="text-destructive">Failed to load Mattermost chat</p>
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
