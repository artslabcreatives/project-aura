import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bot, Send, Plus, RefreshCw, CheckCircle2, Clock, AlertTriangle,
  Users, FolderKanban, ListTodo, TrendingDown, Loader2, ChevronRight,
  Shield, FileText, BarChart3, BookOpen, Paperclip, X, UploadCloud
} from 'lucide-react';
import { chatbotService, ChatSession, ChatMessage, ScenarioPolicy, ContextStats, ChatMessageMetadata } from '@/services/chatbotService';

const ACCEPTED_AGENT_FILES = ".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a,.mp4,.mov,.webm,.json";

function parseMetadata(metadata: ChatMessage['metadata']): ChatMessageMetadata | null {
  if (!metadata) return null;
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata) as ChatMessageMetadata;
    } catch {
      return null;
    }
  }
  return metadata;
}

// Lightweight markdown renderer — handles bold, headings, blockquotes, lists, code
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    return <span key={i}>{part}</span>;
  });
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let inBlockquote: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    const cls = listType === 'ol' ? 'list-decimal pl-5 mb-2 space-y-0.5' : 'list-disc pl-5 mb-2 space-y-0.5';
    nodes.push(<Tag key={nodes.length} className={cls}>{listItems}</Tag>);
    listItems = [];
    listType = null;
  };

  const flushBlockquote = () => {
    if (inBlockquote.length === 0) return;
    nodes.push(
      <blockquote key={nodes.length} className="border-l-4 border-emerald-500 pl-3 py-1.5 my-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-r text-sm space-y-0.5">
        {inBlockquote.map((line, i) => <div key={i}>{renderInline(line)}</div>)}
      </blockquote>
    );
    inBlockquote = [];
  };

  lines.forEach((line, idx) => {
    // Blockquote
    if (line.startsWith('> ')) {
      flushList();
      inBlockquote.push(line.slice(2));
      return;
    } else {
      flushBlockquote();
    }

    // h2
    if (line.startsWith('## ')) {
      flushList();
      nodes.push(<h2 key={idx} className="text-sm font-bold mt-3 mb-1 text-foreground">{renderInline(line.slice(3))}</h2>);
      return;
    }
    // h3
    if (line.startsWith('### ')) {
      flushList();
      nodes.push(<h3 key={idx} className="text-sm font-semibold mt-2 mb-0.5 text-foreground">{renderInline(line.slice(4))}</h3>);
      return;
    }
    // Unordered list
    if (/^[-*] /.test(line)) {
      if (listType !== 'ul') { flushList(); listType = 'ul'; }
      listItems.push(<li key={idx} className="text-sm">{renderInline(line.slice(2))}</li>);
      return;
    }
    // Ordered list
    if (/^\d+\. /.test(line)) {
      if (listType !== 'ol') { flushList(); listType = 'ol'; }
      listItems.push(<li key={idx} className="text-sm">{renderInline(line.replace(/^\d+\. /, ''))}</li>);
      return;
    }
    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      flushList();
      nodes.push(<hr key={idx} className="my-2 border-border" />);
      return;
    }
    // Empty line
    if (line.trim() === '') {
      flushList();
      nodes.push(<div key={idx} className="h-1.5" />);
      return;
    }
    // Plain paragraph
    flushList();
    nodes.push(<p key={idx} className="text-sm leading-relaxed">{renderInline(line)}</p>);
  });

  flushList();
  flushBlockquote();

  return <div className="space-y-0.5 leading-relaxed">{nodes}</div>;
}

