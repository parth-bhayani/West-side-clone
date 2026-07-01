import React, { useState, useRef, useEffect } from 'react';
import { BsChatDotsFill, BsXLg, BsSendFill } from 'react-icons/bs';
import { FiPackage, FiHelpCircle, FiRefreshCw, FiShoppingBag, FiHeart, FiShoppingCart } from 'react-icons/fi';
import axios from 'axios';
import './AIChatbot.css';

const quickActions = [
  { label: 'My Orders', icon: <FiPackage />, message: 'Show my recent orders' },
  { label: 'My Cart', icon: <FiShoppingCart />, message: 'What\'s in my cart?' },
  { label: 'Wishlist', icon: <FiHeart />, message: 'Show my wishlist' },
  { label: 'Trending', icon: <FiShoppingBag />, message: 'Show me trending products' },
  { label: 'Size Guide', icon: <FiHelpCircle />, message: 'Can you help me with size guide?' },
  { label: 'Returns', icon: <FiRefreshCw />, message: 'What is your return policy?' },
];

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi there! 👋 I\'m the West Side shopping assistant. I can show you your orders, cart, wishlist, trending products & more. How can I help?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Get auth token from localStorage
  const getAuthHeaders = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.token) {
          return { Authorization: `Bearer ${userData.token}` };
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
    return {};
  };

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage) return;

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const history = newMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await axios.post('/api/chat', {
        message: userMessage,
        history: history.slice(0, -1), // don't send the latest user msg twice
      }, {
        headers: getAuthHeaders(),
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment! 🙏',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (message) => {
    sendMessage(message);
  };

  // Format message content - handle newlines and bullet points
  const formatMessage = (content) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="ai-chatbot">
      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <BsChatDotsFill />
            </div>
            <div>
              <h4 className="chatbot-title">West Side Assistant</h4>
              <span className="chatbot-status">
                <span className="status-dot"></span>
                Online
              </span>
            </div>
          </div>
          <button
            className="chatbot-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <BsXLg />
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chatbot-message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-bubble">
                {formatMessage(msg.content)}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chatbot-message bot-message">
              <div className="message-bubble typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="chatbot-quick-actions">
            {quickActions.map((action, i) => (
              <button
                key={i}
                className="quick-action-btn"
                onClick={() => handleQuickAction(action.message)}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-area">
          <input
            ref={inputRef}
            type="text"
            className="chatbot-input"
            placeholder="Ask about orders, products..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
          />
          <button
            className="chatbot-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            <BsSendFill />
          </button>
        </div>
      </div>

      {/* Floating Button */}
      <button
        className={`chatbot-fab ${isOpen ? 'hide' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open chat assistant"
      >
        <BsChatDotsFill className="fab-icon" />
        <span className="fab-pulse"></span>
      </button>
    </div>
  );
};

export default AIChatbot;
