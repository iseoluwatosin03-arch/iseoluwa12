import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Profile } from '../types';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Define the shape of the data returned by our RPC function
type MatchWithOtherUser = {
    id: string;
    user1_id: string;
    user2_id: string;
    created_at: string;
    other_user: Profile; // The 'other_user' JSON object maps directly to the Profile type
}

const MatchesPage = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState<MatchWithOtherUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            if (!user) return;
            setLoading(true);

            // Explicitly type the expected return data from the RPC call
            const { data, error } = await supabase
                .rpc<MatchWithOtherUser>('get_matches_with_profiles', { p_user_id: user.id });

            if (error) {
                console.error("Error fetching matches:", error);
            } else {
                setMatches(data || []);
            }
            setLoading(false);
        };

        if (user) {
            fetchMatches();
        }
    }, [user]);

    if (loading) {
        return <div className="text-center py-10">Loading your matches...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-text mb-6">Your Matches</h2>
            {matches.length === 0 ? (
                <p className="text-gray-500 text-center bg-white p-8 rounded-lg shadow-md">You don't have any matches yet. Keep liking profiles!</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {matches.map(match => (
                        <div key={match.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center transform transition-transform hover:-translate-y-1">
                            <img src={match.other_user?.photo_url || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x400/FAD1E8/2D3748?text=No+Photo'} alt={match.other_user?.full_name || 'User'} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-brand-pink" />
                            <h3 className="font-bold text-lg">{match.other_user?.full_name}</h3>
                            <p className="text-gray-500 text-sm">You matched!</p>
                            <Link to={`/chat/${match.id}`} className="mt-4 bg-brand-primary text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-brand-primary-hover text-sm">
                                <MessageSquare size={16} />
                                <span>Chat</span>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MatchesPage;