function StatBadge({ icon: Icon, label, value, variant }: {
  icon: React.ElementType;
  label: string;
  value: number;
  variant?: 'default' | 'warning' | 'danger';
}) {
  const colors = {
    default: 'bg-muted text-muted-foreground',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  };

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${colors[variant ?? 'default']}`}>
      <Icon className="h-3 w-3" />
      <span>{value} {label}</span>
    </div>
  );
}

function PolicyCard({ policy, onActivate }: { policy: ScenarioPolicy; onActivate: (id: number) => void }) {
  const statusColor = {
    draft: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    archived: 'bg-muted text-muted-foreground',
  }[policy.status];

  const boundaries = typeof policy.boundaries === 'object' && policy.boundaries !== null
    ? (policy.boundaries as Record<string, string>)
    : {};
  const notifications = typeof policy.notifications === 'object' && policy.notifications !== null
    ? (policy.notifications as Record<string, string>)
    : {};
  const reactions = typeof policy.reactions === 'object' && policy.reactions !== null
    ? (policy.reactions as Record<string, string>)
    : {};

  return (
    <div className="border border-border rounded-lg p-3 space-y-2 bg-card">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-foreground leading-tight">{policy.scenario_title}</h4>
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${statusColor}`}>
          {policy.status}
        </span>
      </div>
      {boundaries.description && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Boundary: </span>{boundaries.description}
        </p>
      )}
      {notifications.description && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Notify: </span>{notifications.description}
        </p>
      )}
      {notifications.escalation && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Escalate: </span>{notifications.escalation}
        </p>
      )}
      {reactions.description && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">React: </span>{reactions.description}
        </p>
      )}
      {policy.status === 'draft' && (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-6 text-xs"
          onClick={() => onActivate(policy.id)}
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Activate Policy
        </Button>
      )}
    </div>
  );
}

