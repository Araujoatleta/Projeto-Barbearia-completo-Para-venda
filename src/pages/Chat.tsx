import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll for new messages every 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      // For clients, we'll get messages with admin
      const adminId = 1; // Assuming admin has ID 1
      const response = await axios.get(`http://localhost:3000/api/chat/messages/${adminId}`);
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const adminId = 1; // Assuming admin has ID 1
      await axios.post('http://localhost:3000/api/chat/send', {
        receiver_id: adminId,
        message: newMessage
      });

      setNewMessage('');
      fetchMessages(); // Fetch updated messages
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="text-[#c4a47c]">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">
          Live <span className="text-[#c4a47c]">Chat</span>
        </h1>

        <div className="card-luxury h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.sender_id === user.id
                      ? 'bg-[#c4a47c] text-white'
                      : 'bg-[#3c3c3c] text-gray-200'
                  }`}
                >
                  {message.sender_role === 'admin' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Bot className="h-5 w-5" />
                      <span className="font-semibold">Barbershop Admin</span>
                    </div>
                  )}
                  <p>{message.message}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {format(new Date(message.created_at), 'h:mm a')}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border-2 border-red-500/50 text-red-200 mx-4 mb-4 rounded-md">
              {error}
            </div>
          )}

          <div className="border-t border-[#3c3c3c] p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="input-luxury flex-1"
              />
              <button
                onClick={handleSend}
                className="btn-primary"
                disabled={!newMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;