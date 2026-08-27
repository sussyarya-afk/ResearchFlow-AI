import { Bot, User } from 'lucide-react';
import type { ChatMessage } from '../../../types';
import { AgentTimeline } from '../../timeline/AgentTimeline';
import { CitationCard } from '../../citations/CitationCard';
import type { AgentTimeline as AgentTimelineType } from '../../../types';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: ChatMessage;
  timeline?: AgentTimelineType;
  isLatestAI?: boolean;
  onOpenDocument?: (documentId: string, pageNumber: number) => void;
}

function formatContent(content: string) {
  // Convert markdown-style bold **text** to <strong>
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Split on newlines and render as paragraphs
    return part.split('\n\n').map((para, j) => (
      para.trim() ? <p key={`${i}-${j}`} className="rf-msg__para">{para}</p> : null
    ));
  });
}

export function MessageBubble({ message, timeline, isLatestAI, onOpenDocument }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`rf-msg rf-msg--${message.role}`}>
      <div className="rf-msg__avatar" aria-hidden="true">
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      <div className="rf-msg__body">
        <div className="rf-msg__header">
          <span className="rf-msg__sender">{isUser ? 'You' : 'AgentNotebook AI'}</span>
          <time className="rf-msg__time" dateTime={message.timestamp}>{message.timestamp}</time>
        </div>

        <div className={`rf-msg__bubble rf-msg__bubble--${message.role}`}>
          {formatContent(message.content)}
        </div>

        {/* Agent timeline directly below the LATEST AI response */}
        {!isUser && isLatestAI && timeline && (
          <div className="rf-msg__timeline">
            <AgentTimeline timeline={timeline} />
          </div>
        )}

        {/* Display citations if available */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="rf-msg__citations">
            <h4 className="rf-msg__citations-title">Sources</h4>
            <div className="rf-msg__citations-list" role="list">
              {message.citations.map((citation, idx) => (
                <div key={citation.chunk_id} role="listitem">
                  <CitationCard
                    citation={citation}
                    index={idx}
                    onOpenDocument={onOpenDocument}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
