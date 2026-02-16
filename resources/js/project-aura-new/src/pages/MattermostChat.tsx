import { useEffect } from "react";
import { MessageSquare } from "lucide-react";

export function MattermostChat() {
	useEffect(() => {
		document.title = "Chat - Aura";
	}, []);

	// Mattermost URL from environment/config
	const mattermostUrl = "https://collab.artslabcreatives.com/artslab-creatives/channels/town-square";

	return (
		<div className="flex flex-col h-[calc(100vh-7rem)]">
			<div className="flex items-center gap-2 mb-4">
				<MessageSquare className="h-5 w-5" />
				<h1 className="text-2xl font-bold">Chat</h1>
			</div>
			
			<div className="flex-1 border rounded-lg overflow-hidden">
				<iframe
					src={mattermostUrl}
					className="w-full h-full"
					title="Chat"
					allow="microphone; camera"
				/>
			</div>
		</div>
	);
}
