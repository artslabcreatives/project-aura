// COMPLETELY PUBLIC - NO AUTH, NO ROLES, NO PERMISSIONS
export function PublicMattermostChat() {
	// Hardcoded URL - NO API CALLS, NO AUTH, NOTHING
	const url = "https://collab.artslabcreatives.com/email_login?email=admin@artslabcreatives.com&redirect_to=/artslab-creatives/channels/town-square";

	return (
		<div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
			<iframe
				src={url}
				style={{ width: '100%', height: '100%', border: 'none' }}
				title="Mattermost Chat"
				allow="microphone; camera"
			/>
		</div>
	);
}
