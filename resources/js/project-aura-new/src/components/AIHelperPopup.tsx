import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Paperclip, Send, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { chatbotService, ChatMessage } from "@/services/chatbotService";

const ACCEPTED_AGENT_FILES = ".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a,.mp4,.mov,.webm,.json";

export function AIHelperPopup() {
	const [isOpen, setIsOpen] = useState(false);
	const [sessionId, setSessionId] = useState<number | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [pendingFiles, setPendingFiles] = useState<File[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const endRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isOpen && !sessionId && !isLoading) {
			void startSession();
		}
	}, [isOpen, sessionId, isLoading]);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isOpen]);

	const startSession = async () => {
		setIsLoading(true);
		try {
			const session = await chatbotService.createSession("operations");
			setSessionId(session.id);
			setMessages(session.messages || []);
		} catch (error) {
			console.error("Failed to start helper session", error);
			setMessages([{ role: "assistant", content: "I couldn't start the helper right now. Please try again." }]);
		} finally {
			setIsLoading(false);
		}
	};

	const addFiles = (files: FileList | File[]) => {
		setPendingFiles(prev => [...prev, ...Array.from(files)].slice(0, 8));
	};

	const removeFile = (index: number) => {
		setPendingFiles(prev => prev.filter((_, i) => i !== index));
	};

	const sendMessage = async () => {
		if (!sessionId || isLoading || (!input.trim() && pendingFiles.length === 0)) return;

		const filesToSend = pendingFiles;
		const content = input.trim() || "[attachments uploaded]";
		setMessages(prev => [...prev, {
			role: "user",
			content,
			metadata: filesToSend.length > 0 ? {
				attachments: filesToSend.map((file, index) => ({
					id: index,
					name: file.name,
					mime_type: file.type,
					size: file.size,
				})),
			} : null,
		}]);
		setInput("");
		setPendingFiles([]);
		setIsLoading(true);

		try {
			const reply = await chatbotService.sendMessage(sessionId, content, filesToSend);
			setMessages(prev => [...prev, reply]);
		} catch (error) {
			console.error("Helper message failed", error);
			setMessages(prev => [...prev, {
				role: "assistant",
				content: error instanceof Error ? error.message : "I couldn't process that request. Please try again.",
			}]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			void sendMessage();
		}
	};

	return (
		<>
			<Button
				type="button"
				size="icon"
				onClick={() => setIsOpen(prev => !prev)}
				className="fixed bottom-20 right-4 z-[65] h-12 w-12 rounded-full shadow-xl"
				title="Open helper"
			>
				{isOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
			</Button>

			{isOpen && (
				<div
					className="fixed bottom-36 right-4 z-[65] flex h-[620px] max-h-[calc(100vh-10rem)] w-[420px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border bg-card shadow-2xl"
					onDragOver={(event) => {
						event.preventDefault();
						setIsDragging(true);
					}}
					onDragLeave={() => setIsDragging(false)}
					onDrop={(event) => {
						event.preventDefault();
						setIsDragging(false);
						if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files);
					}}
				>
					<div className="flex items-center justify-between border-b px-4 py-3">
						<div className="flex items-center gap-2">
							<div className="rounded-md bg-primary/10 p-1.5">
								<Bot className="h-4 w-4 text-primary" />
							</div>
							<div>
								<p className="text-sm font-semibold">Helper</p>
								<p className="text-xs text-muted-foreground">Tasks, files, and follow-ups</p>
							</div>
						</div>
						<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
							<X className="h-4 w-4" />
						</Button>
					</div>

					{isDragging && (
						<div className="border-b bg-primary/5 px-4 py-2 text-xs font-medium text-primary">
							Drop files to attach them
						</div>
					)}

					<ScrollArea className="flex-1 px-4">
						<div className="space-y-3 py-4">
							{messages.map((message, index) => (
								<div key={message.id ?? index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
									<div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
										message.role === "user"
											? "bg-primary text-primary-foreground"
											: "border bg-background text-foreground"
									}`}>
										<p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
									</div>
								</div>
							))}
							{isLoading && (
								<div className="flex justify-start">
									<div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
										<Loader2 className="h-4 w-4 animate-spin" />
										Working...
									</div>
								</div>
							)}
							<div ref={endRef} />
						</div>
					</ScrollArea>

					<div className="border-t p-3">
						{pendingFiles.length > 0 && (
							<div className="mb-2 flex flex-wrap gap-1.5">
								{pendingFiles.map((file, index) => (
									<span key={`${file.name}-${index}`} className="inline-flex max-w-full items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs">
										<Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
										<span className="max-w-[180px] truncate">{file.name}</span>
										<button type="button" onClick={() => removeFile(index)} className="text-muted-foreground hover:text-foreground">
											<X className="h-3 w-3" />
										</button>
									</span>
								))}
							</div>
						)}
						<div className="flex items-end gap-2">
							<Textarea
								value={input}
								onChange={event => setInput(event.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Ask the helper..."
								className="max-h-28 min-h-12 resize-none text-sm"
								disabled={isLoading}
							/>
							<input
								id="ai-helper-file-input"
								type="file"
								multiple
								className="hidden"
								accept={ACCEPTED_AGENT_FILES}
								onChange={event => {
									if (event.target.files?.length) addFiles(event.target.files);
									event.target.value = "";
								}}
							/>
							<div className="flex flex-col gap-2">
								<Button
									type="button"
									variant="outline"
									size="icon"
									className="h-9 w-9"
									disabled={isLoading || pendingFiles.length >= 8}
									onClick={() => document.getElementById("ai-helper-file-input")?.click()}
									title="Attach files"
								>
									<UploadCloud className="h-4 w-4" />
								</Button>
								<Button
									type="button"
									size="icon"
									className="h-9 w-9"
									disabled={isLoading || (!input.trim() && pendingFiles.length === 0)}
									onClick={() => void sendMessage()}
									title="Send"
								>
									<Send className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
