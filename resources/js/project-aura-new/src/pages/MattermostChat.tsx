import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export function MattermostChat() {
	const { currentUser } = useUser();
	const [autoLoginUrl, setAutoLoginUrl] = useState<string>("");
	const [iframeError, setIframeError] = useState(false);

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
		<div className="flex flex-col h-[calc(100vh-7rem)]">
			<div className="flex items-center gap-2 mb-4">
				<MessageSquare className="h-5 w-5" />
				<h1 className="text-2xl font-bold">Chat</h1>
			</div>

			<div className="flex-1 border rounded-lg overflow-hidden">
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
