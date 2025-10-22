import React, { useState, useEffect, useCallback } from 'react';
import ProfileCard from '../components/ProfileCard';
import { Profile } from '../types';
import { Heart, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link, Navigate } from 'react-router-dom';

const DashboardPage = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfiles = useCallback(async () => {
        if (!user || !profile) return;
        setLoading(true);
        setError(null);

        try {
            // Fetch IDs of users the current user has already liked or skipped
            const { data: likedUsers, error: likedError } = await supabase
                .from('likes')
                .select('liked_user_id')
                .eq('user_id', user.id);

            if (likedError) throw likedError;
            const seenUserIds = likedUsers.map(l => l.liked_user_id);

            const { data, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .not('id', 'eq', user.id) // Exclude self
                .not('id', 'in', `(${seenUserIds.join(',')})`) // Exclude already seen users
                .neq('gender', profile.gender) // Opposite gender
                .not('full_name', 'is', null) // Ensure profile is set up
                .limit(10);

            if (profilesError) throw profilesError;
            
            setProfiles(data || []);
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user, profile]);

    useEffect(() => {
        if (!authLoading && user) {
            if (profile && profile.full_name) {
                fetchProfiles();
            }
        }
    }, [authLoading, user, profile, fetchProfiles]);

    const handleAction = async (action: 'like' | 'skip') => {
        if (!user || currentIndex >= profiles.length) return;

        const liked_user_id = profiles[currentIndex].id;
        
        // The handle_new_like function in Supabase will check for a match
        const { error } = await supabase
            .from('likes')
            .insert({ user_id: user.id, liked_user_id, type: action });

        if (error) {
            console.error('Error recording action:', error);
        }

        setCurrentIndex(prev => prev + 1);
    };

    if (authLoading || loading) {
        return <div className="text-center py-10">Loading profiles...</div>;
    }

    if (!profile?.full_name) {
        return (
             <div className="text-center py-10 bg-white shadow-md rounded-lg">
                <h2 className="text-2xl font-bold text-brand-text">Welcome to SoloParentLove!</h2>
                <p className="text-gray-600 mt-2 mb-4">Please complete your profile to start connecting with others.</p>
                <Link to="/profile-setup" className="bg-brand-primary text-white font-bold py-2 px-6 rounded-full hover:bg-brand-primary-hover">
                    Set Up Your Profile
                </Link>
            </div>
        );
    }
    
    if (error) {
        return <div className="text-center py-10 text-red-500">Error: {error}</div>;
    }

    if (currentIndex >= profiles.length) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700">No more profiles for now!</h2>
                <p className="text-gray-500 mt-2">Check back later for new recommendations.</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6 text-brand-text">Recommended For You</h2>
            <div className="relative">
                <ProfileCard profile={profiles[currentIndex]} />
                <div className="flex justify-center space-x-8 mt-6">
                    <button onClick={() => handleAction('skip')} className="bg-white p-4 rounded-full shadow-lg text-red-500 transform transition-transform hover:scale-110">
                        <X size={32} />
                    </button>
                    <button onClick={() => handleAction('like')} className="bg-white p-4 rounded-full shadow-lg text-green-500 transform transition-transform hover:scale-110">
                        <Heart size={32} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
