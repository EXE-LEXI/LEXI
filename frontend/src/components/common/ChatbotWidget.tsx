import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { MessageSquare, MoreHorizontal, Send, X } from "lucide-react";
import {
  getChatHistory,
  sendMessage,
  type ChatMessage,
} from "../../api/chatbot";
import type { AuthResponse } from "../../types/auth";
import { ROUTES } from "../../routes/paths";

interface ChatbotWidgetProps {
  session: AuthResponse | null;
}

export function ChatbotWidget({ session }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(isOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [guestPromptVisible, setGuestPromptVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (session && isOpen && messages.length === 0) {
      void loadHistory();
    }
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom();
    }
  }, [isOpen, session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  async function loadHistory() {
    try {
      if (session) {
        const history = await getChatHistory(session.accessToken);
        setMessages(history.slice(-12));
      }
    } catch {
      setMessages([]);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function handleToggle() {
    if (!session) {
      setGuestPromptVisible(true);
      window.setTimeout(() => setGuestPromptVisible(false), 3000);
      return;
    }

    setIsOpen((value) => !value);
  }

  async function handleSend() {
    if (!inputValue.trim() || !session || isTyping) {
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages((items) => [...items, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await sendMessage(session.accessToken, userMessage);
      setMessages((items) => [
        ...items,
        {
          role: "model",
          content: response.reply,
          id: response.messageId,
        },
      ]);

      if (!isOpenRef.current) {
        setHasUnread(true);
      }
    } catch {
      setMessages((items) => [
        ...items,
        {
          role: "model",
          content: "Xin lỗi, hiện tôi chưa thể trả lời. Vui lòng thử lại sau.",
        },
      ]);
      if (!isOpenRef.current) {
        setHasUnread(true);
      }
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="chatbot-widget">
      {guestPromptVisible ? (
        <div className="chatbot-guest-prompt">
          <p>Vui lòng đăng nhập để dùng trợ lý pháp lý.</p>
          <a href={ROUTES.login} className="btn btn-primary btn-sm">
            Đăng nhập
          </a>
        </div>
      ) : null}

      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <MessageSquare size={18} />
              <span>Trợ lý pháp lý</span>
            </div>
            <button className="icon-btn" type="button" onClick={handleToggle}>
              <X size={18} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 && !isTyping ? (
              <div className="chatbot-empty">
                <p>Đặt câu hỏi pháp lý ngắn gọn, tôi sẽ trả lời theo các ý chính.</p>
              </div>
            ) : null}

            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`chatbot-message-row ${message.role}`}
              >
                <div className="chatbot-bubble" style={{ whiteSpace: "pre-wrap" }}>
                  {message.content}
                </div>
              </div>
            ))}

            {isTyping ? (
              <div className="chatbot-message-row model">
                <div className="chatbot-bubble typing" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12.5px", color: "#94a3b8", fontWeight: 500 }}>Trợ lý đang phân tích...</span>
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <textarea
              placeholder="Nhập câu hỏi pháp lý..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              rows={1}
            />
            <button
              className="chatbot-send-btn"
              type="button"
              onClick={() => void handleSend()}
              disabled={!inputValue.trim() || isTyping}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : null}

      <button
        className={`chatbot-toggle-btn ${isOpen ? "open" : ""}`}
        type="button"
        onClick={handleToggle}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}

        {!isOpen && hasUnread && !isTyping ? (
          <span className="chatbot-unread-badge" />
        ) : null}

        {!isOpen && isTyping ? (
          <span className="chatbot-typing-badge">
            <MoreHorizontal size={16} />
          </span>
        ) : null}
      </button>
    </div>
  );
}