export default function AIChatbot() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [policies, setPolicies] = useState<ScenarioPolicy[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'policies'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    loadSessions();
    loadPolicies();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function loadSessions() {
    try {
      const data = await chatbotService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions', err);
    }
  }

  async function loadPolicies() {
    try {
      const data = await chatbotService.getPolicies();
      setPolicies(data);
    } catch (err) {
      console.error('Failed to load policies', err);
    }
  }

  async function openSession(id: number) {
    setIsLoading(true);
    try {
      const session = await chatbotService.getSession(id);
      setActiveSession(session);
      setMessages(session.messages);
      setPendingFiles([]);
    } catch (err) {
      console.error('Failed to load session', err);
    } finally {
      setIsLoading(false);
    }
  }

  function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files);
    setPendingFiles(prev => [...prev, ...incoming].slice(0, 8));
  }

  function removeFile(index: number) {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function startNewSession() {
    setIsCreating(true);
    setActiveSession(null);
    setMessages([]);
    setPendingFiles([]);
    try {
      const session = await chatbotService.createSession('scenario');
      setActiveSession(session);
      setMessages(session.messages);
      setSessions(prev => [
        { id: session.id, title: session.title, status: session.status, messages: [] },
        ...prev,
      ]);
    } catch (err) {
      console.error('Failed to create session', err);
    } finally {
      setIsCreating(false);
    }
  }

  async function sendMessage() {
    if ((!input.trim() && pendingFiles.length === 0) || !activeSession || isLoading) return;

    const filesToSend = pendingFiles;
    const userMsg: ChatMessage = {
      role: 'user',
      content: input.trim() || '[attachments uploaded]',
      metadata: filesToSend.length > 0 ? {
        attachments: filesToSend.map((file, index) => ({
          id: index,
          name: file.name,
          mime_type: file.type,
          size: file.size,
        })),
      } : null,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setPendingFiles([]);
    setIsLoading(true);

    try {
      const reply = await chatbotService.sendMessage(activeSession.id, userMsg.content, filesToSend);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply.content,
        created_at: reply.created_at,
        metadata: reply.metadata,
      }]);
      const metadata = parseMetadata(reply.metadata);
      if (metadata?.memory_summary !== undefined) {
        setActiveSession(prev => prev ? { ...prev, memory_summary: metadata.memory_summary ?? null } : prev);
      }

      // Refresh policies if a policy was saved
      if (reply.content.includes('✅')) {
        await loadPolicies();
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function activatePolicy(id: number) {
    try {
      await chatbotService.updatePolicy(id, { status: 'active' });
      setPolicies(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
    } catch (err) {
      console.error('Failed to activate policy', err);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const stats: ContextStats | undefined = activeSession?.stats;
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const draftPolicies = policies.filter(p => p.status === 'draft').length;

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-0 -m-6 overflow-hidden">
      {/* Left sidebar — sessions + policies */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-violet-100 dark:bg-violet-950/50 rounded-lg">
              <Bot className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">AI Scenario Analyst</h2>
              <p className="text-xs text-muted-foreground">Policy discovery assistant</p>
            </div>
          </div>
          <Button
            className="w-full h-8 text-xs gap-1.5"
            onClick={startNewSession}
            disabled={isCreating}
          >
            {isCreating ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Analyzing database…</>
            ) : (
              <><Plus className="h-3 w-3" /> New Discovery Session</>
            )}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(['chat', 'policies'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'chat' ? (
                <span className="flex items-center justify-center gap-1"><BookOpen className="h-3 w-3" /> Sessions</span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" /> Policies
                  {draftPolicies > 0 && (
                    <span className="ml-1 px-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded text-[10px] font-semibold">
                      {draftPolicies}
                    </span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        <ScrollArea className="flex-1">
          {activeTab === 'chat' ? (
            <div className="p-2 space-y-1">
              {sessions.length === 0 && !isCreating && (
                <p className="text-xs text-muted-foreground text-center py-8 px-4">
                  Start a session, drop files, and ask the agent to update Aura.
                </p>
              )}
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => openSession(session.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors flex items-start gap-2 ${
                    activeSession?.id === session.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50 text-foreground'
                  }`}
                >
                  <Clock className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="font-medium truncate leading-tight">{session.title}</p>
                    <p className="text-muted-foreground mt-0.5">{session.status}</p>
                  </div>
                  {activeSession?.id === session.id && (
                    <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 ml-auto text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {policies.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8 px-4">
                  No policies yet. Complete a discovery session to define system policies.
                </p>
              )}
              {policies.map(policy => (
                <PolicyCard key={policy.id} policy={policy} onActivate={activatePolicy} />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Policy summary footer */}
        {policies.length > 0 && (
          <div className="p-3 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {activePolicies} active
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-500" />
                {draftPolicies} draft
              </span>
              <span>{policies.length} total</span>
            </div>
          </div>
        )}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {!activeSession && !isCreating ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
            <div className="p-4 bg-violet-100 dark:bg-violet-950/30 rounded-2xl">
              <Bot className="h-10 w-10 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="text-center max-w-md">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                AI Scenario Discovery
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Claude will read your database, identify operational patterns, and help system admins
                define policies for how Aura should respond to recurring scenarios.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md text-xs text-muted-foreground">
              {[
                { icon: FolderKanban, text: 'Project & deadline risks' },
                { icon: Users, text: 'Team workload patterns' },
                { icon: ListTodo, text: 'Task issue scenarios' },
                { icon: TrendingDown, text: 'Budget & finance alerts' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
                  <Icon className="h-4 w-4 text-violet-500" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <Button onClick={startNewSession} disabled={isCreating} className="gap-2">
              <Bot className="h-4 w-4" />
              Start Scenario Discovery
            </Button>
          </div>
        ) : isCreating ? (
          /* Loading / analyzing state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-violet-100 dark:bg-violet-950/30 rounded-2xl animate-pulse">
              <Bot className="h-10 w-10 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Analyzing your database…</p>
              <p className="text-xs text-muted-foreground mt-1">
                Reading projects, tasks, team data, and financial records
              </p>
            </div>
            <div className="flex flex-col gap-1.5 items-center text-xs text-muted-foreground">
              {['Reading project data', 'Analyzing team workload', 'Identifying issue patterns', 'Generating scenario analysis'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" style={{ animationDelay: `${i * 300}ms` }} />
                  {step}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Session header + stats */}
            {stats && (
              <div className="border-b border-border px-4 py-2 bg-card/50 backdrop-blur">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-muted-foreground mr-1">Live snapshot:</span>
                  <StatBadge icon={FolderKanban} label="projects" value={stats.active_projects} />
                  <StatBadge icon={ListTodo} label="tasks" value={stats.total_tasks} />
                  <StatBadge
                    icon={AlertTriangle}
                    label="overdue"
                    value={stats.overdue_tasks_total}
                    variant={stats.overdue_tasks_total > 0 ? 'danger' : 'default'}
                  />
                  <StatBadge
                    icon={Users}
                    label="overworked"
                    value={stats.overworked_users}
                    variant={stats.overworked_users > 0 ? 'warning' : 'default'}
                  />
                  <StatBadge
                    icon={FileText}
                    label="unassigned"
                    value={stats.unassigned_tasks_total}
                    variant={stats.unassigned_tasks_total > 0 ? 'warning' : 'default'}
                  />
                  <StatBadge icon={BarChart3} label="blocked" value={stats.blocked_tasks_total} />
                </div>
                {activeSession?.memory_summary && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    <span className="font-medium text-foreground">Memory:</span> {activeSession.memory_summary}
                  </p>
                )}
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 px-4">
              <div className="py-4 space-y-4 max-w-3xl mx-auto">
                {messages.filter(m => m.role !== 'system').map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="p-1.5 bg-violet-100 dark:bg-violet-950/50 rounded-lg h-fit mt-0.5 shrink-0">
                        <Bot className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-card border border-border text-foreground'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <div className="space-y-2">
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          {parseMetadata(msg.metadata)?.attachments && (
                            <div className="flex flex-wrap gap-1.5">
                              {parseMetadata(msg.metadata)?.attachments?.map(file => (
                                <span key={`${file.id}-${file.name}`} className="inline-flex items-center gap-1 rounded-md bg-primary-foreground/15 px-2 py-1 text-[11px]">
                                  <Paperclip className="h-3 w-3" />
                                  {file.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <MessageContent content={msg.content} />
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="p-1.5 bg-violet-100 dark:bg-violet-950/50 rounded-lg h-fit mt-0.5 shrink-0">
                      <Bot className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="bg-card border border-border rounded-xl px-4 py-3">
                      <div className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border p-4 bg-card/50">
              <div className="max-w-3xl mx-auto">
                {activeSession?.status === 'completed' ? (
                  <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    This session is completed. Start a new one to continue discovery.
                  </div>
                ) : (
                  <div
                    className={`flex gap-2 items-end rounded-lg border p-2 transition-colors ${
                      isDraggingFiles ? 'border-primary bg-primary/5' : 'border-transparent'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingFiles(true); }}
                    onDragLeave={() => setIsDraggingFiles(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingFiles(false);
                      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                    }}
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      {pendingFiles.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {pendingFiles.map((file, index) => (
                            <span
                              key={`${file.name}-${index}`}
                              className="inline-flex max-w-full items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs text-foreground"
                            >
                              <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
                              <span className="truncate max-w-[180px]">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="rounded-sm text-muted-foreground hover:text-foreground"
                                aria-label={`Remove ${file.name}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Answer scenario questions or define a policy..."
                        className="min-h-[60px] max-h-[160px] resize-none text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        title="Attach files"
                        disabled={isLoading || pendingFiles.length >= 8}
                        onClick={() => document.getElementById('ai-chatbot-file-input')?.click()}
                        className="h-10 w-10 shrink-0"
                      >
                        <UploadCloud className="h-4 w-4" />
                      </Button>
                      <input
                        id="ai-chatbot-file-input"
                        type="file"
                        multiple
                        className="hidden"
                        accept={ACCEPTED_AGENT_FILES}
                        onChange={(event) => {
                          if (event.target.files?.length) addFiles(event.target.files);
                          event.target.value = '';
                        }}
                      />
                      <Button
                        size="icon"
                        onClick={sendMessage}
                        disabled={(!input.trim() && pendingFiles.length === 0) || isLoading}
                        className="h-10 w-10 shrink-0"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                      {activeSession && (
                        <Button
                          size="icon"
                          variant="outline"
                          title="Complete session"
                          onClick={async () => {
                            await chatbotService.completeSession(activeSession.id);
                            setActiveSession(prev => prev ? { ...prev, status: 'completed' } : prev);
                            setSessions(prev =>
                              prev.map(s => s.id === activeSession.id ? { ...s, status: 'completed' } : s)
                            );
                          }}
                          className="h-10 w-10 shrink-0"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Shift+Enter for new line · Enter to send · Policies are saved when confirmed
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
