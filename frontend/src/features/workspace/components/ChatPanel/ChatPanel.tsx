import { useRef, useEffect } from 'react';
import { Bot, MessageSquare } from 'lucide-react';
import { MessageBubble } from '../chat/MessageBubble';
import { ChatInput } from '../chat/ChatInput';
import type { ChatMessage, AgentTimeline } from '../../types';
import './ChatPanel.css';

interface ChatPanelProps {
  messages: ChatMessage[];
  timeline: AgentTimeline;
  inputValue: string;
  isGenerating: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  onOpenDocument?: (documentId: string, pageNumber: number) => void;
}

function TypingIndicator() {
  return (
    <div className="rf-chat-typing">
      <div className="rf-chat-typing__avatar" aria-hidden="true">
        <Bot size={14} />
      </div>
      <div className="rf-chat-typing__bubble" role="status" aria-label="AI is generating a response">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function ChatPanel({
  messages,
  timeline,
  inputValue,
  isGenerating,
  onInputChange,
  onSend,
  onStop,
  onKeyDown,
  chatEndRef,
  onOpenDocument,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, chatEndRef]);

  // Find the last AI message id to attach timeline to
  const lastAiMessageId = [...messages].reverse().find(m => m.role === 'ai' && m.hasTimeline)?.id;

  return (
    <section className="rf-chat-panel" aria-label="Chat conversation">
      {/* ── Header ── */}
      <div className="rf-chat-panel__header">
        <div className="rf-chat-panel__header-icon" aria-hidden="true">
          <Bot size={16} />
        </div>
        <h2 className="rf-chat-panel__title">Research Chat</h2>
        <span className="rf-chat-panel__model">AgentNotebook AI</span>
      </div>

      {/* ── Messages ── */}
      <div className="rf-chat-panel__messages" ref={scrollRef} role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 ? (
          <div className="rf-chat-panel__empty" aria-label="No messages yet">
            <div className="rf-chat-panel__empty-icon" aria-hidden="true">
              <MessageSquare size={32} />
            </div>
            <p className="rf-chat-panel__empty-title">Ask your documents anything</p>
            <p className="rf-chat-panel__empty-hint">
              Upload a PDF and type a question below to get an AI-powered answer with citations.
            </p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              timeline={msg.id === lastAiMessageId ? timeline : undefined}
              isLatestAI={msg.id === lastAiMessageId}
              onOpenDocument={onOpenDocument}
            />
          ))
        )}

        {isGenerating && <TypingIndicator />}

        <div ref={chatEndRef} aria-hidden="true" />
      </div>

      {/* ── Input ── */}
      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={onSend}
        onStop={onStop}
        onKeyDown={onKeyDown}
        isGenerating={isGenerating}
      />
    </section>
  );
}
