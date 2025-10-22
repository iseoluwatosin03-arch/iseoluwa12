import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Message, Profile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const ChatPage = () => {
    const { matchId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!matchId || !user) return;

        const fetchMatchAndMessages = async () => {
            setLoading(true);
            // Fetch match details to identify the other user
            const { data: matchData, error: matchError } = await supabase
                .from('matches')
                .select('*, user1:profiles!matches_user1_id_fkey(*), user2:profiles!matches_user2_id_fkey(*)')
                .eq('id', matchId)
                .single();
            
            if (matchError || !matchData) {
                console.error("Error fetching match", matchError);
                setLoading(false);
                return;
            }

            const other = matchData.user1.id === user.id ? matchData.user2 : matchData.user1;
            setOtherUser(other);

            // Fetch initial messages
            const { data: messageData, error: messageError } = await supabase
                .from('messages')
                .select('*')
                .or(`(sender_id.eq.${user.id},receiver_id.eq.${other.id}),(sender_id.eq.${other.id},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            if (messageError) console.error("Error fetching messages", messageError);
            else setMessages(messageData || []);

            setLoading(false);
        };

        fetchMatchAndMessages();
        
        // Subscribe to new messages
        const subscription = supabase.channel(`chat:${matchId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const newMessage = payload.new as Message;
                // Check if the message belongs to this chat
                if ((newMessage.sender_id === user.id && newMessage.receiver_id === otherUser?.id) || (newMessage.sender_id === otherUser?.id && newMessage.receiver_id === user.id)) {
                    setMessages(currentMessages => [...currentMessages, newMessage]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };

    }, [matchId, user, otherUser?.id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user || !otherUser) return;
        
        const msg = {
            sender_id: user.id,
            receiver_id: otherUser.id,
            message: newMessage,
        };
        
        const { error } = await supabase.from('messages').insert(msg);
        if (error) console.error("Error sending message:", error);
        else setNewMessage('');
    };
    
    if (loading) return <div className="text-center py-10">Loading chat...</div>;
    if (!otherUser) return <div className="text-center py-10">Match not found.</div>;

    return (
        <div className="max-w-2xl mx-auto flex flex-col h-[75vh] bg-white rounded-lg shadow-xl">
            <div className="p-4 border-b flex items-center space-x-3">
                <img src={otherUser.photo_url || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x400/FAD1E8/2D3748?text=No+Photo'} alt={otherUser.full_name || ''} className="w-10 h-10 rounded-full object-cover" />
                <h2 className="text-xl font-bold">{otherUser.full_name}</h2>
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender_id === user?.id ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}>
                            {msg.message}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <button type="submit" className="ml-3 bg-brand-primary text-white p-3 rounded-full hover:bg-brand-primary-hover disabled:bg-gray-400" disabled={!newMessage.trim()}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default ChatPage;
