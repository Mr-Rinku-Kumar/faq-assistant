import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDarkMode } from './context/DarkModeContext';

const API_URL = 'http://localhost:5000/api';

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowHistory(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/history`);
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const searchHistory = async (query) => {
    if (!query.trim()) {
      fetchHistory();
      return;
    }
    
    try {
      const response = await axios.get(`${API_URL}/history/search?q=${query}`);
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchHistory(value);
  };

  // Streaming response handler
  const handleSubmitWithStreaming = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuestion = input.trim();
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userQuestion 
    }]);
    
    setInput('');
    setLoading(true);
    setIsStreaming(true);

    // Add placeholder for streaming response
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '',
      isStreaming: true 
    }]);

    try {
      const response = await fetch(`${API_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userQuestion }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsStreaming(false);
              // Refresh history after complete response
              fetchHistory();
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulatedResponse += parsed.text;
                // Update the streaming message
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === 'assistant') {
                    lastMessage.content = accumulatedResponse;
                    lastMessage.isStreaming = false;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = 'Sorry, streaming failed. Please try again.';
          lastMessage.isStreaming = false;
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  // Non-streaming fallback (for search/load)
  const handleSubmitNormal = async (question) => {
    try {
      const response = await axios.post(`${API_URL}/chat`, {
        question: question
      });

      if (response.data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.data.answer 
        }]);
        fetchHistory();
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    }
  };

  const handleSubmit = handleSubmitWithStreaming; // Use streaming by default

  const loadConversation = (conversation) => {
    setMessages([
      { role: 'user', content: conversation.question },
      { role: 'assistant', content: conversation.answer }
    ]);
    
    if (isMobile) {
      setShowHistory(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar - History */}
      <div className={`
        fixed md:relative z-50 h-full w-80 
        bg-white dark:bg-gray-900 
        border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${showHistory ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isMobile && !showHistory ? 'hidden md:block' : ''}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">📚 History</h2>
            {isMobile && (
              <button 
                onClick={() => setShowHistory(false)}
                className="text-2xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ×
              </button>
            )}
          </div>
          
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          {/* History List */}
          <div className="flex-1 overflow-y-auto p-3">
            {history.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-8">No conversations yet</p>
            ) : (
              history.map(conv => (
                <div
                  key={conv._id}
                  onClick={() => loadConversation(conv)}
                  className="p-3 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer 
                           hover:bg-purple-50 dark:hover:bg-purple-900/30 
                           hover:transform hover:translate-x-1 transition-all duration-200 
                           border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1 line-clamp-2">
                    {conv.question}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(conv.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {showHistory && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-4 
                      bg-white dark:bg-gray-800 shadow-sm">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="md:hidden text-2xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            ☰
          </button>
          <h1 className="flex-1 text-xl font-semibold text-gray-800 dark:text-white">
            🤖 AI FAQ Assistant
          </h1>
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 
                     text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 
                     transition duration-200"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button 
            onClick={clearChat}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 
                     hover:bg-gray-200 dark:hover:bg-gray-600 
                     text-gray-700 dark:text-gray-300 rounded-lg transition"
          >
            Clear Chat
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="max-w-md">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                  Welcome to AI FAQ Assistant!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Ask me anything - I'm here to help 24/7
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Try these questions:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["What is React?", "Explain JavaScript closures", "How does MongoDB work?"].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 
                                 hover:bg-purple-100 dark:hover:bg-purple-900/50 
                                 text-gray-700 dark:text-gray-300 rounded-full transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
                                  flex items-center justify-center text-white text-sm flex-shrink-0">
                      🤖
                    </div>
                  )}
                  <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    <div className={`px-4 py-2 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm'
                    }`}>
                      <p className="whitespace-pre-wrap break-words">
                        {msg.content}
                        {msg.isStreaming && (
                          <span className="inline-block w-2 h-4 ml-1 bg-purple-500 animate-pulse"></span>
                        )}
                      </p>
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                                  flex items-center justify-center text-white text-sm flex-shrink-0">
                      👤
                    </div>
                  )}
                </div>
              ))}
              {loading && !isStreaming && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
                                flex items-center justify-center text-white text-sm flex-shrink-0">
                    🤖
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4 
                                               bg-white dark:bg-gray-800">
          <div className="flex gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question here..."
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       disabled:bg-gray-100 dark:disabled:bg-gray-900"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-2 bg-purple-600 text-white rounded-full 
                       hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 
                       disabled:cursor-not-allowed transition duration-200 font-medium"
            >
              {loading ? 'Sending...' : 'Send →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;