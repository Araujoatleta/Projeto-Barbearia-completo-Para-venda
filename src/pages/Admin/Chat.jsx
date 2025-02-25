import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, User, Circle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const AdminChat = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
    const interval = setInterval(fetchClients, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchMessages(selectedClient.id);
      const interval = setInterval(() => fetchMessages(selectedClient.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedClient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/chat/clients');
      setClients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients');
      setLoading(false);
    }
  };

  const fetchMessages = async (clientId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/chat/messages/${clientId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedClient) return;

    try {
      await axios.post('http://localhost:3000/api/chat/send', {
        receiver_id: selectedClient.id,
        message: newMessage
      });

      setNewMessage('');
      fetchMessages(selectedClient.id);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#c4a47c]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12">
        Client <span className="text-[#c4a47c]">Messages</span>
      </h1>

      {error && (
        <div className="bg-red-900/20 border-2 border-red-500/50 text-red-200 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[600px]">
        {/* Clients List */}
        <div className="lg:col-span-1 card-luxury overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#3c3c3c]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-luxury w-full pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-[#2c2c2c] transition-colors ${
                  selectedClient?.id === client.id ? 'bg-[#2c2c2c]' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-[#3c3c3c] rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-[#c4a47c]" />
                  </div>
                  {client.unread_count > 0 && (
                    <Circle className="h-3 w-3 text-[#c4a47c] fill-current absolute -top-1 -right-1" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{client.name}</p>
                  <p className="text-sm text-gray-400">{client.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 card-luxury overflow-hidden flex flex-col">
          {selectedClient ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#3c3c3c]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#3c3c3c] rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-[#c4a47c]" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedClient.name}</p>
                    <p className="text-sm text-gray-400">{selectedClient.email}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
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
                      <p>{message.message}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {format(new Date(message.created_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a client to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;