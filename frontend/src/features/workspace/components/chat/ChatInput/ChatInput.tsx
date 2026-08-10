import { useRef, useEffect } from 'react';
import { Send, Square, Paperclip } from 'lucide-react';
import './ChatInput.css';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  onKeyDown,
  isGenerating,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !isGenerating;

  return (
    <div className="rf-chat-input" role="group" aria-label="Chat message input">
      <div className="rf-chat-input__box">
        {/* Attach button */}
        <button
          className="rf-chat-input__attach"
          aria-label="Attach file"
          disabled={isGenerating || disabled}
          type="button"
        >
          <Paperclip size={16} aria-hidden="true" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id="chat-input"
          className="rf-chat-input__textarea"
          placeholder="Ask about your documents… (Shift+Enter for new line)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isGenerating || disabled}
          rows={1}
          aria-label="Chat message"
          aria-multiline="true"
        />

        {/* Send / Stop */}
        {isGenerating ? (
          <button
            id="stop-btn"
            className="rf-chat-input__stop"
            onClick={onStop}
            aria-label="Stop generating"
            type="button"
          >
            <Square size={14} fill="currentColor" aria-hidden="true" />
          </button>
        ) : (
          <button
            id="send-btn"
            className={`rf-chat-input__send ${canSend ? 'rf-chat-input__send--active' : ''}`}
            onClick={onSend}
            disabled={!canSend}
            aria-label="Send message"
            type="button"
          >
            <Send size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      <p className="rf-chat-input__hint">
        Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
