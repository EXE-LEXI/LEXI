import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, MoreHorizontal } from "lucide-react";
import { getChatHistory, sendMessage, type ChatMessage } from "../../api/chatbot";
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
      loadHistory();
    }
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom();
    }
  }, [isOpen, session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadHistory = async () => {
    try {
      if (session) {
        const history = await getChatHistory(session.accessToken);
        setMessages(history);
      }
    } catch (error) {
      console.error("Failed to load chat history", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleToggle = () => {
    if (!session) {
      setGuestPromptVisible(true);
      setTimeout(() => setGuestPromptVisible(false), 3000);
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !session || isTyping) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await sendMessage(session.accessToken, userMessage);
      setMessages(prev => [...prev, { role: "model", content: response.reply, id: response.messageId }]);
      if (!isOpenRef.current) {
        setHasUnread(true);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "model", content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau." }]);
      if (!isOpenRef.current) {
        setHasUnread(true);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-widget">
      {guestPromptVisible && (
        <div className="chatbot-guest-prompt">
          <p>Vui lòng đăng nhập để sử dụng tính năng này.</p>
          <a href={ROUTES.login} className="btn btn-primary btn-sm">Đăng nhập</a>
        </div>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <MessageSquare size={18} />
              <span>Trợ lý Pháp lý AI</span>
            </div>
            <button className="icon-btn" onClick={handleToggle}>
              <X size={18} />
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.length === 0 && !isTyping && (
              <div className="chatbot-empty">
                <p>Xin chào! Tôi có thể giúp gì cho bạn về các vấn đề pháp luật?</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={msg.id || idx} className={`chatbot-message-row ${msg.role}`}>
                <div className="chatbot-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chatbot-message-row model">
                <div className="chatbot-bubble typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <textarea
              placeholder="Nhập câu hỏi..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              rows={1}
            />
            <button 
              className="chatbot-send-btn" 
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <button className={`chatbot-toggle-btn ${isOpen ? "open" : ""}`} onClick={handleToggle}>
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        
        {!isOpen && hasUnread && !isTyping && (
          <span className="chatbot-unread-badge"></span>
        )}
        
        {!isOpen && isTyping && (
          <span className="chatbot-typing-badge">
            <MoreHorizontal size={16} />
          </span>
        )}
      </button>
    </div>
  );
}
