import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// ChatBubble component
function ChatBubble({ message, isUser }) {
  return (
    <div className={`chat-bubble ${isUser ? 'user' : 'bot'}`}>
      <div className="avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      <div className="message-content">
        {message}
      </div>
    </div>
  );
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div>🤖</div>
      <div className="dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}

// Input area component
function InputArea({ inputValue, setInputValue, onSend, isLoading }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputValue.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="input-area">
      <div className="input-container">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about robotics concepts, summaries, or explanations..."
          disabled={isLoading}
          rows={1}
        />
        <button
          onClick={onSend}
          disabled={isLoading || !inputValue.trim()}
          className="send-button"
        >
          ➤
        </button>
      </div>
      <p className="disclaimer">AI Assistant connected to The Humanoid Robotics Course Curriculum</p>
    </div>
  );
}

export default function Chat() {
  const { siteConfig } = useDocusaurusContext();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello! I'm your AI assistant for ${siteConfig.title}. I'm ready to help you explore the Humanoid Robotics Course content.`,
      isUser: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const messagesEndRef = useRef(null);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        if (typeof fetch !== 'undefined') {
          const response = await fetch('/api/chat/start-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              initial_query: `Starting chat on /chat page`
            })
          });

          const data = await response.json();
          setSessionId(data.session_id || `session_${Date.now()}`);
        } else {
          setSessionId(`session_${Date.now()}`);
        }
      } catch (error) {
        console.warn('Chat API not available, using fallback session ID:', error.message);
        setSessionId(`session_${Date.now()}`);
      }
    };

    if (!sessionId) {
      initSession();
    }
  }, [sessionId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if fetch is available
      if (typeof fetch === 'undefined') {
        throw new Error('API calls not available in this environment');
      }

      const response = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.text,
          session_id: sessionId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error getting response');
      }

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        text: data.response,
        isUser: false
      };

      setMessages(prev => [...prev, aiMessage]);
      setSessionId(data.session_id || sessionId);
    } catch (error) {
      console.error('Chat API error:', error.message);

      // Create a direct, relevant error response
      const errorMessage = {
        id: Date.now() + 1,
        text: `I'm currently unable to access the course content to answer your question. This could be because:\n\n• The RAG backend service is not running\n• There's a connection issue to the content database\n• The course content hasn't been properly indexed\n\nIf you asked for a summary or specific information from the book, please try rephrasing your question or contact the administrator to ensure the backend services are running properly.`,
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="AI Robotics Assistant" description="Chat with our AI assistant for robotics education">
      <div className="chat-layout">
        {/* Sidebar - for history and navigation */}
        <div className="sidebar">
          <div className="sidebar-header">
            <button className="new-chat-button" onClick={() => setMessages([
              {
                id: 1,
                text: `Hello! I'm your AI assistant for ${siteConfig.title}. I can help you with:\n\n• Summarizing chapters or sections\n• Explaining specific concepts in detail\n• Finding key points and highlights\n• Answering questions about ROS 2, Digital Twins, NVIDIA Isaac, and VLA robotics\n• Providing code examples and explanations\n\nTo get the most accurate answers, please ask specific questions about the course content.`,
                isUser: false
              }
            ])}>
              ➕ New Chat
            </button>
          </div>
          <div className="chat-history">
            <h3>Recent Chats</h3>
            <div className="history-item active">Current Conversation</div>
            <div className="history-item">ROS 2 Fundamentals</div>
            <div className="history-item">Navigation Systems</div>
            <div className="history-item">NVIDIA Isaac Overview</div>
            <div className="history-item">VLA Robotics</div>
          </div>
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <div className="user-name">Student</div>
              <div className="user-role">Robotics Learner</div>
            </div>
          </div>
        </div>

        {/* Main conversation area */}
        <div className="conversation-area">
          <div className="messages-container">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg.text}
                isUser={msg.isUser}
              />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          <InputArea
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSend={handleSend}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Add custom styles to the page */}
      <style>{`
        .chat-layout {
          display: flex;
          height: calc(100vh - 60px);
          background: #f0f4f8;
        }

        .sidebar {
          width: 260px;
          background: #1a2a6c;
          color: white;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #2c3e50;
        }

        .sidebar-header {
          padding: 16px;
        }

        .new-chat-button {
          width: 100%;
          padding: 12px;
          background: #2a5298;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .new-chat-button:hover {
          background: #3a7bd5;
        }

        .chat-history {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }

        .chat-history h3 {
          padding: 8px 16px;
          margin: 0;
          font-size: 12px;
          text-transform: uppercase;
          color: #b8cfe0;
        }

        .history-item {
          padding: 10px 16px;
          cursor: pointer;
          font-size: 14px;
          border-left: 2px solid transparent;
        }

        .history-item:hover {
          background: #2a3c5f;
        }

        .history-item.active {
          background: #2a3c5f;
          border-left: 2px solid #3a7bd5;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-top: 1px solid #2c3e50;
        }

        .user-avatar {
          font-size: 24px;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-weight: bold;
        }

        .user-role {
          font-size: 12px;
          color: #b8cfe0;
        }

        .conversation-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #f9fbfd;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .chat-bubble {
          display: flex;
          gap: 12px;
          max-width: 85%;
        }

        .chat-bubble.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 18px;
          align-self: flex-start;
          margin-top: 4px;
        }

        .chat-bubble.user .avatar {
          background: #d1e4f7;
        }

        .chat-bubble:not(.user) .avatar {
          background: #e6f0fa;
        }

        .message-content {
          background: white;
          padding: 16px;
          border-radius: 18px;
          font-size: 15px;
          line-height: 1.5;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          border: 1px solid #e6eef5;
          max-width: calc(100% - 48px);
          white-space: pre-wrap;
        }

        .chat-bubble.user .message-content {
          background: #2a6bae;
          color: white;
          border-color: #2a6bae;
        }

        .typing-indicator {
          display: flex;
          gap: 12px;
          padding: 5px 0;
          align-items: center;
        }

        .typing-indicator .dots {
          display: flex;
          gap: 5px;
        }

        .typing-indicator span {
          width: 10px;
          height: 10px;
          background: #a0a0a0;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        .input-area {
          padding: 16px;
          background: #f9fbfd;
          border-top: 1px solid #e6eef5;
        }

        .input-container {
          display: flex;
          gap: 8px;
          padding: 8px;
          background: white;
          border-radius: 24px;
          border: 1px solid #d1dce6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .input-container textarea {
          flex: 1;
          border: none;
          outline: none;
          resize: none;
          font-size: 15px;
          padding: 8px 12px;
          max-height: 150px;
        }

        .send-button {
          background: #2a6bae;
          color: white;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-button:disabled {
          background: #a0a0a0;
          cursor: not-allowed;
        }

        .disclaimer {
          text-align: center;
          font-size: 11px;
          color: #888;
          margin-top: 8px;
          padding: 0 10px;
        }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }

        @media (max-width: 768px) {
          .chat-layout {
            flex-direction: column;
            height: auto;
          }

          .sidebar {
            width: 100%;
            height: auto;
          }
        }
      `}</style>
    </Layout>
  );
}