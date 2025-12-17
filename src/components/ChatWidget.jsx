import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [hasError, setHasError] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const location = useLocation();

  // Function to get selected text
  useEffect(() => {
    const handleSelection = () => {
      const text = window.getSelection().toString().trim();
      if (text) {
        setSelectedText(text);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize session with error handling
  useEffect(() => {
    const initSession = async () => {
      try {
        // Check if fetch is available and API endpoint exists
        if (typeof fetch !== 'undefined') {
          const response = await fetch('/api/chat/start-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              initial_query: `Starting chat on page: ${location.pathname}`
            })
          });

          const data = await response.json();
          setSessionId(data.session_id || `session_${Date.now()}`);
        } else {
          // Fallback if fetch is not available
          setSessionId(`session_${Date.now()}`);
        }
      } catch (error) {
        console.warn('Chat API not available, using fallback session ID:', error.message);
        setSessionId(`session_${Date.now()}`);
        setHasError(true);
      }
    };

    if (!sessionId) {
      initSession();
    }
  }, [sessionId, location.pathname]);

  const askQuestion = async (question, highlightedText = null) => {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);

    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: highlightedText ? `About: "${highlightedText}"\nQuestion: ${question}` : question,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Check if fetch is available before making API calls
      if (typeof fetch === 'undefined') {
        throw new Error('API calls not available in this environment');
      }

      // Prepare the request based on whether it's a highlighted text question
      const endpoint = highlightedText ? '/api/chat/highlighted-ask' : '/api/chat/ask';
      const requestBody = {
        query: question,
        session_id: sessionId,
        highlighted_text: highlightedText
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error getting response');
      }

      // Add AI response to messages
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        sources: data.sources || [],
        grounded: data.grounded,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setSessionId(data.session_id || sessionId);
    } catch (error) {
      console.error('Chat API error:', error.message);

      // Create a direct, relevant error response
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I'm currently unable to access the course content to answer your question. This could be because:\n\n• The RAG backend service is not running\n• There's a connection issue to the content database\n• The course content hasn't been properly indexed\n\nIf you asked for a summary or specific information from the book, please try rephrasing your question or contact the administrator to ensure the backend services are running properly.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInputValue('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      askQuestion(inputValue.trim());
    }
  };

  const handleHighlightAsk = () => {
    if (selectedText) {
      askQuestion(`Can you explain this?`, selectedText);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // If there's an error that prevents rendering, return null to avoid breaking the page
  if (hasError && typeof window !== 'undefined' && window.location.pathname === '/') {
    return null; // Don't render if there's an error on the homepage
  }

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="chat-widget">
      {selectedText && (
        <div className="highlight-ask-prompt" onClick={handleHighlightAsk}>
          <span className="highlight-ask-icon">💬</span>
          Ask about selected text
        </div>
      )}

      {isOpen ? (
        <div className="chat-container">
          <div className="chat-header">
            <h3>🤖 AI Robotics Assistant</h3>
            <button className="chat-close" onClick={toggleChat}>×</button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <h4>Hello! I'm your AI assistant</h4>
                <p>Ask me about robotics concepts, summaries, or explanations from the course.</p>
                <p>Try asking: "Summarize ROS 2 fundamentals" or "Explain navigation in Nav2"</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${message.role}`}
                >
                  <div className="message-content">
                    {message.content}
                    {message.sources && message.sources.length > 0 && (
                      <div className="message-sources">
                        <small>Sources: {message.sources.slice(0, 3).join(', ')}</small>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="chat-message assistant">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about robotics concepts, summaries, or explanations..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      ) : (
        <button className="chat-toggle" onClick={toggleChat}>
          🤖 AI Assistant
        </button>
      )}
    </div>
  );
};

export default ChatWidget;